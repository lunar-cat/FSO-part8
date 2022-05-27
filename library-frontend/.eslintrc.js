/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    es6: true,
    'jest/globals': true
  },
  extends: [
    'react-app',
    'react-app/jest',
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['react', 'jest'],
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    eqeqeq: 'error',
    'no-trailing-spaces': 'error',
    'object-curly-spacing': ['error', 'always'],
    'arrow-spacing': ['error', { before: true, after: true }],
    'no-console': 0,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 'off',
    'require-await': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
