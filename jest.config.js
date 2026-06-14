export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jest-environment-node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/lib/'],
  coverageDirectory: 'test/.coverage/',
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx'],
  moduleNameMapper: {
    '^(\\.\\.?\\/.+)\\.jsx?$': '$1'
  },
  transform: {
    '^.+\\.[jt]sx?$': [
      'ts-jest',
      {
        useESM: true,
        // tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },

};
