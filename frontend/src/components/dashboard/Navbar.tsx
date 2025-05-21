import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "../ui/input";
import UserAvatar from "./UserAvatar";
import UserMenu from "./UserMenu";
import LogoComponent from "./LogoComponent";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // This will be implemented later
      console.log(`Searching for: ${searchQuery}`);
      // navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
            <motion.div
              className="flex items-center cursor-pointer"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserAvatar />
              <ChevronDown
                className={`ml-1 h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
              />
            </motion.div>

            <UserMenu isOpen={isUserMenuOpen} setIsOpen={setIsUserMenuOpen} />
          </div>
        </div>
      </div>
    </header>
  );
}
