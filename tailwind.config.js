/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        card: '#1a1a1a',
        'card-foreground': '#ffffff',
        primary: '#4ecdc4',
        'primary-foreground': '#0a0a0a',
        secondary: '#2a2a2a',
        'secondary-foreground': '#ffffff',
        muted: '#3a3a3a',
        'muted-foreground': '#6b7280',
        accent: '#4ecdc4',
        'accent-foreground': '#0a0a0a',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        border: '#2a2a2a',
        input: '#1a1a1a',
        ring: '#4ecdc4',
      },
    },
  },
  plugins: [],
};
