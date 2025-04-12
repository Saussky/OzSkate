import type { Config } from "tailwindcss";
import lineClamp from '@tailwindcss/line-clamp'

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {},
  plugins: [lineClamp],
} satisfies Config;
