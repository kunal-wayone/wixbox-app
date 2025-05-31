/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins",'sans-serif'],
        inter: ["Inter",'sans-serif'],
        // Remove platformSelect — it's not valid here
        system: ["ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
