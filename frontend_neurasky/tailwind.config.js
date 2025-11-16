module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Adjust as needed for your project
  ],
  theme: {
    extend: {
      colors: {
        // Ensure border colors are defined correctly
        border: '#e5e7eb', // You can set a custom color here
      },
    },
  },
  plugins: [],
}
