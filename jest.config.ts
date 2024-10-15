module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  transformIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
