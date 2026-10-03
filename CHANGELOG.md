# Changelog

## 2.5.0

### Added

- **DTCG 2025.10 input**: `$value`, `$type` with inheritance from groups, object `dimension` and `color`
  (sRGB → hex / `rgba()`, other color spaces → `oklch()`, `color(display-p3 …)`), `fontFamily` arrays,
  `duration`, `cubicBezier`, `border`, `transition`. The legacy `value` format gives the same output as before.
- Composite `typography` → text style `--text-<name>` / `fontSize: [size, { … }]` without the `mixin` field.
- Composite `shadow`, including multi-layer and `inset`.
- Groups by structure: breakpoints (`screen.lg.{min,max}`, `screen.sm`) and keyframes
  (`keyframes.<name>.<frame>.<prop>`) no longer need `mixin`. Explicit name: `$extensions["dev.prosazhin.mixin"]`.
- Any number of themes (`light`, `dark`, `high-contrast`, …) and `themes.default`.
  A config with only `light`/`dark` gives the same output as before.
- Programmatic API: `build()` from `tailwind-dictionary` and `generate()` from `tailwind-dictionary/generate`
  (no `fs`, works in the browser).
- TypeScript types.
- JSON Schema of the config: `"$schema": "./node_modules/tailwind-dictionary/schema/config.schema.json"`.
- `--watch` (`-w`): rebuild when token files or the config change (only token folders are watched, not the whole project).
- Clear errors: broken references, `typography` without `fontSize`, mixed `value`/`$value` — with the token path
  and the file name, without a stack trace. Unknown `$type` and theme tokens missing in one of the themes are warnings.

### Fixed

- The `output` folder is created recursively (`ENOENT` when it did not exist).
- Tokens with the value `0` are no longer dropped in v4.
- v3 with themes: only semantic tokens are replaced with `var()` (by token path). Before, any token with the same
  value as a semantic one was replaced too (`white` → `var(--color-background)`).
- A file path in `source` (`"tokens/base.json"`) works. An error is shown only when no file matches any glob:
  `No token files matched: …`.
- Tokens are resolved in memory: no `cache/` folder inside `node_modules`, parallel builds don't interfere,
  read-only `node_modules` is fine.
- Missing or broken config: one line with the path, exit code 1.
- `version` other than `3` or `4` (e.g. `3.5`) falls back to the default `4` with a message, as for other invalid values.
- `commander` and `chalk` are runtime dependencies now (works with pnpm). `fs-extra` is no longer used.
- v4: a typography property that Tailwind `--text-*` does not support (e.g. `font-family`) is skipped with
  a warning instead of overwriting `--text-<name>`.

### Changed

- v4 `theme.css`: `@theme` blocks are indented, `@keyframes` are multi-line (whitespace only).

## 2.3.2

- Author URL updated to prosazhin.dev.

## 2.3.1

- Link to the documentation in README.

## 2.3.0

- `[data-theme='light']` block in the generated `theme.css`: forced light theme on `<html>` and light containers
  inside a dark page.

## 2.2.0

- Semantic tokens in v4 via `@theme inline` and plain CSS variables `--<prefix>-<key>-<name>`; `themes.prefix`.
