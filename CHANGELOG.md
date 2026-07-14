# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.3.0](https://github.com/devopsgroup-io/veeva/compare/v4.2.0...v4.3.0) (2026-07-14)


### Bug Fixes

* **build-preview:** include the veevaThumbsTask function call ([aab5629](https://github.com/devopsgroup-io/veeva/commit/aab562971b448bedc46a5b009d99774797a4d234))
* **screenshot:** copy thumbnails into shared assets folder ([86a4bad](https://github.com/devopsgroup-io/veeva/commit/86a4bad6e9dea3c2b76a397b179d813b8f8c525e))

## [4.2.0](https://github.com/devopsgroup-io/veeva/compare/v4.1.0...v4.2.0) (2026-07-13)


### Features

* **build-preview:** allow for optional setting - previewURLDefault - to be passed through the build-preview function. ([0a32a08](https://github.com/devopsgroup-io/veeva/commit/0a32a08773474aa4cc00fca8c99bfec25dd89701))

## [4.1.0](https://github.com/devopsgroup-io/veeva/compare/v4.0.0...v4.1.0) (2026-07-13)


### Bug Fixes

* **build-preview:** include the veevaThumbsTask function call ([66f7d6a](https://github.com/devopsgroup-io/veeva/commit/66f7d6aea3fdb48a2c9123f8a931842cab7db1c1))

## [4.0.0](https://github.com/devopsgroup-io/veeva/compare/v3.2.0...v4.0.0) (2026-06-26)


### Features

* add build-preview task ([2f0ec2b](https://github.com/devopsgroup-io/veeva/commit/2f0ec2bffd52be240ee3aee49ae579024d7064f3))
* replace Gulp with native Node.js and update all dependencies ([596c42f](https://github.com/devopsgroup-io/veeva/commit/596c42fbc606bcb1aad5e0a3ad56317a36fe3332))


### Bug Fixes

* **ci:** update release workflow for Node 22 and modern action versions ([c45d4b1](https://github.com/devopsgroup-io/veeva/commit/c45d4b187cb7d54e489f8717e4f48ebd22d477fb))
* correcting paths ([1c47507](https://github.com/devopsgroup-io/veeva/commit/1c47507b7bb41c5c14bbaec71be0e08d1866c24f))
* remove github action and keep this manual ([686f738](https://github.com/devopsgroup-io/veeva/commit/686f73820162b797821d46fc95e08eb10d1eb016))

## 3.2.0 (2026-06-18)


### Features

* update puppeteer version ([10092ec](https://github.com/devopsgroup-io/veeva/commit/10092ec))



## 3.1.0 (2025-08-01)


### Features

* Allow for passing custom Handlebars Helpers based on helpers path ([408eb38](https://github.com/devopsgroup-io/veeva/commit/408eb38))



## [3.0.0](https://github.com/devopsgroup-io/veeva/compare/v2.0.0-alpha.10...v3.0.0) (2025-08-01)


### Features

* **build:** overhaul build system and dependencies for Node 18+ ([25c89f7](https://github.com/devopsgroup-io/veeva/commit/25c89f7))


### BREAKING CHANGES

* **build:** - Dropped support for Node < 18
- Replaced Gulp v3 with Gulp v4.0.2 (requires task syntax update to `series/parallel`)
- Replaced Assemble with Handlebars via `gulp-hb`
- Replaced deprecated `node-sass` with `sass` (dart-sass)
- Removed Phantom; adopted Puppeteer v21.11.0
- Updated usage of `gulp-filter` to version 7+ using merge-stream
- Reorganized asset pipeline and CLM template rendering



## [2.0.0-alpha.10](https://github.com/devopsgroup-io/veeva/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) (2021-06-04)


### Bug Fixes

* Ensure file exists before attempting to take a screenshot. ([82c8670](https://github.com/devopsgroup-io/veeva/commit/82c8670))
* Replacing the vinyl-ftp module with the basic-ftp module. ([cb7ab76](https://github.com/devopsgroup-io/veeva/commit/cb7ab76))


### Features

* Pass through device object for taking screenshots. Will default to iPad based on Puppeteer's device descriptors. ([29412b7](https://github.com/devopsgroup-io/veeva/commit/29412b7))



## [2.0.0-alpha.9](https://github.com/devopsgroup-io/veeva/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) (2019-08-02)


### Bug Fixes

* **deploy:** Use configuration ftp rootPath for uploading assets. ([d5cb3d5](https://github.com/devopsgroup-io/veeva/commit/d5cb3d5))



## [2.0.0-alpha.8](https://github.com/devopsgroup-io/veeva/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2019-08-01)


### Bug Fixes

* Allow for loading local files when creating screenshots and wait for the page to load before taking screenshot. ([bf13727](https://github.com/devopsgroup-io/veeva/commit/bf13727))
* Allow for single key message stage/deploy. ([e111a11](https://github.com/devopsgroup-io/veeva/commit/e111a11))
* exclude hidden files. ([2efdff3](https://github.com/devopsgroup-io/veeva/commit/2efdff3))
* Override vinyl-ftp _mkfirp function to avoid file detection/rejection on symbolic links. ([6fc5249](https://github.com/devopsgroup-io/veeva/commit/6fc5249))
* Update temp image directories and include error reporting in the console. ([7968632](https://github.com/devopsgroup-io/veeva/commit/7968632))
* working through a memory lek with assemble. ([8a7593d](https://github.com/devopsgroup-io/veeva/commit/8a7593d))


### Features

* Add new veeva screenshots command ([a7af3cd](https://github.com/devopsgroup-io/veeva/commit/a7af3cd))
* Include error reporting in the console. ([aaee767](https://github.com/devopsgroup-io/veeva/commit/aaee767))
* Include shared assets as part of the staging and/or deploying process. Also, correct the util logging function calls. ([3367b6e](https://github.com/devopsgroup-io/veeva/commit/3367b6e))
* Look for clm.yml files and pass along the options in the workflow. ([20542c5](https://github.com/devopsgroup-io/veeva/commit/20542c5))
* Updating project to use eslinting. ([fc1f5ff](https://github.com/devopsgroup-io/veeva/commit/fc1f5ff))



<a name="2.0.0-alpha.7"></a>
# [2.0.0-alpha.7](https://github.com/devopsgroup-io/veeva/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2018-10-30)


### Features

* Update sass library to gulp-sass ([978c9ff](https://github.com/devopsgroup-io/veeva/commit/978c9ff))



<a name="2.0.0-alpha.6"></a>
# [2.0.0-alpha.6](https://github.com/devopsgroup-io/veeva/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2018-10-25)



<a name="2.0.0-alpha.5"></a>
# [2.0.0-alpha.5](https://github.com/devopsgroup-io/veeva/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2018-10-25)


### Features

* Look for passed clm data file, and if it exists, pass the key messages through the workflow. ([faca61c](https://github.com/devopsgroup-io/veeva/commit/faca61c))



<a name="2.0.0-alpha.4"></a>
# [2.0.0-alpha.4](https://github.com/devopsgroup-io/veeva/compare/v2.0.0...v2.0.0-alpha.4) (2018-10-24)



<a name="2.0.0-alpha.3"></a>
# [2.0.0-alpha.3](https://github.com/devopsgroup-io/veeva/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2017-11-02)


### Bug Fixes

* **Handlebar Helpers:** Correct registering helpers and add required libraries outside of module. ([8d738ff](https://github.com/devopsgroup-io/veeva/commit/8d738ff))



<a name="2.0.0-alpha.2"></a>
# [2.0.0-alpha.2](https://github.com/devopsgroup-io/veeva/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2017-11-02)



<a name="2.0.0-alpha.1"></a>
# [2.0.0-alpha.1](https://github.com/devopsgroup-io/veeva/compare/v1.1.0-alpha.0...v2.0.0-alpha.1) (2017-11-02)

<a name="1.1.0-alpha.0"></a>
# [1.1.0-alpha.0](https://github.com/devopsgroup-io/veeva/compare/v1.0.0...v1.1.0-alpha.0) (2017-11-02)


### Bug Fixes

* **module:** Update commands and shrink banner. ([28c2dca](https://github.com/devopsgroup-io/veeva/commit/28c2dca))
* **module:** Update commands. ([bb72a07](https://github.com/devopsgroup-io/veeva/commit/bb72a07))
* **Travis CI:** Update supported node versions to test. ([a4cb375](https://github.com/devopsgroup-io/veeva/commit/a4cb375))
* formatting ([549fa3d](https://github.com/devopsgroup-io/veeva/commit/549fa3d))
* formatting. ([5eec0f4](https://github.com/devopsgroup-io/veeva/commit/5eec0f4))
* Mocha tests. ([6890f26](https://github.com/devopsgroup-io/veeva/commit/6890f26))
* remove veeva from command ([7bf82c4](https://github.com/devopsgroup-io/veeva/commit/7bf82c4))


### Features

* adding handlebar helpers for assemble process. ([8e5b66a](https://github.com/devopsgroup-io/veeva/commit/8e5b66a))
* adding watch & reload on changes to configuration.yml file. ([976eec7](https://github.com/devopsgroup-io/veeva/commit/976eec7))
* **module:** Add standard version module to handle change log automation. ([f27afc6](https://github.com/devopsgroup-io/veeva/commit/f27afc6))
* Introduce shared assets option. ([5231b01](https://github.com/devopsgroup-io/veeva/commit/5231b01))
* Update output logging and turn off gulp logging if —verbose flag is not present. ([d0bb96e](https://github.com/devopsgroup-io/veeva/commit/d0bb96e))


### Performance Improvements

* Update promise chain and global logging. ([802f712](https://github.com/devopsgroup-io/veeva/commit/802f712))
# Change Log
