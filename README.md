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

Ensure the following dependencies are installed:

* [Node.js](https://nodejs.org)
* [ImageMagick](https://imagemagick.org/script/download.php)

  * **macOS:** `brew install imagemagick`
  * **Ubuntu:** `apt-get install imagemagick`
  * **Windows:** [Download](https://imagemagick.org/script/binary-releases.php)

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
* Compiles to minified and unminified CSS

### JavaScript

* Located in `app/assets/js`

### Handlebars Templates

* Located in `app/templates`
* Supports [Handlebars Helpers](https://github.com/helpers/handlebars-helpers)

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

| Command             | Description                                                         |
| ------------------- | --------------------------------------------------------------------|
| `veeva`             | Starts dev mode: builds, watches, reloads                           |
| `veeva build`       | Production build: compiles/minifies everything                      |
| `veeva deploy`      | Uploads zip/ctl files via FTP (requires config)                     |
| `veeva stage`       | Builds + generates zip/ctl files per Key Message                    |
| `veeva screenshots` | Generates screenshots based clm.yml config file and outputs a PDF   |
| `veeva vault-stage` | Generates Vault Multichannel CSV file                               |

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

* Make sure you're using a compatible Node.js version (check `package.json`)
* Ensure `configuration.yml` is valid YAML (use a linter if needed)
* Screenshots only process `.html` files; static assets like `.pdf` require manual thumbnails

### Need Help?

Submit issues or feature requests via [GitHub Issues](https://github.com/devopsgroup-io/veeva/issues/new).

---

## 📄 License

[MIT](LICENSE)

---

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

> For more examples, see the [CLM Example Project](https://github.com/devopsgroup-io/veeva/tree/master/examples/clm).
