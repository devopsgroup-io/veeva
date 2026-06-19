# Veeva — Claude Code Guide

## Commands

```bash
npm test              # Run mocha acceptance tests
npm run lint          # ESLint across all .js files
npm run lint:fix      # ESLint auto-fix on lib/**
node bin/veeva.js --help    # Smoke-test the CLI
node bin/veeva.js --config  # Verify config loading
```

The acceptance tests (`test/acceptance-tests.js`) run `bin/veeva.js --help` and `bin/veeva.js --config` via `child_process.exec` and assert exit code 0. They do not exercise build tasks — those require a user project with a valid `configuration.yml`.

## Architecture

`bin/veeva.js` is the CLI entry point. It:
1. Checks the Node.js version against `engines.node` in `package.json`
2. Calls `lib/veeva.js` → `lib/cli.js` (minimist arg parsing) + `lib/config.js` (deep-merge of `configuration.yml`, `app/templates/data/clm.yml`, and `lib/configuration.json` defaults) to produce an `options` object
3. Requires `lib/tasks/index.js` and calls `await tasks[command](options)`

There is no build tool. All task orchestration uses plain `async/await` and `Promise.all`.

### Task modules (`lib/tasks/`)

| File | Responsibility |
|------|---------------|
| `index.js` | Maps command strings to exported async functions |
| `assemble.js` | Compiles Handlebars templates → HTML; copies assets; writes `app.json` |
| `build.js` | SCSS → CSS (sass + clean-css); JS bundling (terser); calls assemble + screenshot thumbs |
| `clean.js` | Deletes `dist/` and `deploy/` directories |
| `deploy.js` | Zips key messages (archiver), uploads via FTP (basic-ftp), generates Vault CSV (json2csv) |
| `dev.js` | BrowserSync dev server + chokidar file watchers |
| `screenshot.js` | Puppeteer screenshots, sharp thumbnail resizing, PDFKit PDF output |
| `helpers/customHelpers.js` | Custom Handlebars helpers registered during assembly |
| `helpers/vault_fields.json` | Ordered field list for Vault CSV generation |

### Support modules (`lib/`)

| File | Responsibility |
|------|---------------|
| `config.js` | YAML loading and option merging |
| `cli.js` | Argument parsing (minimist) and help text |
| `veeva.js` | Config validation and top-level `execute()` |
| `utils.js` | Shared helpers: `getFiles`, `getDirectories`, `hasFile`, `setFile`, `mkFolder`, `log` |
| `log.js` | chalk-based logging helpers |
| `configuration.json` | Hardcoded default values (lowest config priority) |

## Configuration system

Config is merged in this order (later overrides earlier):

1. `lib/configuration.json` — hardcoded defaults
2. `configuration.yml` — user project root (paths, FTP, CRM settings)
3. `app/templates/data/clm.yml` — key messages, slides, product info
4. CLI arguments — highest priority

All task functions receive the merged `options` object. The `options.paths.*` fields determine source and output directories.

## Code conventions

- **CommonJS only** — `require`/`module.exports` throughout; no ESM syntax
- **ESLint** — config in `.eslintrc.js`: 2-space indent, single quotes, `prefer-const`, `arrow-parens: always`, `space-before-function-paren: always`
- **Task signature** — all top-level task functions are `async function name(options) { ... }`
- **File discovery** — use `glob.sync(pattern)` from the `glob` package
- **SCSS partials** — files whose basename starts with `_` are never compiled directly; they are imported by non-prefixed entry files
- **JS directories** — `js/scripts/` → concat+minify → `main.js`; `js/standalone/` → copy flat; `js/vendor/` → concat+minify → `vendor.js`

## Dependencies — do not use

These packages were removed and must not be re-introduced:

| Removed | Use instead |
|---------|-------------|
| `gulp` and all `gulp-*` plugins | Native `async/await`, packages below |
| `del` | `fs.rm(path, { recursive: true, force: true })` |
| `mkdirp` | `fs.mkdir(path, { recursive: true })` |
| `imagemagick` | `sharp` |
| `merge-stream` | `Promise.all()` |

## README maintenance

After completing any task that changes user-facing behaviour, update `README.md` before finishing.

| README section | Update when… |
|----------------|--------------|
| `✨ Features` | Feature added or removed |
| `🚀 Getting Started / Prerequisites` | Node.js version changed (`engines.node` in `package.json`) |
| `📁 File Structure` | Project directory layout changed |
| `🧑‍💻 Working with Source Files` | Sass, JS, or template conventions changed |
| `⚙️ Configuration Options` | `configuration.yml` or `clm.yml` keys changed |
| `🛠️ CLI Tasks & Workflow` | Commands or options table changed |
| `🧪 Troubleshooting & FAQ` | Version references or known gotchas changed |
