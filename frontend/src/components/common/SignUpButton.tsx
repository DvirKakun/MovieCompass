import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface SignUpButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function SignUpButton({
  className,
  children = "Sign Up",
  ...props
}: SignUpButtonProps & React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "bg-brand-primary text-background font-semibold px-6 py-2 hover:bg-cta_hover transition-colors duration-200",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
