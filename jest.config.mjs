/** @type {import('jest').Config} */
const config = {
  verbose: true,
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "NodeNext",
          moduleResolution: "NodeNext",
          target: "ES2022",
          esModuleInterop: true,
          strict: true,
        },
      },
    ],
  },
  testMatch: ["**/*.test.ts", "**/*.test.mts", "**/*.test.mjs", "**/*.test.js"],
};

export default config;
