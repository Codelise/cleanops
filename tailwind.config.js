/** @type {import('tailwindcss').Config} */
export const darkMode = "class";
export const content = [
  "./public/**/*.html", // All HTML files
  "./src/**/*.js", // Your JS files
];
export const theme = {
  extend: {
    colors: {
      // Primary palette (adjust to match your design)
      primary: "#f9f506", // Yellow from your design
      "primary-light": "#fefbcc",
      "primary-dark": "#d8d205",

      // Your CleanOps brand colors
      "forest-green": "#228b22",
      "trust-blue": "#0056b3",
      "action-orange": "#FF8C00", // Add this for CTAs

      // Background colors from your design
      "background-light": "#f8f8f5",
      "background-dark": "#23220f",

      // Text colors
      "text-light": "#181811",
      "text-dark": "#ffffff",
    },
    fontFamily: {
      display: ["Spline Sans", "sans-serif"],
      body: ["Inter", "system-ui", "sans-serif"], // Add Inter as fallback
    },
    borderRadius: {
      DEFAULT: "1rem",
      lg: "2rem",
      xl: "3rem",
      full: "9999px",
    },
    animation: {
      "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      "bounce-slow": "bounce 2s infinite",
    },
  },
};
export const plugins = [
  require("@tailwindcss/forms"),
  require("@tailwindcss/typography"),
];
