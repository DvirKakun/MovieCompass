import { Button } from "../ui/button";
import { Link } from "react-scroll";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";
import SignUpButton from "../common/SignUpButton";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { to: "hero", label: "Home" },
    { to: "features", label: "Features" },
    { to: "about", label: "About" },
    { to: "contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 py-4 md:px-12">
        {/* Logo */}
        <div className="text-2xl font-heading font-bold text-primary">
          Movie<span className="text-brand">Compass</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              smooth
              duration={500}
              offset={-80}
              spy={true}
              activeClass="text-brand"
              onSetActive={() => setActiveSection(item.to)}
              className={cn(
                "cursor-pointer text-sm font-mediud  transition-colors duration-200 relative group",
                activeSection === item.to
                  ? "text-brand"
                  : " text-primary hover:text-brand"
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute left-0 bottom-[-4px] h-0.5 bg-brand-primary transition-all duration-300",
                  activeSection === item.to
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                )}
              ></span>
            </Link>
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-primary hover:text-brand hover:bg-transparent"
          >
            Login
          </Button>
          <SignUpButton />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-primary hover:text-cta_hover transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background backdrop-blur-md border-t border-border">
          <nav className="flex flex-col space-y-4 px-4 py-6">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                smooth
                duration={500}
                offset={-80}
                className="cursor-pointer text-primary hover:text-brand transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-3">
              <Button
                variant="ghost"
                className="w-full text-primary hover:text-cta_hover hover:bg-transparent justify-start"
              >
                Login
              </Button>
              <SignUpButton className="w-full" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
