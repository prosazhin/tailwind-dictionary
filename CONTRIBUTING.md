# Contributing

1. `npm install`, then `npm test` (snapshot tests on `node --test`) and `npm run lint`. Types: `npm run test:types`.
2. A test case is a folder in `test/fixtures/<case>/` with `config.json` (`"output": "./expected"`), `tokens/` and the
   expected output `expected/`. To add one, run `node ../../../bin/tailwind-dictionary.js -c config.json` inside it,
   review `expected/` and describe the case in `test/fixtures/README.md`.
3. A change of the output must be intentional: update `expected/` in the same PR and explain the difference.
4. `lib/tokens/*`, `lib/utils/read-token-files.js` and `lib/utils/watch.js` are shared with
   [mixin-dictionary](https://github.com/prosazhin/mixin-dictionary): copy changes there too (tests in `test/tokens.test.js`).
5. Conventional Commits (`feat:`, `fix:`, `docs:` …).
