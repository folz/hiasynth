module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "airbnb",
    "airbnb/hooks",
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "import/no-default-export": "error",
    "import/prefer-default-export": "off",
    "react/require-default-props": "off",
    "@typescript-eslint/no-use-before-define": ["error", "nofunc"],
  },
};
