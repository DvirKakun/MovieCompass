import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useUser } from "../../contexts/UserContext";

export default function UserAvatar() {
  const { state } = useUser();
  const currentUser = state.user;

  // Generate initials from user's name
  const getInitials = () => {
    if (!currentUser) return <User className="h-4 w-4" />;

    const firstName = currentUser.firstName || "";
    const lastName = currentUser.lastName || "";

    if (!firstName && !lastName) return <User className="h-4 w-4" />;

    const initials = `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase();
    return initials;
  };

  return (
    <Avatar className="h-8 w-8 bg-primary/20 hover:bg-primary/30 transition-colors">
      <AvatarFallback className="text-xs font-medium text-primary">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
