import 'dotenv/config';

export default {
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest"
  },
};
