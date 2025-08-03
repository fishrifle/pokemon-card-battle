// .eslintrc.js
module.exports = {
  extends: [
    "next/core-web-vitals", // or whatever you already extend
  ],
  rules: {
    // turn a rule off entirely:
    "react-hooks/exhaustive-deps": "off",
    // soften a rule to a warning:
    "@typescript-eslint/no-explicit-any": "warn",
    // make it an error explicitly (usually implicit if you omit):
    "no-console": "error",
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        // disable only for TS/TSX files
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
  ],
};
