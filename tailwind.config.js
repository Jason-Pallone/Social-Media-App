module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fill: (theme) =>({
      red: theme('colors.reg.primary')
    }),
    colors: {
      white: '#ffffff',
      blue: {
        medium: '#005c98'
      },
      black: {
        light: '#005c98',
        faded: '#00000059'
      },
      grey: {
        base: '#616161',
        background: '#fafafa',
        primary: '#dbdbdb'
      },
      red: {
        primary:'#ed4956'
      }
    },
    extend: {},
  },
  plugins: [],
}
