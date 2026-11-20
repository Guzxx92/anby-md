import YAML from 'yaml'
import '../module.js'
import '../wrapper.js'
import '../spinnies.js'

await Spinnup.info('Loading config...')
await Object.assign(global, 
	YAML.parse(fs.readFileSync('./@config/settings.yml', 'utf8')),
	YAML.parse(fs.readFileSync('./@config/path.yml', 'utf8'))
)
await Object.assign(global, 
	YAML.parse(fs.readFileSync(`./@config/lang/${lang}.yml`, 'utf8'))
)

global.thumb1 = fs.readFileSync(global.thumb1)
global.thumb1x1 = fs.readFileSync(global.thumb1x1)

await delay(2000)
await import('../purpose.js')

let shutdown = false
let meta = path.join(import.meta.dirname, '../../data/trash')

process.on('SIGINT', () => {})
process.on('message', async msg => {
	if (msg !== 'shutdown' || shutdown) return
	shutdown = true
	console.log('\n')
	// kosho kosho kosho kosho, um.. kosho kosho kosho, ehe.
	try {
		if (global?.saveDB()) {
			await global.saveDB()
			log.warn('Database saved successfully')
		} else {
			log.warn('What the fuck are you doing?')
		}
	} catch (err) {
		log.error('Failed to save database:', err)
		process.exitCode = 1
	} finally {
		process.exit()
	}
})

await FileU.remove(meta)
await FileU.mkdir(meta)
await delay(1000)

Spinnup.success('Starting Sockets...')

await initCrest()
await multiCrest()
await import('../../handler.js')