import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ChangePasswordPrompt from "@/components/admin/ChangePasswordPrompt";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isSuperadmin, isAdmin, mustChangePassword, setMustChangePassword } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isSuperadmin && !isAdmin) return <Navigate to="/" replace />;

  // Force password change for admin sub-users
  if (isAdmin && !isSuperadmin && mustChangePassword) {
    return <ChangePasswordPrompt onComplete={() => setMustChangePassword(false)} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
