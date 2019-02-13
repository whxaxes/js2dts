module.exports = {
  preset: 'ts-jest',
  setupTestFrameworkScriptFile: './jest.setup.js',
  testEnvironment: 'node',
  verbose: true,
  testMatch: [
    '**/tests/**/*.test.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'dist/dom.js'
  ]
};
