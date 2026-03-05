import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'tablet': '820px',
      },
      colors: {
        // One UI inspired colors
        'one-ui-blue': '#0077ff',
        'one-ui-background': {
          light: '#f4f7fa',
          dark: '#121212'
        },
        'one-ui-surface': {
          light: '#ffffff',
          dark: '#1e1e1e'
        }
      },
      borderRadius: {
        'one-ui': '28px',
        'one-ui-sm': '12px',
      },
      boxShadow: {
        'one-ui': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'one-ui-hover': '0 12px 40px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
};
export default config;
