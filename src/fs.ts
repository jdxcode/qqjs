import * as fs from 'fs-extra'
import * as Glob from 'glob'
import * as _globby from 'globby'
import * as loadJSONFile from 'load-json-file'
import * as _ from 'lodash'
import * as os from 'os'
import * as path from 'path'
import * as tmp from 'tmp'
import {promisify} from 'util'
import * as writeJSONFile from 'write-json-file'

import {log} from './log'
export const home = os.homedir()
export {path}

export const join = (filepath: string | string[]) => path.join(..._.castArray(filepath))

/**
 * reads a json file in using load-json-file
 * this will automatically join the paths if you pass multiple strings with path.join()
 */
export function readJSON(filepaths: string | string[]) {
  const filepath = join(filepaths)
  log('readJSON', filepath)
  return loadJSONFile(filepath)
}

/**
 * writes a json file with write-json-file
 * this will automatically join the paths if you pass an array of strings
 */
export function writeJSON(filepaths: string | string[], data: any, options: writeJSONFile.Options = {}) {
  const filepath = join(filepaths)
  log('writeJSON', filepath)
  return writeJSONFile(filepath, data, options)
}

/**
 * creates a directory if it does not exist
 * this will automatically join the paths if you pass multiple strings with path.join()
 */
export async function mkdirp(...filepaths: (string | string[])[]) {
  for (let f of filepaths.map(join)) {
    log('mkdirp', f)
    await fs.mkdirp(f)
  }
}

/**
 * glob matcher (find files)
 */
export function globby(patterns: string | string[], options: Glob.IOptions = {}) {
  log('globby', ...patterns)
  return _globby(patterns, options)
}

/**
 * output string to file
 * creates directory if not exists
 */
export function write(filepaths: string | string[], data: any, options = {}) {
  const filepath = join(filepaths)
  log('write', filepath)
  return fs.outputFile(filepath, data, options)
}

/**
 * read file into string
 */
export function read(filepaths: string | string[], options = {}) {
  const filepath = join(filepaths)
  log('read', filepath)
  return fs.readFile(filepath, options)
}

/**
 * cd into a directory
 */
export function cd(filepaths: string | string[]) {
  const filepath = join(filepaths)
  log('cd', filepath)
  return process.chdir(filepath)
}

/**
 * list files in directory
 */
export function ls(filepaths: string | string[]) {
  const filepath = join(filepaths)
  log('ls', filepath)
  return fs.readdir(filepath)
}

/**
 * copy files with fs.copy
 * can copy directories
 */
export async function cp(source: string | string[], destinationpaths: string | string[], options = {}) {
  source = join(source)
  let dest = join(destinationpaths)
  try {
    const stats = await fs.stat(dest)
    if (stats.isDirectory()) dest = path.join(dest, path.basename(source))
    if (stats.isFile()) rm(dest)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  log('cp', source, dest)
  fs.copy(source, dest, options)
}

/**
 * rm -rf
 */
export async function rm(...filesArray: (string | string[])[]) {
  for (let f of filesArray.map(join)) {
    log('rm', f)
    await fs.remove(f)
  }
}

export async function mv(source: string | string[], dest: string | string[]) {
  source = join(source)
  dest = join(dest)
  try {
    const stats = await fs.stat(dest)
    if (stats.isDirectory()) dest = path.join(dest, path.basename(source))
    if (stats.isFile()) rm(dest)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  log('mv', source, dest)
  fs.move(source, dest)
}

export async function exists(filepath: string | string[]) {
  filepath = join(filepath)
  const exists = await fs.pathExists(filepath)
  log('exists', filepath, exists)
  return exists
}

export function cwd() {
  const cwd = process.cwd()
  log('cwd', cwd)
  return cwd
}

export function chmod(filepath: string | string[], mode: number) {
  filepath = join(filepath)
  log('chmod', filepath, mode)
  return fs.chmod(filepath, mode)
}

/**
 * create a new temporary directory
 * uses tmp
 */
export async function tmpDir(): Promise<string> {
  const output = await (promisify(tmp.dir) as any)()
  log('tmpDir', output.name)
  return output.name
}

export function emptyDir(filepath: string | string[]) {
  filepath = join(filepath)
  log('emptyDir', filepath)
  return fs.emptyDir(filepath)
}
