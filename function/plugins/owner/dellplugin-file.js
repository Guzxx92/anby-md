export default {
	command: ['delplugin', 'delfile'],
	meta: {
		description: 'delete a plugins',
		category: 'owner',
		usage: '<path|name>',
	},
	permission: {
		owner: 'real'
	},
	run: async ({
		m,
		args,
		command
	}) => {
		const root = process.cwd()
		const input = args.join(' ')

		let target = null
		let meta

		if (command == "delplugin") {
			meta = path.join(root, 'function/plugins')
		} else {
			meta = path.join(root)
		}

		if (input.includes('/') || path.extname(input)) {
			const resolved = path.resolve(meta, input)
			const rel = path.relative(root, resolved)

			if (rel.startsWith('..') || path.isAbsolute(rel)) return m.reply(mess.plugin.add.denied)
			if (!fs.existsSync(resolved)) return m.reply(mess.plugin.del.not)


			target = resolved
		} else {
			const results = []
			const scan = dir => {
				for (const f of fs.readdirSync(dir)) {
					if (['node_modules', 'trash'].includes(f) || f.startsWith('.hot-')) continue

					const full = path.join(dir, f)
					const stat = fs.statSync(full)

					if (stat.isDirectory()) scan(full)
					else if (f === `${input}.js`) results.push(full)
				}
			}

			scan(meta)

			if (!results.length) return m.reply(mess.plugin.del.not)
			if (results.length > 1) {
				return m.reply(
					`${mess.plugin.del.more}\n` +
					results.map(f => path.relative(root, f)).join('\n')
				)
			}

			target = results[0]
		}

		fs.unlinkSync(target)

		m.reply(
			`${mess.plugin.del.suc}\n` +
			"- " + path.relative(root, target)
		)
	}
}