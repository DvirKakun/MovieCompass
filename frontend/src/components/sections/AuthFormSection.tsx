import { AuthMobileHeader } from "../auth/AuthMobileHeader";
import { AuthModeToggle } from "../auth/AuthModeToggle";
import { AuthFormCard } from "../auth/AuthFormCard";
import { AuthFooter } from "../auth/AuthFooter";
import { AuthMobileModeSwitch } from "../auth/AuthMobileModeSwitch";

export function AuthFormSection() {
  return (
    <div className="w-full lg:w-1/2 h-full flex flex-col">
      <AuthMobileHeader />
      <AuthModeToggle />

      {/* Form Container - Scrollable */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center p-2 lg:p-4 overflow-y-auto">
        <div className="w-full max-w-md">
          <AuthFormCard />
          <AuthFooter />
          <AuthMobileModeSwitch />
        </div>
      </div>
    </div>
  );
}
