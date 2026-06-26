# Veeva

[![NPM version](https://img.shields.io/npm/v/veeva.svg)](https://www.npmjs.com/package/veeva)

> A CLI and templating toolkit to streamline development of Veeva CLM Presentations.

If you're developing and managing multiple Veeva CLM projects, it can be time-consuming to manage consistent code and workflows. This package centralizes core functionality for building and deploying Veeva CLM Presentations.


---

## ✨ Features

* 📁 Centralized configuration via `configuration.yml`
* 🧩 Template and partial support using Handlebars
* 🎨 Sass compilation (minified and unminified)
* 🔗 Relative link conversion to `veeva:` protocol links
* 🖼️ Automatic screenshot, thumbnail, and zip generation
* 🧾 iRep control file generator
* 📄 Vault Multichannel Loader CSV file generator
* 🔁 Development mode with live reload and file watching

---

## 📘 Table of Contents

1. [Getting Started](#getting-started)
2. [File Structure](#file-structure)
3. [Working with Source Files](#working-with-source-files)
4. [Configuration Options](#configuration-options)
5. [CLI Tasks & Workflow](#cli-tasks--workflow)
6. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org) **v22 or later**

No other system-level dependencies are required. Image processing is handled internally by [sharp](https://sharp.pixelplumbing.com/).

### Installation

```bash
npm install veeva --save
```

---

## 📁 File Structure

Place the following structure in your project root directory:

```
root/
├── app/
│   ├── assets/
│   │   ├── scss/
│   │   └── js/
│   └── templates/
│       ├── data/
│       │   └── clm.yml
│       ├── includes/
│       ├── layouts/
│       └── pages/
│           ├── shared/
│           │   ├── fonts/
│           │   ├── images/
│           │   ├── isi.hbs
│           │   └── terms.hbs
│           ├── home/
│           ├── overview/
│           ├── resources/
│           └── sitemap/
├── configuration.yml
└── package.json
```

> Key Message naming convention: **product-name**-**key-message-name**

---

## 🧑‍💻 Working with Source Files

### Sass

* Located in `app/assets/scss`
* Entry point files (any `.scss` file not prefixed with `_`) are compiled to CSS
* Partial files (prefixed with `_`) are imported by entry points and not compiled directly
* Production builds are minified; development builds are unminified with live reload

### JavaScript

* Located in `app/assets/js`, split into three categories:

| Directory | Behaviour |
|-----------|-----------|
| `js/scripts/` | Concatenated and minified into `main.js` |
| `js/standalone/` | Copied individually (not concatenated) |
| `js/vendor/` | Concatenated and minified into `vendor.js` |

### Handlebars Templates

* Located in `app/templates`
* Supports [Handlebars Helpers](https://github.com/helpers/handlebars-helpers) and custom helpers
* Front matter (YAML) in `.hbs` files is merged with data files at compile time

---

## ⚙️ Configuration Options

### configuration.yml

Define Key Messages under the `clm` node:

```yaml
clm:
  product:
    name: 'Product-Name'
    suffix: '-'
  primary:
    name: 'CLM-Presentation-ID'
    key_messages:
      - key_message: 'home'
        description: 'Home'
        display_order: '0'
        slides:
          - slide: 'home'
            id: '0'
      - key_message: 'overview'
        description: 'Veeva Test Overview'
        display_order: '1'
        slides:
          - slide: 'Veeva Test Overview'
            id: '2-0'
      - key_message: 'sitemap'
        description: 'Sitemap'
        display_order: '2'
        slides:
          - slide: 'Sitemap'
            id: '0-1'
```

### Custom Paths

Update paths in `configuration.yml` as needed:

```yaml
paths:
  src: "app"
  dist: "build"
  deploy: "deploy"
  tmp: "build/.tmp"
  pages: "app/templates/pages"
  layouts: "app/templates/layouts"
```

> 💡 Tip: YAML files must use spaces (not tabs).

---

## 🛠️ CLI Tasks & Workflow

### Usage

```bash
veeva --help
```

### Common Tasks

| Command               | Description                                                       |
| --------------------- | ------------------------------------------------------------------|
| `veeva`               | Starts dev mode: builds, watches files, and reloads the browser   |
| `veeva build`         | Production build: compiles and minifies CSS, JS, and templates    |
| `veeva build-preview` | Builds and copies all files to `public/`; the first key message becomes `public/index.html` |
| `veeva deploy`        | Uploads zip and ctl files via FTP (requires FTP config)           |
| `veeva stage`         | Builds and packages each Key Message into zip and ctl files       |
| `veeva stage-vault`   | Generates Vault Multichannel Loader CSV file                      |
| `veeva screenshots`   | Captures screenshots via Puppeteer and outputs a PDF              |

### Options

| Option                     | Description                        |
| -------------------------- | ---------------------------------- |
| `-a`, `--all-key-messages` | Include hidden Key Messages        |
| `-c`, `--config`           | Show merged configuration          |
| `-d`, `--dry-run`          | Preview commands without execution |
| `-e`, `--debug`            | Output error tracebacks            |
| `-h`, `--help`             | Print help message                 |
| `-k`, `--key-message`      | Run tasks for a single Key Message |
| `-v`, `--version`          | Show version number                |
| `-V`, `--verbose`          | Enable verbose output              |

---

## 🧪 Troubleshooting & FAQ

* Requires Node.js v22 or later — check your version with `node --version`
* Ensure `configuration.yml` is valid YAML (use a linter if needed)
* Screenshots only process `.html` files; static assets like `.pdf` require manual thumbnails
* SCSS partials (files starting with `_`) are not compiled directly — they must be imported by a non-partial entry file

### Need Help?

Submit issues or feature requests via [GitHub Issues](https://github.com/devopsgroup-io/veeva/issues/new).

---

## 📄 License

[MIT](LICENSE)

---

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

> For more examples, see the [CLM Example Project](https://github.com/devopsgroup-io/veeva/tree/master/examples/clm).
