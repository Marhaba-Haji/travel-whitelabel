import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AccessLevel = "none" | "view" | "edit";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isSuperadmin: boolean;
  isAdmin: boolean;
  mustChangePassword: boolean;
  permissions: Record<string, AccessLevel>;
  hasAccess: (module: string, level: AccessLevel) => boolean;
  setMustChangePassword: (v: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, AccessLevel>>({});

  const checkRoleAndFinishLoading = async (sessionData: Session | null) => {
    setSession(sessionData);
    setUser(sessionData?.user ?? null);

    if (sessionData?.user) {
      const userId = sessionData.user.id;

      // Run role checks in parallel to cut auth resolution time roughly in half
      const [saRes, adminRes] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "superadmin")
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle(),
      ]);
      const sa = !!saRes.data;
      const adm = !!adminRes.data;
      setIsSuperadmin(sa);
      setIsAdmin(adm);

      if (adm && !sa) {
        // Fetch admin_users record
        const { data: adminUserData } = await supabase
          .from("admin_users")
          .select("id, is_active, must_change_password")
          .eq("user_id", userId)
          .maybeSingle();

        if (adminUserData) {
          setMustChangePassword(adminUserData.must_change_password);

          // Fetch permissions
          const { data: permData } = await supabase
            .from("admin_user_permissions")
            .select("module, access_level")
            .eq("admin_user_id", adminUserData.id);

          const permMap: Record<string, AccessLevel> = {};
          if (permData) {
            permData.forEach((p: any) => {
              permMap[p.module] = p.access_level as AccessLevel;
            });
          }
          setPermissions(permMap);

          // If inactive, sign out
          if (!adminUserData.is_active) {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setIsAdmin(false);
            setPermissions({});
          }
        }
      } else {
        setMustChangePassword(false);
        setPermissions({});
      }
    } else {
      setIsSuperadmin(false);
      setIsAdmin(false);
      setMustChangePassword(false);
      setPermissions({});
    }
    setLoading(false);
  };

  const hasAccess = (module: string, level: AccessLevel): boolean => {
    if (isSuperadmin) return true;
    const userLevel = permissions[module];
    if (!userLevel || userLevel === "none") return false;
    if (level === "view") return userLevel === "view" || userLevel === "edit";
    if (level === "edit") return userLevel === "edit";
    return false;
  };

  useEffect(() => {
    const clearInvalidSession = async () => {
      await supabase.auth.signOut({ scope: "local" });
      checkRoleAndFinishLoading(null);
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const msg = String(event.reason?.message ?? "");
      if (msg.includes("Invalid Refresh Token") || msg.includes("Refresh Token Not Found")) {
        event.preventDefault();
        clearInvalidSession();
      }
    };
    window.addEventListener("unhandledrejection", onRejection);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        checkRoleAndFinishLoading(session);
      }
    );

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        checkRoleAndFinishLoading(session);
      })
      .catch((err) => {
        const msg = String(err?.message ?? "");
        if (msg.includes("Invalid Refresh Token") || msg.includes("Refresh Token Not Found")) {
          clearInvalidSession();
        } else {
          checkRoleAndFinishLoading(null);
        }
      });

    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsSuperadmin(false);
    setIsAdmin(false);
    setPermissions({});
    setMustChangePassword(false);
  };

  return (
    <AuthContext.Provider value={{
      session, user, loading, isSuperadmin, isAdmin, mustChangePassword,
      permissions, hasAccess, setMustChangePassword, signIn, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
