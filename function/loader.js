import chokidar from 'chokidar';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
	fileURLToPath,
	pathToFileURL
} from 'node:url';
import {
	execFile
} from 'node:child_process';
import {
	promisify
} from 'node:util';

// Codeslop (Claude ai) 
// Hot reload 
// Kode dan file ini di buat oleh ai, aku gbs jelasin apa² karna aku ga tau gmn kodenya bekerja, atau kalian bisa liat komentar yg di buat ama claude, ak cuma ganti log nya (´∩｡• ᵕ •｡∩`), intinya ini buat reload/update file tanpa restart bot.

const execFileP = promisify(execFile);
const DEFAULT_IGNORE_DIRS = ['node_modules', 'data'];
const DEFAULT_IGNORE_EXT = ['.json', '.bak']
const SNAP_PREFIX = '.hot-';
const SELF = fileURLToPath(import.meta.url);
const HERE = path.dirname(SELF);
const DEFAULT_IGNORE_FILES = [
	'module.js',
	'purpose.js',
	'main.js',
	'start.js'
];

export const runtime = typeof Bun !== 'undefined' ? 'bun' : 'node';

export async function createHotLoader({
	root = HERE,
	usePolling = false,
	ignoreDirs = DEFAULT_IGNORE_DIRS,
	ignoreExts = DEFAULT_IGNORE_EXT,
	snapshotDir = path.resolve(HERE, '../data/trash'),
	debounceMs = 100,
	ignoreFiles = DEFAULT_IGNORE_FILES,
	onReload = () => {},
	onError = (...args) => console.error(...args),
	onStatus = ({
		success,
		failed,
		initial,
		rolledBack
	}) => {
		const label = initial ?
			`Loader standby: ${success.length} success, ${failed.length} files error` :
			rolledBack ?
			`Reload dibatalkan: ${failed.length} files error` :
			`Reload selesai: ${failed.length} files error`
		Spinnup.info(label);
		if (failed.length) {
			console.log('')
			console.log(failed.map((f) => `  ${chalk.red('✗')} ${f.file}: ${f.error}`).join('\n'));
		}
	},
} = {}) {
	const absRoot = path.resolve(root);
	const absSnap = path.resolve(snapshotDir);
	const dirSet = new Set(ignoreDirs);
	const extSet = new Set(ignoreExts);
	const fileSet = new Set(ignoreFiles);

	let modules = new Map(); // path asli -> namespace modul
	let currentSnap = null;
	let counter = 0;
	let timer = null;
	let running = false;
	let dirty = false;
	const changed = new Set();

	// Dipakai watcher: abaikan folder tersembunyi, folder ignore, dan ekstensi ignore.
	function isIgnored(p) {
		const rel = path.relative(absRoot, p)
		if (!rel) return false
		if (path.resolve(p) === SELF) return true;

		const parts = rel.split(path.sep)

		if (parts.some(s => s.startsWith('.') || dirSet.has(s))) return true
		if (fileSet.has(path.basename(p))) return true

		return extSet.has(path.extname(p))
	}

	// Kumpulkan file yang perlu disalin ke snapshot (.js dan .json).
	async function collect(dir, out = []) {
		const entries = await fs.readdir(dir, {
			withFileTypes: true
		});
		for (const entry of entries) {
			if (entry.name.startsWith('.')) continue;
			const full = path.join(dir, entry.name);
			if (full === SELF) continue;
			if (entry.isDirectory()) {
				if (dirSet.has(entry.name)) continue;
				await collect(full, out);
			} else if (entry.isFile()) {
				const ext = path.extname(entry.name)
				if (!fileSet.has(entry.name) && (ext === '.js' || ext === '.json')) {
					out.push(full)
				}
			}
		}
		return out;
	}

	async function safeDispose(mod, file) {
		if (mod && typeof mod.dispose === 'function') {
			try {
				await mod.dispose();
			} catch (err) {
				onError(`[hot] dispose gagal untuk ${file}:`, err);
			}
		}
	}

	const IMPORT_RE =
		/(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]+)\2/g;

	function rewrite(code, srcFile, copied) {
		return code.replace(IMPORT_RE, (m, pre, q, spec) => {
			const target = path.resolve(path.dirname(srcFile), spec);
			if (copied.has(target)) return m; // ikut disalin, tetap relatif
			return `${pre}${q}${pathToFileURL(target).href}${q}`;
		});
	}

	async function syntaxPosition(file) {
		if (runtime !== 'node') return null;
		try {
			await execFileP(process.execPath, ['--check', file], {
				timeout: 10000
			});
			return null; // sintaks valid, errornya bukan sintaks
		} catch (e) {
			const m = String(e.stderr || '').match(/^[^\n]*:(\d+)\n[^\n]*\n(\s*)\^/m);
			return m ? {
				line: Number(m[1]),
				col: m[2].length + 1
			} : null;
		}
	}

	async function describeError(err, snap, snapFile) {
		const first = Array.isArray(err?.errors) && err.errors.length ? err.errors[0] : err;
		let msg = first?.message || err?.message || String(err);
		if (/^building\b/.test(msg) && err?.cause?.message) msg = err.cause.message;

		// Bun: posisi ada di errors[0].position
		let line = first?.position?.line;
		let col = first?.position?.column;

		// Error saat modul dijalankan: frame pertama dari snapshot
		if (!line && typeof err?.stack === 'string') {
			const frame = err.stack.split('\n').find((l) => l.includes(snap));
			const m = frame?.match(/:(\d+):(\d+)\)?\s*$/);
			if (m) {
				line = Number(m[1]);
				col = Number(m[2]);
			}
		}

		// Node, SyntaxError: stack tidak berisi posisi, tanya node --check
		if (!line && err?.name === 'SyntaxError') {
			const pos = await syntaxPosition(snapFile);
			if (pos) {
				line = pos.line;
				col = pos.col;
			}
		}

		const where = line ? ` (baris ${line}${col != null ? `:${col}` : ''})` : '';

		const snapUrl = pathToFileURL(snap).href;
		msg = msg
			.split(snapUrl + '/').join('')
			.split(snap + path.sep).join('')
			.split(snapUrl).join('')
			.split(snap).join('');

		return (msg + where).trim();
	}

	async function buildAndSwap(changedFiles, isInitial) {
		const snap = path.join(absSnap, `${SNAP_PREFIX}${process.pid}-${++counter}`);
		const next = new Map();
		const failed = [];
		const rel = (f) => path.relative(absRoot, f);
		try {
			const files = await collect(absRoot);
			const copied = new Set(files);
			for (const f of files) {
				const dest = path.join(snap, rel(f));
				await fs.mkdir(path.dirname(dest), {
					recursive: true
				});
				if (path.extname(f) === '.js') {
					const code = await fs.readFile(f, 'utf8');
					await fs.writeFile(dest, rewrite(code, f, copied));
				} else {
					await fs.copyFile(f, dest);
				}
			}

			for (const f of files) {
				if (path.extname(f) !== '.js') continue;
				try {
					next.set(f, await import(pathToFileURL(path.join(snap, rel(f))).href));
				} catch (err) {
					const snapFile = path.join(snap, rel(f));
					failed.push({
						file: rel(f),
						error: await describeError(err, snap, snapFile)
					});
				}
			}

			const status = {
				success: [...next.keys()].map(rel),
				failed,
				initial: isInitial,
				rolledBack: false,
			};

			// Saat reload, satu file error membatalkan semua (versi lama tetap dipakai).
			if (failed.length && !isInitial) {
				for (const [file, mod] of next) await safeDispose(mod, file);
				fs.rm(snap, {
					recursive: true,
					force: true
				}).catch(() => {});
				status.rolledBack = true;
				onStatus(status);
				return;
			}

			const prev = modules;
			const prevSnap = currentSnap;
			modules = next;
			currentSnap = snap;
			for (const [file, mod] of prev) await safeDispose(mod, file);
			if (prevSnap) fs.rm(prevSnap, {
				recursive: true,
				force: true
			}).catch(() => {});
			if (!isInitial)
				for (const f of changedFiles) onReload(f);
			onStatus(status);
		} catch (err) {
			onError('[hot] reload gagal:', err.message);
			for (const [file, mod] of next) await safeDispose(mod, file);
			fs.rm(snap, {
				recursive: true,
				force: true
			}).catch(() => {});
			if (isInitial) throw err;
		}
	}

	async function runQueue() {
		if (running) {
			dirty = true;
			return;
		}
		running = true;
		try {
			do {
				dirty = false;
				const files = [...changed];
				changed.clear();
				await buildAndSwap(files, false);
			} while (dirty);
		} finally {
			running = false;
		}
	}

	function schedule(file) {
		changed.add(file);
		clearTimeout(timer);
		timer = setTimeout(runQueue, debounceMs);
	}

	// Bersihkan sisa snapshot dari proses yang crash.
	await fs.mkdir(absSnap, {
		recursive: true
	})
	for (const entry of await fs.readdir(absSnap, {
			withFileTypes: true
		})) {
		if (entry.isDirectory() && entry.name.startsWith(SNAP_PREFIX)) {
			await fs.rm(path.join(absSnap, entry.name), {
				recursive: true,
				force: true
			})
		}
	}

	await buildAndSwap([], true);

	const watcher = chokidar.watch(absRoot, {
		ignoreInitial: true,
		ignored: isIgnored,
		usePolling,
		interval: 300,
		awaitWriteFinish: {
			stabilityThreshold: 100,
			pollInterval: 20
		},
	});
	for (const ev of ['add', 'change', 'unlink']) {
		watcher.on(ev, (f) => {
			if (f.endsWith('.js')) schedule(path.resolve(f));
		});
	}
	await new Promise((resolve) => watcher.on('ready', resolve));

	return {
		get(relPath) {
			const mod = modules.get(path.resolve(absRoot, relPath));
			if (!mod) throw new Error(`Модуль еще не загружен`);
			return mod;
		},
		async close() {
			clearTimeout(timer);
			await watcher.close();
			for (const [file, mod] of modules) await safeDispose(mod, file);
			if (currentSnap) await fs.rm(currentSnap, {
				recursive: true,
				force: true
			});
		},
	};
}