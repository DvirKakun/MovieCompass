import { useAuth } from "../../contexts/AuthContext";

export function AuthMobileHeader() {
  const { state } = useAuth();

  return (
    <div className="lg:hidden p-2 text-center">
      <h1 className="text-lg font-heading font-bold text-foreground">
        MovieCompass
      </h1>
      <p className="text-xs text-secondary">
        {state.isLogin ? "Welcome back!" : "Join our community"}
      </p>
    </div>
  );
}
