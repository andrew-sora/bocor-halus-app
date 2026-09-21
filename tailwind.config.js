/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        green: {
          dark: "#2F6F4F",
          light: "#4A9E73",
        },
        ink: "#1F2933",
        muted: "#8D9AA5",
        danger: "#C0392B",
      },
    },
  },
  plugins: [],
};
