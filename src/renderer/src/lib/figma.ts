import type { PanelId } from './canvas'

export interface FigmaFill {
  type: string
  color?: { r: number; g: number; b: number; a: number }
  opacity?: number
}

export interface FigmaBBox {
  x: number
  y: number
  width: number
  height: number
}

export interface FigmaTextNode {
  id: string
  name: string
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: number
  letterSpacing: number
  lineHeightPx: number
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM'
  fills?: FigmaFill[]
  bbox: FigmaBBox
  bboxRelative?: FigmaBBox
  parents: string[]
}

export interface FigmaImageNode {
  id: string
  name: string
  type: string
  bbox: FigmaBBox
  bboxRelative?: FigmaBBox
  parents: string[]
}

const PANEL_GROUP_NAMES = new Set<PanelId>(['timer', 'tasks', 'stats', 'settings'])

// Text nodes that live flat on Page 1 but belong to a specific panel.
const TEXT_NAME_TO_PANEL: Record<string, PanelId> = {
  'timer-count': 'timer',
  'timer-status': 'timer',
  'STUDY TIME': 'timer'
}

// Design placeholders that shouldn't render statically (dynamic counterparts replace them).
export const SKIP_TEXT_NAMES = new Set(['+3'])

// Image-node skip patterns (dynamic content handled separately).
export const SKIP_IMAGE_PATTERNS: RegExp[] = [
  /^completed-strawberry/,
  /^empty-strawberry/,
  // Tasks panel renders its own CSS trash button — skip the static PNG overlay.
  /^tasks-trash-button/
]

export function classifyTextNode(node: FigmaTextNode): PanelId | 'always' {
  for (const p of node.parents) {
    if (PANEL_GROUP_NAMES.has(p as PanelId)) return p as PanelId
  }
  if (TEXT_NAME_TO_PANEL[node.name]) return TEXT_NAME_TO_PANEL[node.name]
  if (node.name.startsWith('timer-')) return 'timer'
  return 'always'
}

export function classifyImageNode(node: FigmaImageNode): PanelId | null {
  for (const p of node.parents) {
    if (PANEL_GROUP_NAMES.has(p as PanelId)) return p as PanelId
  }
  return null
}

// Strip Figma's auto-numbering suffix: "tasks-frame 1" -> "tasks-frame".
export function stripFigmaSuffix(name: string): string {
  return name.replace(/\s*[-–]?\s*\d+$/, '').trim()
}

export function shouldRenderImageNode(node: FigmaImageNode): boolean {
  return !SKIP_IMAGE_PATTERNS.some((re) => re.test(node.name))
}

export function fillToCss(fill?: FigmaFill): string | undefined {
  if (!fill?.color) return undefined
  const { r, g, b, a } = fill.color
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`
}

// Substitute a Figma node's static text with dynamic state where applicable.
export function dynamicTextFor(
  name: string,
  state: { pomodorosToday: number }
): string | null {
  if (name === 'number_completed') return String(state.pomodorosToday)
  return null
}
