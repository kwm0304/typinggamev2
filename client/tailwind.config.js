/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: ["light", "dark", 
      {
        monkeyType: {
          bgColor: "#323437",
          mainColor: "#e2b714",
          caretColor: "#e2b714",
          subColor: "#646669",
          subAltColor: "#2c2e31",
          textColor: "#d1d0c5",
          errorColor: "#ca4754",
          errorExtraColor: "#7e2a33",
          colorfulErrorColor: "#ca4754",
          colorfulErrorExtraColor: "#7e2a33",
        }
      }
    ], // you can change or add more
  },
};