/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#F8FBFF",
        surface: "#FFFFFF",
        elevated: "#F0F5FA",
        border: "#E2E8F0",
        "border-strong": "#CBD5E1",
        accent: "#014751",
        "accent-dim": "#E6F2F4",
        success: "#00D37F",
        warning: "#D97706",
        danger: "#EF4444",
        info: "#D2C4FB",
        "text-primary": "#0F2830",
        "text-secondary": "#475569",
        "text-muted": "#94A3B8",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "accent-glow": "0 0 20px rgba(108, 99, 255, 0.25)",
      },
    },
  },
  plugins: [],
}