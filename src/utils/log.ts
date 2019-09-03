import chalk from "chalk"

export enum LogType {
  info,
  error,
  warn
}

export function log(msg: string, type: LogType = LogType.info) {
  switch (type) {
    case LogType.error:
      console.error(`${chalk.bgRed.bold(" ERROR ")} ${msg}`)
      break
    case LogType.warn:
      console.warn(`${chalk.bgYellow.bold(" WARNING ")} ${msg}`)
      break
    default:
    case LogType.info:
      console.log(`${chalk.bgBlue.bold(" INFO ")} ${msg}`)
      break
  }
}
