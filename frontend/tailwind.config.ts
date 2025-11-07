import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
   extend: {
  colors: {
    base: { bg: "#0b0d10", card: "#0f1217", border: "#1a1f2a", text: "#e6eaf2", mute: "#9aa4b2" },
    brand: { 50: "#eef2ff", 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5" },
    mint:  { 400: "#34d399", 500: "#10b981" },
    amber: { 400: "#f59e0b" },
    rose:  { 400: "#fb7185" }
  },
  borderRadius: { xl: "14px", "2xl": "20px", pill: "9999px" },
  boxShadow: {
    soft: "0 8px 30px rgba(0,0,0,.35)",
    glass: "0 1px 0 rgba(255,255,255,.05) inset, 0 8px 30px rgba(0,0,0,.35)"
  },
  backdropBlur: { xs: "2px" }
  },
  },
 
  plugins: []
};

export default config;
