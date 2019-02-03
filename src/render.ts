import { compile } from './compile'
import { ICompilerOptions, Scope } from './types'

/**
 * Replaces every {{variable}} inside the template with values provided by view.
 *
 * @param template The template containing one or more {{variableNames}} every variable
 * names that is used in the template. If it's omitted, it'll be assumed an empty object.
 * @param view An object containing values for every variable names that is used in the template.
 * If it's omitted, it'll be set to an empty object essentially removing all {{varName}}s from the template.
 * @param options compiler options
 * @returns Template where its variable names replaced with corresponding values.
 * If a value is not found or is invalid, it will be assumed empty string ''.
 * If the value is an object itself, it'll be stringified by JSON.
 * In case of a JSON stringify error the result will look like "{...}".
 */
export function render(
  template: string,
  view: Scope = {},
  options?: ICompilerOptions
): string | Promise<string> {
  const renderer = compile(template, options)
  return renderer(view)
}