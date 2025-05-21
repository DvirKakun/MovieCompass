import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "../ui/input";
import UserAvatar from "./UserAvatar";
import UserMenu from "./UserMenu";
import LogoComponent from "./LogoComponent";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null!);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // This will be implemented later
      console.log(`Searching for: ${searchQuery}`);
      // navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <LogoComponent />

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search movies, actors, genres..."
                  className="pl-10 bg-background/50 border-border focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* User Avatar & Menu */}
          <div className="relative">
            <motion.button
              ref={menuBtnRef}
              className="flex items-center focus:outline-none"
              onClick={toggleMenu}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              aria-label="User menu"
            >
              <UserAvatar />
              <ChevronDown
                className={`ml-1 h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            <UserMenu
              isOpen={isMenuOpen}
              setIsOpen={setIsMenuOpen}
              buttonRef={menuBtnRef}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
