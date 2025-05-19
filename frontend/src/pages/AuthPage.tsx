// components/pages/AuthPage.tsx
import { AuthProvider } from "../contexts/AuthContext";
import { AuthHeader } from "../components/auth/AuthHeader";
import { AuthMessages } from "../components/auth/AuthMessages";
import { AuthSidebar } from "../components/auth/AuthSidebar";
import { AuthFormSection } from "../components/sections/AuthFormSection";

export default function AuthPage() {
  return (
    <AuthProvider>
      <div className="h-screen bg-background overflow-hidden">
        <AuthHeader />
        <AuthMessages />

        {/* Main Content */}
        <div className="h-full flex">
          <AuthSidebar />
          <AuthFormSection />
        </div>
      </div>
    </AuthProvider>
  );
}
