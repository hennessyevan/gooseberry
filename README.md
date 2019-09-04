<div align="center">
  <br>
  <br>
	<img src="Gooseberry@2x.png" width="300" alt="Gooseberry: Smart Mongoose Seeding Tool">
	<br>
	<br>
  <br>
	<br>
</div>

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/gooseberry.svg)](https://npmjs.org/package/gooseberry)
[![Downloads/week](https://img.shields.io/npm/dw/gooseberry.svg)](https://npmjs.org/package/gooseberry)
[![License](https://img.shields.io/npm/l/gooseberry.svg)](https://github.com/hennessyevan/gooseberry/blob/master/package.json)

<!-- toc -->
* [Development](#development)
* [Methodology](#methodology)
* [Usage](#usage)
* [Commands](#commands)
* [Credits](#credits)
<!-- tocstop -->

# Development

This package is new and under active development. PRs are welcome.

Check the [1.0 Roadmap](https://github.com/hennessyevan/gooseberry/projects/1) for more.

# Methodology

Gooseberry uses placeholder IDs to reference raw seeding data. It makes 2 passes over the data first to setup the initial data and assign IDs and then to replace the placeholder IDs with the real IDs based on your mongoose schemae.

The transformed data is then fed to `mongoose.create` as per usual running the validation and methods.

### Example

**This Raw Data**

```json
// users.json
  {
    "id": "joe",
    "firstName": "Joe",
    "likedPosts": ["welcomePost"]
  }
// posts.json
  {
    "id": "welcomePost",
    "title": "Welcome to my blog!",
    "author": "joe"
  }
```

**Becomes**

```json
// mongodb://.../users
  {
    "id": "5d6e80622037da89a22195f6",
    "firstName": "Joe",
    "likedPosts": ["5d6e80622037da89a22195f7"]
  }
// mongodb://.../posts
  {
    "id": "5d6e80622037da89a22195f7",
    "title": "Welcome to my blog!",
    "author": "5d6e80622037da89a22195f6"
  }
```

# Usage

<!-- usage -->
```sh-session
$ npm install -g gooseberry
$ gooseberry COMMAND
running command...
$ gooseberry (-v|--version|version)
gooseberry/0.0.2 darwin-x64 node-v12.1.0
$ gooseberry --help [COMMAND]
USAGE
  $ gooseberry COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`gooseberry help [COMMAND]`](#gooseberry-help-command)
* [`gooseberry seed [COLLECTION]`](#gooseberry-seed-collection)

## `gooseberry help [COMMAND]`

display help for gooseberry

```
USAGE
  $ gooseberry help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_

## `gooseberry seed [COLLECTION]`

describe the command here

```
USAGE
  $ gooseberry seed [COLLECTION]

ARGUMENTS
  COLLECTION  Single collection to seed

OPTIONS
  -h, --help  show CLI help

EXAMPLES
  $ gooseberry seed
  $ gooseberry seed [collection]
```

_See code: [src/commands/seed.ts](https://github.com/hennessyevan/gooseberry/blob/v0.0.2/src/commands/seed.ts)_
<!-- commandsstop -->

# Credits

The brilliant idea for the smart IDs comes from [seedgoose](https://github.com/zhangkaiyulw/seedgoose). Gooseberry builds on that idea and adds mongoose validation et al. to that idea.
