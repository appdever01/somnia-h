import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bluetheme: "var(--bluetheme)",
        blueground: "var(--blueground)",
      },
      fontFamily: {
        patrick: ['"Patrick Hand"', 'cursive'],
        unkempt: ['Unkempt', 'cursive'],
        chicle: ['Chicle', 'serif'],
        love: ['"Love Ya Like A Sister"', 'cursive'],
        akaya: ['"Akaya Kanadaka"', 'system-ui'],
        rubik: ['"Rubik Burned"', 'system-ui'],
      },
    },
  },
  plugins: [],
} satisfies Config;
