import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: '#f5f7fa',
          100: '#e4ebf5',
          200: '#cbdcf0',
          300: '#a4c4e8',
          400: '#76a6dc',
          500: '#5487d1',
          600: '#406cc3',
          700: '#3456a4',
          800: '#2e4986',
          900: '#293e6b',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 10px 40px -10px rgba(0,0,0,0.08)',
      }
    }
  },
  plugins: []
};

export default config;
