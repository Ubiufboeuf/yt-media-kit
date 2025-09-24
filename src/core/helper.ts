import { say } from 'src/patched/say'

export async function showHelper () {
  say('HELP', {
    colors: ['red', 'magenta']
  })
}
