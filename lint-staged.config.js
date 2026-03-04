{
  "scripts": {
    "lint": "eslint .",
      "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,css,md}\""
  },
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
      "src/**/*.{css,md,json}": [
        "prettier --write"
      ]
  }
}
