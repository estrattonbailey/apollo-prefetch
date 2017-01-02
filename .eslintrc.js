const OFF = 0
const ERROR = 2

module.exports = {
  'extends': 'standard',
  'plugins': [
    'react'
  ],
  'rules': {
    'comma-dangle': [ERROR, 'always-multiline'],
    'jsx-quotes': [ERROR, 'prefer-double'],
    'quotes': [ERROR, 'single', {avoidEscape: true, allowTemplateLiterals: true }],
    'no-unused-vars': OFF,
  }
}
