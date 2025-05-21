import { useEffect, useRef, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bookmark, Star, LogOut } from "lucide-react";
import { useUser } from "../../contexts/UserContext";

interface UserMenuProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  buttonRef: React.RefObject<HTMLButtonElement>; // ← add
}

interface MenuItem {
  label: string;
  icon: JSX.Element;
  onClick: (e: React.MouseEvent) => void;
}

export default function UserMenu({
  isOpen,
  setIsOpen,
  buttonRef,
}: UserMenuProps) {
  const navigate = useNavigate();
  const { logout } = useUser();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus(); // return focus to trigger
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, setIsOpen, buttonRef]);

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    logout();
    navigate("/auth?mode=login");
  };

  const menuItems: MenuItem[] = [
    {
      label: "Your Profile",
      icon: <User className="h-4 w-4 mr-2" />,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(false);
        navigate("/profile");
      },
    },
    {
      label: "Your Watchlist",
      icon: <Bookmark className="h-4 w-4 mr-2" />,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(false);
        navigate("/watchlist");
      },
    },
    {
      label: "Your Ratings",
      icon: <Star className="h-4 w-4 mr-2" />,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(false);
        navigate("/ratings");
      },
    },
    {
      label: "Logout",
      icon: <LogOut className="h-4 w-4 mr-2" />,
      onClick: handleLogout,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            {menuItems.map((item, index) => (
              <motion.button
                key={index}
                className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10 flex items-center"
                onClick={item.onClick}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
