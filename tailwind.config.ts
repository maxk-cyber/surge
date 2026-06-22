import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#f2f2f2",
        primary: "#ffffff",
        secondary: "#a8a8a8",
        accent: "#d4d4d4",
        muted: "#161616",
        card: "#121212",
      },
      fontFamily: {
        display: ["var(--font-special-elite)", "serif"],
        body: ["var(--font-ibm-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
