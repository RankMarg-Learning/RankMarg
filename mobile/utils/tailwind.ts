import { create } from "twrnc";

// Create a simplified config for twrnc (removes web-specific properties)
const twrncConfig = {
  theme: {
    extend: {
      colors: {
        // RankMarg brand colors
        primary: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B", // Main brand color
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        // Custom theme colors
        background: {
          light: "#FFFFFF",
          dark: "#151718",
        },
        card: {
          light: "#FFFFFF",
          dark: "#1F2937",
        },
        border: {
          light: "#E5E7EB",
          dark: "#374151",
        },
        text: {
          light: "#11181C",
          dark: "#ECEDEE",
        },
        muted: {
          light: "#9CA3AF",
          dark: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
};

// create the customized version...
const tw = create(twrncConfig);

// ... and then this becomes the main function your app uses
export default tw;
