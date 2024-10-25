import type { Config } from "tailwindcss";
const withMT = require("@material-tailwind/react/utils/withMT");

const config: Config = withMT({
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "path-to-your-node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "path-to-your-node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          light: "#F5F5F5",
          dark: "#121212",
        },
        star: {
          light: "#B0B0B0",
          dark: "#6E6E6E",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-text": "linear-gradient(90deg, #9499FF 0%, #E7AF65 100%)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        "heading-1-thin": ["68px", { lineHeight: "68px", fontWeight: "100" }],
        "heading-1-regular": [
          "46px",
          { lineHeight: "68px", fontWeight: "400" },
        ],
        "hero-thin": ["86px", { lineHeight: "96px", fontWeight: "100" }],
        "hero-regular": ["86px", { lineHeight: "96px", fontWeight: "400" }],
        "hero-medium": ["86px", { lineHeight: "96px", fontWeight: "500" }],
        "hero-bold": ["86px", { lineHeight: "96px", fontWeight: "700" }],
        "heading-1-medium": ["46px", { lineHeight: "68px", fontWeight: "500" }],
        "heading-1-bold": ["46px", { lineHeight: "68px", fontWeight: "700" }],
        "heading-2-thin": ["38px", { lineHeight: "56px", fontWeight: "100" }],
        "heading-2-regular": [
          "38px",
          { lineHeight: "56px", fontWeight: "400" },
        ],
        "heading-2-medium": ["38px", { lineHeight: "56px", fontWeight: "500" }],
        "heading-2-bold": ["38px", { lineHeight: "56px", fontWeight: "700" }],
        "heading-3-thin": ["32px", { lineHeight: "48px", fontWeight: "100" }],
        "heading-3-regular": [
          "32px",
          { lineHeight: "48px", fontWeight: "400" },
        ],
        "heading-3-medium": ["32px", { lineHeight: "48px", fontWeight: "500" }],
        "heading-3-bold": ["32px", { lineHeight: "48px", fontWeight: "700" }],
        "heading-4-thin": ["28px", { lineHeight: "40px", fontWeight: "100" }],
        "heading-4-regular": [
          "28px",
          { lineHeight: "40px", fontWeight: "400" },
        ],
        "heading-4-medium": ["28px", { lineHeight: "40px", fontWeight: "500" }],
        "heading-4-bold": ["28px", { lineHeight: "40px", fontWeight: "700" }],
        "heading-5-thin": ["24px", { lineHeight: "36px", fontWeight: "100" }],
        "heading-5-regular": [
          "24px",
          { lineHeight: "36px", fontWeight: "400" },
        ],
        "heading-5-medium": ["24px", { lineHeight: "36px", fontWeight: "500" }],
        "heading-5-bold": ["24px", { lineHeight: "36px", fontWeight: "700" }],
        "body-15pt-thin": ["15px", { lineHeight: "22px", fontWeight: "100" }],
        "body-15pt-regular": [
          "15px",
          { lineHeight: "22px", fontWeight: "400" },
        ],
        "body-15pt-medium": ["15px", { lineHeight: "22px", fontWeight: "500" }],
        "body-15pt-bold": ["15px", { lineHeight: "22px", fontWeight: "700" }],
        "body-12pt-thin": ["12px", { lineHeight: "18px", fontWeight: "100" }],
        "body-12pt-regular": [
          "12px",
          { lineHeight: "18px", fontWeight: "400" },
        ],
        "body-12pt-medium": ["12px", { lineHeight: "18px", fontWeight: "500" }],
        "body-12pt-bold": ["12px", { lineHeight: "18px", fontWeight: "700" }],
        "caption-thin": ["10px", { lineHeight: "14px", fontWeight: "100" }],
        "caption-regular": ["10px", { lineHeight: "14px", fontWeight: "400" }],
        "caption-medium": ["10px", { lineHeight: "14px", fontWeight: "500" }],
        "caption-bold": ["10px", { lineHeight: "14px", fontWeight: "700" }],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
});

export default config;
