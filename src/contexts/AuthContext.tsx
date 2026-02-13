import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isSuperadmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  const checkRoleAndFinishLoading = async (sessionData: Session | null) => {
    setSession(sessionData);
    setUser(sessionData?.user ?? null);
    if (sessionData?.user) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sessionData.user.id)
        .eq("role", "superadmin")
        .maybeSingle();
      setIsSuperadmin(!!data);
    } else {
      setIsSuperadmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        checkRoleAndFinishLoading(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkRoleAndFinishLoading(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsSuperadmin(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isSuperadmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
