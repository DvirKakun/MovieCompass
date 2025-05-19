import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

export function AuthHeader() {
  const navigate = useNavigate();

  return (
    <div className="absolute top-4 left-4 z-50">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="text-primary hover:text-primary/80"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>
    </div>
  );
}
