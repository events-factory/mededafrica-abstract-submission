import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#165fac',
          50: '#e6f0f9',
          100: '#cce1f3',
          200: '#99c3e7',
          300: '#66a5db',
          400: '#3387cf',
          500: '#165fac',
          600: '#124c8a',
          700: '#0e3967',
          800: '#092645',
          900: '#051322',
          light: '#52b2e4',
        },
        'accent-green': '#bbd758',
        'accent-red': '#ef4545',
      },
    },
  },
  plugins: [],
}
export default config
