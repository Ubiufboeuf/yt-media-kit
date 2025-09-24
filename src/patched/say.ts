import { say as _say } from 'cfonts-for-bun'
import type { CFontsSettings, Colors } from '../env'
import { COLORS } from '../lib/constants'

const defaults: CFontsSettings = {
  font: 'block',
  align: 'left',
  colors: [],
  background: 'transparent',
  letterSpacing: 1,
  lineHeight: 1,
  spaceless: false,
  maxLength: 0,
  gradient: false,
  independentGradient: false,
  transitionGradient: false,
  rawMode: false,
  env: 'node'
}

export function say (text: string, options: CFontsSettings) {
  return _say(text, {
    ...defaults,
    ...options,
    colors: parseColors(options.colors ?? [])
  })
}

function parseColors (colors: (keyof Colors)[]) {
  const arr: string[] = []
  colors.forEach((color) => arr.push(COLORS[color]))
  return arr
}
