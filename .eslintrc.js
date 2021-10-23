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
    "prefer-arrow-callback": "off",
    "import/no-default-export": "error",
    "import/prefer-default-export": "off",
    "react/jsx-props-no-spreading": "off",
    "react/require-default-props": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-use-before-define": ["error", "nofunc"],
    "@typescript-eslint/lines-between-class-members": [
      "error",
      "always",
      { exceptAfterSingleLine: true },
    ],
  },
};
