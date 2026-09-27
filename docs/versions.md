# Updating Versions of Java and/or node

## Updating the Java version

When updating the version of Java used, the following places need to be adjusted:

* `Versions` section of the README.md
* `pom.xml` file
* `.java-version` file (used by Github Actions scripts)
* `Dockerfile` used for deploying on Dokku

## Updating the node version

Places that name the node version:

* `Versions` section of the README.md
* `engines` section in `frontend/package.json` (also used by Github Actions: the shared workflows in
  `ucsb-cs156/workflows` and the Chromatic workflows call `actions/setup-node` with
  `node-version-file: frontend/package.json`, so no workflow edit is needed)
* `pom.xml`: the `app.frontend.nodeVersion` property, used by `frontend-maven-plugin`
  (adjust the npm version too if it is pinned there). The `Dockerfile` gets node through
  that plugin, so it does not name a version itself.

Then check `grep -rIn "<old version>" --exclude-dir=node_modules --exclude-dir=target .` for anything else.

After changing the version, if a local `mvn` build fails in `npm ci` with
`Class extends value undefined is not a constructor or null`, delete `target/node` and
`target/node_modules` (stale npm from the previous node version left in the plugin's install dir).

### Updating frontend dependencies at the same time

Notes from the move to node 24.21.0
([issue #159](https://github.com/ucsb-cs156/proj-dining/issues/159); the same update was first done in
[proj-courses #355](https://github.com/ucsb-cs156/proj-courses/issues/355) /
[PR #356](https://github.com/ucsb-cs156/proj-courses/pull/356), whose notes cover some
dependencies this repo does not have, e.g. recharts and fontawesome):

* `npm audit`, `npm outdated` and `npm ci 2>&1 | grep deprecated` show what needs attention.
  Remove dependencies that are not imported anywhere (`nyc`, `webpack`, `web-vitals`, and
  `@babel/plugin-proposal-private-property-in-object` were unused here).
* If `npm install` fails with a confusing `ERESOLVE` after editing versions, regenerate:
  `rm -rf node_modules package-lock.json && npm install`.
* npm 11 blocks dependency install scripts by default (`npm warn install-scripts ...`). After
  reviewing the listed packages, `npm install-scripts approve --all` in `frontend/` and commit the
  resulting `allowScripts` block in `package.json` (here: `@swc/core`, `esbuild`, `fsevents`, `msw`).
  The msw postinstall regenerates `public/mockServiceWorker.js`; commit that too.
* Verify with all of: `npm run lint`, `npm run check-format`, `npm test`, `npm run build`,
  `npm run build-storybook`, a Stryker run reproducing the CI command on the files CI will mutate
  (see below), and a `mvn -Pproduction` build. Unit tests alone do not catch Storybook or Stryker
  breakage.
* Breaking changes hit in this repo:
  * Storybook 10 + msw-storybook-addon 3: `initialize()` and the root `mswLoader` export are gone.
    Use `mswLoader` from `msw-storybook-addon/csf3` and *call* it in `loaders`, and list
    `msw-storybook-addon` in `addons` in `.storybook/main.mjs`. This repo passes a custom
    service-worker URL (for the deployed Storybook), which is now done by passing a setup function
    to `mswLoader` that calls `setupWorker()`/`worker.start()` itself. Caught only by
    `npm run build-storybook`, not by unit tests.
  * `storybook-addon-remix-react-router` needed major 7 for Storybook 10 (its v7 also dropped the
    `only-allow pnpm` preinstall script that npm 11 flagged on v5).
  * vite 8 (Rolldown) cannot load a CJS `vite.config.js` that imports the ESM-only
    `rollup-plugin-visualizer` 7: the config is now `vite.config.mjs` (update the `pom.xml`
    up-to-date check's `<include name="vite.config.mjs" />`); use `import.meta.dirname` instead of
    `__dirname` and `rolldownOptions` instead of `rollupOptions`.
  * The vite 8 toolchain maps v8 coverage differently (more branches counted), which surfaced a
    pre-existing uncovered branch in `StatisticsIndexPage.jsx` (no `STATISTICS_PAGES` entry has
    `comingSoon` ≠ `false`); a test mocking the constants was added. Expect `npm test` to newly
    fail 100%-coverage thresholds on code that was "100%" under the old counting.
  * eslint-plugin-react-hooks 7: use `configs.flat.recommended` (not `configs["recommended-latest"]`);
    two new React Compiler rules (`set-state-in-effect`, `immutability`) flagged existing code and
    are turned off in `eslint.config.mjs`.
  * `@vitest/eslint-plugin` (even an in-range update) newly flagged `vitest/no-conditional-expect`
    in fixture-driven test loops (inline-disabled) and `vitest/no-standalone-expect` on a real
    pre-existing bug: an `expect` outside any `test()` in `currentUser.test.jsx` (fixed).
  * @testing-library/jest-dom went 5 → 7 with no code changes (no `extend-expect` imports existed;
    the setup file imports `@testing-library/jest-dom` which still works).
* Held back on purpose:
  * `vitest`/`@vitest/coverage-v8` stay on 4.x: with vitest 5 Stryker maps no tests to mutants, so
    every mutant survives (found in proj-courses by bisecting; not retried here).
  * `eslint`/`@eslint/js` stay on 9.x: `eslint-plugin-react` 7.37.5 crashes on ESLint 10
    (`context.getFilename is not a function`).
  * `react`/`react-dom` stay on 18 and `react-query` on 3: react-query 3 does not support React 19;
    moving to `@tanstack/react-query` is a separate migration. `react-query` 3 is also the source of
    the remaining `inflight`/`rimraf@3`/`glob@7` deprecation warnings.
  * `react-router` stays on 7.x: v8 came out in late 2025 and is a separate migration (proj-courses
    was done before v8 existed and is also on 7).
  * `react-table` stays on 7 (unmaintained; the replacement is `@tanstack/react-table`, a separate
    migration).
  * Stryker 10's new `CallExpression` mutator (deletes bare call statements like
    `setSomething(x)` in a handler) is excluded in `stryker.config.mjs`
    (`mutator.excludedMutations`), keeping the same mutation set as Stryker 9. Re-enabling it
    needs new tests that assert those calls happen.
* The PR mutation job (`33-frontend-pr-mutation-testing`) mutates every `src/main` file whose test
  file changed, and aborts if *any* test fails in its initial dry run — so a green `npm test` does
  not guarantee that job passes. Reproduce its file list locally:
  `git diff --name-only -r origin/main HEAD | grep "\.js" | sed 's|\(.*\)tests\(.*\)\.test.js|\1main\2.js|' | grep -v "\.stories\.js" | grep "src/main/" | sed 's|frontend/||' | sort -u`
  then `npx stryker run --mutate <comma-separated list>` in `frontend/`. A survivor that also
  survives on a clean `main` checkout is pre-existing, not caused by the upgrade.
