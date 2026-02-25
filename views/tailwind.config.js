/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Exact palette from design-system screenshot ────────────────────
        primary: {
          50:  "#e6f5f9",
          100: "#c0e6f1",
          200: "#8fd4e8",
          300: "#52bedd",
          400: "#1aadd2",
          500: "#0E93B1",   // ← brand teal
          600: "#0b7d98",
          700: "#086878",
          800: "#064f5c",
          900: "#033542",
        },
        success: {
          50:  "#ebf5e7",
          100: "#cce8c4",
          200: "#a5d595",
          300: "#7bc264",
          400: "#5ab43d",
          500: "#45A72D",   // ← brand green
          600: "#3a8f26",
          700: "#2e771f",
          800: "#235f17",
          900: "#17470f",
        },
        danger: {
          50:  "#fff1f2",
          100: "#ffe4e6",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        warning: {
          50:  "#fffbeb",
          100: "#fef3c7",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        surface: {
          50:  "#F5F5F5",   // ← page background
          100: "#efefef",
          200: "#e0e0e0",
          300: "#cccccc",
          400: "#9e9e9e",
          500: "#636363",
          600: "#4a4a4a",
          700: "#383838",
          800: "#2E2E2E",
          900: "#1a1a1a",
        },
      },
      fontFamily: {
        sans:    ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "title-1": ["20px", { lineHeight: "28px", fontWeight: "700" }],
        "title-2": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "body-lg": ["15px", { lineHeight: "22px", fontWeight: "400" }],
        body:      ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["11px", { lineHeight: "16px", fontWeight: "400" }],
      },
      boxShadow: {
        card:    "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
        sidebar: "2px 0 16px rgba(14,147,177,0.18)",
        topbar:  "0 1px 6px rgba(0,0,0,0.06)",
        modal:   "0 24px 64px rgba(0,0,0,0.18)",
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.25rem",
      },
    },
  },
  plugins: [],
};