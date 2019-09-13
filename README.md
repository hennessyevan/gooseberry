<!-- <div align="center">
  <br>
  <br>
	<img src="Gooseberry@2x.png" width="300" alt="Gooseberry: Smart Mongoose Seeding Tool">
	<br>
	<br>
  <br>
	<br>
</div> -->

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/gooseberry.svg)](https://npmjs.org/package/gooseberry)
[![Downloads/week](https://img.shields.io/npm/dw/gooseberry.svg)](https://npmjs.org/package/gooseberry)
[![License](https://img.shields.io/npm/l/gooseberry.svg)](https://github.com/hennessyevan/gooseberry/blob/master/package.json)

<!-- toc -->
* [Setup](#setup)
* [Development](#development)
* [Methodology](#methodology)
* [Usage](#usage)
* [Commands](#commands)
* [Credits](#credits)
<!-- tocstop -->

# Setup
#### Install via yarn or npm
```bash
yarn add gooseberry
OR
npm install gooseberry
```
#### Create a gooseberry config in package.json
```json
{
  //...,
  "gooseberry": {
    "modelDir": "path/to/mongooseModels",
    "mongoURI": "mongodb://localhost:27017/{TARGET_DB_NAME}",
    "dataDir": "path/to/seedData",
    "dropDatabase": true (optional)
  }
}
```
#### Create a data file for each collection you want to seed
Data files can be written in json, yaml, ts or js but must return an array of data.
```json
// seeds/users.json
[{
  "_id": "Jane",
  "firstName": "Jane",
  "lastName": "Doe"
}]
// seeds/posts.json
[{
  "title": "My new post",
  "author": "Jane" // use _id from seeded user
}]
```
_Note: if you don't specify an _id or id field, gooseberry will assign it a smartID based on collection name and position in array. (e.g. above example will have `post1` as its ID)_

Gooseberry will recursively transform these into `ObjectID`s
```json
// seeds/users.json
[{
  "_id": ObjectID("5d6e80622037da89a22195f7"),
  "firstName": "Jane",
  "lastName": "Doe"
}]
// seeds/posts.json
[{
  "_id": ObjectID("5d6e80622037da89a22195f8"),
  "title": "My new post",
  "author": ObjectID("5d6e80622037da89a22195f7")
}]
```


# Development

This package is new and under active development. PRs are welcome.

Check the [1.0 Roadmap](https://github.com/hennessyevan/gooseberry/projects/1) for more.

# Methodology

Gooseberry uses placeholder IDs to reference raw seeding data. It makes 2 passes over the data first to setup the initial data and assign IDs and then to replace the placeholder IDs with the real IDs based on your mongoose schemae.

The transformed data is then fed to `mongoose.create` as per usual running the validation and methods.


# Usage

<!-- usage -->
```sh-session
$ npm install -g gooseberry
$ gooseberry COMMAND
running command...
$ gooseberry (-v|--version|version)
gooseberry/0.1.3 darwin-x64 node-v12.1.0
$ gooseberry --help [COMMAND]
USAGE
  $ gooseberry COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`gooseberry help [COMMAND]`](#gooseberry-help-command)
* [`gooseberry seed`](#gooseberry-seed)

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

## `gooseberry seed`

describe the command here

```
USAGE
  $ gooseberry seed

OPTIONS
  -h, --help  show CLI help

EXAMPLES
  $ gooseberry seed
  $ gooseberry seed [collection]
```

_See code: [src/commands/seed.ts](https://github.com/hennessyevan/gooseberry/blob/v0.1.3/src/commands/seed.ts)_
<!-- commandsstop -->

# Credits

The brilliant idea for the smart IDs comes from [seedgoose](https://github.com/zhangkaiyulw/seedgoose). Gooseberry builds on that idea and adds mongoose validation et al. to that idea.
