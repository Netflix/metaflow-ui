module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  endOfLine: 'auto',
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '^@/(.*)$',
    '^@pages/(.*)$',
    '^@components/(.*)$',
    '^@hooks/(.*)$',
    '^@utils/(.*)$',
    '^@assets/(.*)$',
    '^[./]',
  ],
  plugins: ['@trivago/prettier-plugin-sort-imports'],
};
