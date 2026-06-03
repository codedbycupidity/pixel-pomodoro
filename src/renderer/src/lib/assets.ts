// Resolve a public-dir asset path (e.g. "timer/background.png") so it loads in
// both dev and the packaged build. Vite sets import.meta.env.BASE_URL to "/" when
// served over http (dev) and to "./" for the file:// build, where an absolute
// "/timer/..." would otherwise resolve to the filesystem root and 404.
const BASE = import.meta.env.BASE_URL

export function asset(path: string): string {
  return `${BASE}${path.replace(/^\/+/, '')}`
}
