export default {
  "src/**/*.{js,jsx,ts,tsx}": [
    "npx eslint --fix",
    "prettier --write"
  ],
  "src/**/*.{css,md,json}": [
    "prettier --write"
  ]
};
