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
        bg: '#0E0F11',
        surface: '#161719',
        'surface-2': '#1E2023',
        border: 'rgba(255,255,255,0.07)',
        action: '#22C98A',
        'action-dim': 'rgba(34,201,138,0.12)',
        confirmed: '#22C98A',
        'confirmed-dim': 'rgba(34,201,138,0.12)',
        waiting: '#F5A623',
        'waiting-dim': 'rgba(245,166,35,0.12)',
        cancelled: '#E53E3E',
        'cancelled-dim': 'rgba(229,62,62,0.12)',
        'text-primary': '#FFFFFF',
        'text-secondary': '#8B8D93',
        'text-muted': '#5A5C63',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4)',
        'modal': '0 24px 64px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}

export default config
