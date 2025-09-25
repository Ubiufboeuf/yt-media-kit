export const COLORS = {
	system: 'system',
	black: 'black',
	red: 'red',
	green: 'green',
	yellow: 'yellow',
	blue: 'blue',
	magenta: 'magenta',
	cyan: 'cyan',
	white: 'white',
	gray: 'gray',
	redbright: 'redBright',
	greenbright: 'greenBright',
	yellowbright: 'yellowBright',
	bluebright: 'blueBright',
	magentabright: 'magentaBright',
	cyanbright: 'cyanBright',
	whitebright: 'whiteBright'
}

export const BGCOLORS = {
	transparent: 'transparent',
	black: 'black',
	red: 'red',
	green: 'green',
	yellow: 'yellow',
	blue: 'blue',
	magenta: 'magenta',
	cyan: 'cyan',
	white: 'white',
	blackbright: 'blackBright',
	redbright: 'redBright',
	greenbright: 'greenBright',
	yellowbright: 'yellowBright',
	bluebright: 'blueBright',
	magentabright: 'magentaBright',
	cyanbright: 'cyanBright',
	whitebright: 'whiteBright'
}

export const GRADIENTCOLORS = {
	transparent: 'transparent',
	black: 'black',
	red: 'red',
	green: 'green',
	yellow: 'yellow',
	blue: 'blue',
	magenta: 'magenta',
	cyan: 'cyan',
	white: 'white',
	gray: 'gray',
	grey: 'grey'
}

export const GRADIENTS = {
	lgbt: ['#750787', '#004dff', '#008026', '#ffed00', '#ff8c00', '#e40303'],
	lgbtq: ['#750787', '#004dff', '#008026', '#ffed00', '#ff8c00', '#e40303'],
	pride: ['#750787', '#004dff', '#008026', '#ffed00', '#ff8c00', '#e40303'],
	agender: ['#000000', '#b9b9b9', '#ffffff', '#b8f483', '#ffffff', '#b9b9b9', '#000000'],
	aromantic: ['#3da542', '#a7d379', '#ffffff', '#a9a9a9', '#000000'],
	asexual: ['#000000', '#a3a3a3', '#ffffff', '#800080'],
	bisexual: ['#d60270', '#d60270', '#9b4f96', '#0038a8', '#0038a8'],
	genderfluid: ['#ff75a2', '#ffffff', '#be18d6', '#000000', '#333ebd'],
	genderqueer: ['#b57edc', '#ffffff', '#4a8123'],
	intersex: ['#ffd800', '#ffd800', '#7902aa', '#ffd800', '#ffd800'],
	lesbian: ['#d52d00', '#ff9a56', '#ffffff', '#d362a4', '#a30262'],
	nonbinary: ['#fcf434', '#ffffff', '#9c5cd4', '#2c2c2c'],
	pansexual: ['#ff218c', '#ffd800', '#21b1ff'],
	polysexual: ['#f61cb9', '#07d569', '#1c92f6'],
	transgender: ['#5bcefa', '#f5a9b8', '#ffffff', '#f5a9b8', '#5bcefa']
}

export const ALIGNMENT = {
  left: 'left',
  center: 'center',
  right: 'right',
  top: 'top',
  bottom: 'bottom'
}

export const FONTFACES = {
	'console': 'console',
	'block': 'block',
	'simpleblock': 'simpleBlock',
	'simple': 'simple',
	'3d': '3d',
	'simple3d': 'simple3d',
	'chrome': 'chrome',
	'huge': 'huge',
	'shade': 'shade',
	'slick': 'slick',
	'grid': 'grid',
	'pallet': 'pallet',
	'tiny': 'tiny'
}

export const PROGRAM_VERSION = '2025.09.23'
export const YT_DLP = 'yt-dlp'
export const KWD = '/home/mango/Dev/yt-media-kit' // KWD: Kit-Working-Directory
export const PRD = '/home/mango/Dev/nexora' // PRD:  PRoduction-Directory
export const MIN_RES = '32p'

export const Rutas = {
	assets: `${KWD}/storage/assets`,
	audios: `${KWD}/storage/audios`,
	audios_descargados: `${KWD}/storage/audios_descargados`,
	completos: `${KWD}/storage/completos`,
	info: `${KWD}/storage/info`,
	videos: `${KWD}/storage/videos`,
	videos_con_audio: `${KWD}/storage/videos_con_audio`,
	videos_descargados: `${KWD}/storage/videos_descargados`,
	suggest_list: `${KWD}/src/lib/list-of-videos-to-suggest.json`
}

export const Rutas_para_borrar = {
	assets: Rutas.assets,
	audios: Rutas.audios,
	audios_descargados: Rutas.audios_descargados,
	completos: Rutas.completos,
	info: Rutas.info,
	videos: Rutas.videos,
	videos_con_audio: Rutas.videos_con_audio,
	videos_descargados: Rutas.videos_descargados
}

export const response = {
  downloadVideo: 'downloadVideo',
  askForResolutions: 'askForResolutions',
  forceDownloadVideo: 'forceDownloadVideo',
  forceDownloadAudio: 'forceDownloadAudio',
  syncVideoAndAudio: 'syncVideoAndAudio',
  unsyncVideoAndAudio: 'unsyncVideoAndAudio',
  forceSync: 'forceSync',
  forceUnsync: 'forceUnsync',
  createDashStream: 'createDashStream',
  getVideoData: 'getVideoData',
  getThumbnails: 'getThumbnails'
}
