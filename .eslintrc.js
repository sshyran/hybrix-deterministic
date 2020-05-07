module.exports = {
  'plugins': ['standard','jsdoc'],
  'env': {
    'browser': true,
    'es6': true,
    'node': true
  },
  'extends': [
    'semistandard',
    'plugin:jsdoc/recommended'
  ],
  'parserOptions': {
    'sourceType': 'module'
  },
  'rules': {
    'no-undef': 1,
    'no-global-assign': 1,
    'no-unused-vars': 1,
    'camelcase': 1,
    'no-var': 1,
    'no-eval': 0,
    'object-curly-spacing': 0,
    'no-throw-literal': 0,
    'no-new-func': 0,
    'new-cap': 0,
    'no-template-curly-in-string': 0,
    "jsdoc/check-param-names": 2, // Recommended
    "jsdoc/check-types": 2, // Recommended
    "jsdoc/require-description-complete-sentence": 2,
    "jsdoc/require-jsdoc": 2, // Recommended
    "jsdoc/require-param": 2, // Recommended
    "jsdoc/require-param-description": 1, // Recommended
    "jsdoc/require-param-name": 1, // Recommended
    "jsdoc/require-param-type": 2, // Recommended
    "jsdoc/require-returns": 2, // Recommended
    "jsdoc/require-returns-check": 2, // Recommended
    "jsdoc/require-returns-description": 1, // Recommended
    "jsdoc/require-returns-type": 2, // Recommended
    "jsdoc/valid-types": 2 // Recommended
  }
};
