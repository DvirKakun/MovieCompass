import { useAuth } from "../../contexts/AuthContext";

interface AuthFormTitleProps {
  isMobile?: boolean;
}

export function AuthFormTitle({ isMobile = false }: AuthFormTitleProps) {
  const { state } = useAuth();

  const className = isMobile
    ? "lg:hidden text-center mb-2"
    : "hidden lg:block text-center mb-4";

  const headingClassName = isMobile
    ? "text-lg font-heading font-bold text-foreground"
    : "text-xl font-heading font-bold text-foreground";

  return (
    <div className={className}>
      <h2 className={headingClassName}>
        {state.isLogin ? "Login" : "Create Account"}
      </h2>
    </div>
  );
}
