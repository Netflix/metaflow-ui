module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'react-app',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react/display-name': 0,
    'react/prop-types': 0,
    "prettier/prettier": ["error",{
      "endOfLine": "auto"}
    ]
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
