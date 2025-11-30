import 'dotenv/config';

export default {
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/back-end/utils",
    "/back-end/queries/(?!Review\\.js$)",
    "/back-end/middlewares/(?!authenticateToken\\.js$)"
  ],

  // active la collecte de coverage
  collectCoverage: true,

  coverageThreshold: {
    global: {
      branches: 40,
      functions: 70,
      lines: 60,
      statements: 50
   }
  }
};