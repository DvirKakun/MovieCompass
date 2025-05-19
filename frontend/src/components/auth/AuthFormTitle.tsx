import { useAuth } from "../../contexts/AuthContext";

export function AuthFormTitle() {
  const { state } = useAuth();

  return (
    <>
      {/* Mobile Title */}
      <div className="lg:hidden text-center mb-2">
        <h2 className="text-lg font-heading font-bold text-foreground">
          {state.isLogin ? "Login" : "Create Account"}
        </h2>
      </div>

      {/* Desktop Title */}
      <div className="hidden lg:block text-center mb-4">
        <h2 className="text-xl font-heading font-bold text-foreground">
          {state.isLogin ? "Login" : "Create Account"}
        </h2>
      </div>
    </>
  );
}
