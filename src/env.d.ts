// cfonts-augment porque se extiende la información de tipos de cfonts
import type { ALIGNMENT, BGCOLORS, COLORS, FONTFACES, GRADIENTCOLORS, GRADIENTS } from './lib/constants'

/**
	 * Merge settings into our options object
	 *
	 * @param  {object}                  options                     - The settings object
	 * @param  {string}                  options.font                - Font face, Default 'block'
	 * @param  {string}                  options.align               - Text alignment, Default: 'left'
	 * @param  {array}                   options.colors              - Colors for font, Default: []
	 * @param  {string}                  options.background          - Color string for background, Default 'Black'
	 * @param  {string}                  options.backgroundColor     - Alias for background
	 * @param  {number}                  options.letterSpacing       - Space between letters, Default: set by selected font face
	 * @param  {number}                  options.lineHeight          - Space between lines, Default: 1
	 * @param  {boolean}                 options.spaceless           - Don't output space before and after output, Default: false
	 * @param  {number}                  options.maxLength           - Maximum amount of characters per line, Default width of console window
	 * @param  {(string|array|boolean)}  options.gradient            - Gradient color pair, Default: false
	 * @param  {boolean}                 options.independentGradient - A switch to calculate gradient per line or not
	 * @param  {boolean}                 options.transitionGradient  - A switch for transition gradients
	 * @param  {string}                  options.env                 - The environment we run cfonts in
	 * @param  {object}                  options.allowedColors       - All allowed font colors
	 * @param  {object}                  options.allowedBG           - All allowed background colors
	 * @param  {object}                  options.allowedFont         - All allowed fontfaces
	 * @param  {boolean}                 options.rawMode             - A switch for raw mode in terminals
	 */

export interface CFontsSettings {
  font?: keyof Fontfaces
  align?: keyof Alignment
  colors?: (keyof Colors)[]
  background?: keyof BgColors
  backgroundColor?: keyof BgColors
  letterSpacing?: number
  lineHeight?: number
  spaceless?: boolean
  maxLength?: number
  gradient?: boolean | keyof GradientColors | (keyof GradientColors)[]
  independentGradient?: boolean
  transitionGradient?: boolean
  env?: 'node' | 'browser'
  rawMode?: boolean
}

type Colors = typeof COLORS
type BgColors = typeof BGCOLORS
type GradientColors = typeof GRADIENTCOLORS
type Gradients = typeof GRADIENTS
type Alignment = typeof ALIGNMENT
type Fontfaces = typeof FONTFACES

export interface ProgramOptions {
	askForResolutions: boolean
	downloadVideos: boolean
	forceDownloadVideo: boolean
	forceDownloadAudio: boolean
}

export interface Resolution {
	download: string
	desired: string
	downloadNumber: number
	desiredNumber: number
}

export type ListToDownloads = {
	id: string
	download: string
}

export type ListOfDesired = {
	id: string
	desired: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpawnAsyncDataCallbacks = (chunk: Buffer, chunkStr: string) => any | null | undefined

export type List = {
	id: string,
	title: string
}[]
