
import type {Config} from 'jest';

export const JEST_CONFIG: Config = {
    preset: 'ts-jest',
    verbose: true,
    testMatch: [ '**/*.spec.ts' ],
    collectCoverageFrom: [ '**/src/**/*.ts' ],
    // We will get here eventually
    coverageThreshold: {
        global: {
            branches: 75,
            functions: 75,
            lines: 75,
            statements: 75
        }
    }
};

export default JEST_CONFIG;
