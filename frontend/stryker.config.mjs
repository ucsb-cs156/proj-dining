// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
    _comment:
        "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.",
    packageManager: "npm",
    reporters: ["html", "clear-text", "progress"],
    testRunner: "vitest",
    mutate: ["src/main/**/*.js", "src/main/**/*.jsx"],
    testRunner_comment:
        "Take a look at https://stryker-mutator.io/docs/stryker-js/vitest-runner for information about the vitest plugin.",
    coverageAnalysis: "perTest",
    mutator_comment:
        "CallExpression (new in Stryker 10) is excluded to keep the same mutation set (and strictness) as Stryker 9; re-enabling it requires new tests for bare call statements. See https://github.com/ucsb-cs156/proj-dining/issues/159",
    mutator: { excludedMutations: ["CallExpression"] },
    thresholds: {
        high: 100,
        low: 100,
        break: 100,
    },
};
export default config;