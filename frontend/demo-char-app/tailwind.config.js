// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {
//       colors: {
//         // Obsidian v2.4 Theme Palette
//         primary: "#c2c1ff",
//         "on-primary": "#2e2d5d",
//         surface: "#1e2023",
//         "on-surface": "#e1e2e7",
//         "surface-container-lowest": "#0b0e11",
//         "surface-container-low": "#191c1f",
//         "surface-container-high": "#272a2e",
//         "surface-container-highest": "#323539",
//         outline: "#90909a",
//         "outline-variant": "#45464f",
//         error: "#ffb4ab",
//         success: "#bacf93",
//       },
//       fontFamily: {
//         headline: ["Space Grotesk", "sans-serif"],
//         body: ["Inter", "sans-serif"],
//       },
//     },
//   },
//   plugins: [require("@tailwindcss/typography")],
// };

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#f8fafc",
        primary: "#818cf8",
        card: "#111113",
        muted: "#1e1e21",
        border: "rgba(255, 255, 255, 0.08)",
      },
    },
  },
  plugins: [require('@tailwindcss/typography'),],
}