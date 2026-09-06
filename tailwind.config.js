// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}" // in case additional dirs are added later
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB", // indigo-600
        secondary: "#10B981", // emerald-500
        background: "#F9FAFB", // gray-50
        surface: "#FFFFFF", // white card surface
        muted: "#6B7280", // gray-500
        success: "#22C55E", // green-500
        warning: "#F59E0B", // amber-500
        error: "#EF4444", // red-500
        focus: "#93C5FD" // indigo-300 for focus ring
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        md: "0.75rem"
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"
      }
    }
  },
  plugins: []
};
