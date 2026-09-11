import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#121E36",
          blue: "#0B2B6B",
          "blue-deep": "#081D4A",
          "blue-wash": "#EEF5FF",
          "blue-soft": "#DBE7FB",
          orange: "#EF7E20",
          cream: "#FBFAF7",
          slate: "#94A3B8",
        },
      },
      boxShadow: {
        "blue-sm": "0 2px 8px rgba(11,43,107,0.08)",
        "blue-md": "0 4px 24px rgba(11,43,107,0.12)",
        "blue-lg": "0 8px 40px rgba(11,43,107,0.18)",
        "blue-xl": "0 16px 64px rgba(11,43,107,0.22)",
      },
      keyframes: {
        "ticker-left": { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "marquee-left": { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "marquee-right": { from: { transform: "translateX(-50%)" }, to: { transform: "translateX(0)" } },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        ticker: "ticker-left var(--ticker-duration) linear infinite",
        marquee: "marquee-left var(--marquee-duration) linear infinite var(--marquee-direction)",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-playfair-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;