import type { Config } from "tailwindcss";

/**
 * Identidade visual do Restaurante Cacique:
 * fundo creme, marrom escuro e detalhes dourados,
 * inspirada no cardápio físico impresso.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FBF7EF",
          100: "#F7F0E3",
          200: "#EFE4CF",
          300: "#E4D3B3",
        },
        cacique: {
          brown: "#4A2C1A",
          "brown-dark": "#3A2113",
          "brown-soft": "#6B4A2F",
          gold: "#C9A227",
          "gold-soft": "#D9BC6B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(74, 44, 26, 0.08)",
        "card-hover": "0 4px 14px rgba(74, 44, 26, 0.14)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
