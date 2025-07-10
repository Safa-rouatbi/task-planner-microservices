/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        conflict: '#FFBABA',
        
        paper: '#f6f2ea',     
        ink: '#221f1a',         
        charcoal: '#26231d',   
        muted: '#7a7263',      
        line: '#ddd5c4',        
        'line-dark': '#3a362c',
        accent: '#a15c3e',     
        'accent-dark': '#7c4730',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
