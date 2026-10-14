/** @type {import('tailwindcss').Config} */
const svgToDataUri = require('mini-svg-data-uri')

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        wideDesktop: '1305px', // 1272 container + 32px padding
      },
    },
    extend: {
      screens: {
        '3xl': '1920px', // Custom breakpoint
      },
      backgroundSize: {
        full: '100% 100%',
      },
      backgroundImage: theme => ({
        'multiselect-caret': `url("${svgToDataUri(
          `<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M5.99999 7.42016C5.78493 7.42016 5.56989 7.33805 5.40592 7.17416L0.246193 2.01438C-0.0820337 1.68615 -0.0820337 1.15399 0.246193 0.825896C0.574286 0.497803 1.10634 0.497803 1.43459 0.825896L5.99999 5.39156L10.5654 0.826056C10.8936 0.497962 11.4256 0.497962 11.7537 0.826056C12.0821 1.15415 12.0821 1.68631 11.7537 2.01454L6.59406 7.17432C6.43001 7.33823 6.21497 7.42016 5.99999 7.42016Z" fill="white"/> </svg>`,
        )}")`,
        'multiselect-spinner': `url("${svgToDataUri(
          `<svg viewBox="0 0 512 512" fill="${theme('colors.green.500')}" xmlns="http://www.w3.org/2000/svg"><path d="M456.433 371.72l-27.79-16.045c-7.192-4.152-10.052-13.136-6.487-20.636 25.82-54.328 23.566-118.602-6.768-171.03-30.265-52.529-84.802-86.621-144.76-91.424C262.35 71.922 256 64.953 256 56.649V24.56c0-9.31 7.916-16.609 17.204-15.96 81.795 5.717 156.412 51.902 197.611 123.408 41.301 71.385 43.99 159.096 8.042 232.792-4.082 8.369-14.361 11.575-22.424 6.92z"></path></svg>`,
        )}")`,
        'multiselect-remove': `url("${svgToDataUri(
          `<svg viewBox="0 0 320 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z"></path></svg>`,
        )}")`,
        'custom-gradient': 'linear-gradient(180deg, #EF8012 0%, #CB3F08 100%)',
        'product-card-gradient':
          'linear-gradient(180deg, #120B0B 0%, #CFC9C9 50%, #120B0B 100%)',

        'product-card-gradient2':
          'linear-gradient(180deg, #120B0B 0%, rgba(27, 20, 19, 0.930769) 15.87%, rgba(38, 31, 30, 0.843077) 33.17%, rgba(118, 112, 105, 0.2) 100%)',
        'footer-gradient':
          'linear-gradient(to right, #34160D 0%, #D8D0C6 50%, #34160D 100%)',
        'addtocart-btn-gradient':
          'linear-gradient(90deg, rgba(216, 208, 198, 0.2) 0%, rgba(216, 208, 198, 0.06) 25%, rgba(18, 11, 11, 0) 50.05%, rgba(216, 208, 198, 0.06) 75.11%, rgba(216, 208, 198, 0.2) 100%)',
        'addtocart-btn-gradient2':
          'linear-gradient(90deg, #D8D0C6 0%, rgba(38, 35, 30, 0) 38.88%, rgba(18, 11, 11, 0) 50.55%, rgba(38, 35, 30, 0) 61.73%, #D8D0C6 101.1%)',
      }),
      gridTemplateColumns: {
        'auto-fill-225': 'repeat(auto-fill, minmax(225px, 1fr))',
        'auto-fill-100': 'repeat(auto-fill, minmax(100px, 1fr))',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        primary: ['Metal Mania', 'system-ui'],
        secondary: ['Caesar Dressing', 'system-ui'],
        tertiary: ['Skranji', 'system-ui'],
      },
      borderRadius: {
        large: '20px',
        small: '8px',
      },
      colors: {
        primary: '#fff',
        secondary: '#D8D0C6',
        accent: '#00EEFF',
        border: '#03001B1A',
        success: '#00BA00',
        error: '#FF383C',
        warning: '#DF3D15',
        info: '#5277D1',
        filter: '#AEABAB',
        placeholder: '#03001B80',
      },
      backgroundColor: theme => ({
        primary: theme('colors.primary'),
        secondary: theme('colors.secondary'),
        accent: theme('colors.accent'),
        success: theme('colors.success'),
        error: theme('colors.error'),
        warning: theme('colors.warning'),
        info: theme('colors.info'),
        filter: '#181716',
      }),
    },
  },
  plugins: [],
}
