/**
 * Minimal Tailwind v4 config — created manually because the Tailwind CLI binary
 * isn't present in node_modules (npx couldn't determine executable to run).
 */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
