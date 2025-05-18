/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens with direct values for better IDE support
        border: "#333333",
        input: "#404040",
        ring: "#FFFFFF",
        background: "#000000", // Direct value instead of hsl(var(--background))
        foreground: "#FFFFFF", // Direct value instead of hsl(var(--foreground))
        card: "#121212",
        "card-foreground": "#FFFFFF",
        popover: "#1A1A1A",
        "popover-foreground": "#FFFFFF",
        primary: "#21D07A", // Direct value instead of hsl(var(--primary))
        cta_hover: "#1db976",
        "primary-foreground": "#FFFFFF",
        secondary: "#262626",
        "secondary-foreground": "#E6E6E6",
        muted: "#333333",
        "muted-foreground": "#999999",
        accent: "#404040",
        "accent-foreground": "#FFFFFF",
        destructive: "#EF4444",
        "destructive-foreground": "#FAFAFA",

        // Brand colors
        brand: {
          primary: "#21D07A", // TMDB Green
          rating: "#F5C518", // IMDb Gold
        },

        // Background theme colors
        theme: {
          DEFAULT: "#000000",
          dark: "#121212",
        },
      },
      // Text colors
      textColor: {
        primary: "#FFFFFF", // White text
        secondary: "#B3B3B3", // Gray text
        brand: "#21D07A", // Green text (your brand color)
        rating: "#F5C518", // Gold text (for ratings)
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
