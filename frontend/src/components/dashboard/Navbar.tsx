import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, X } from "lucide-react";
import { Input } from "../ui/input";
import UserAvatar from "./UserAvatar";
import UserMenu from "./UserMenu";
import LogoComponent from "./LogoComponent";
import { useMovies } from "../../contexts/MoviesContext";
import { Button } from "../ui/button";

interface NavbarProps {
  onSearchModeChange?: (isSearching: boolean) => void;
}

export default function Navbar({ onSearchModeChange }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null!);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const { clearSearch, setSearchQuery: setSearchQueryContext } = useMovies();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // If empty, clear immediately
    if (searchQuery.trim() === "") {
      clearSearch();
      onSearchModeChange?.(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchQueryContext(searchQuery.trim());
      // await fetchSearchPage(searchQuery.trim(), 1);
      onSearchModeChange?.(true);
    }, 500); // debounce delay

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // await fetchSearchPage(searchQuery.trim(), 1);
      onSearchModeChange?.(true);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    clearSearch();
    onSearchModeChange?.(false);
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
                  type="text"
                  placeholder="Search movies, actors, genres..."
                  className="pl-10 pr-8 bg-background/50 border-border focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
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
