import type { MetricsInput } from '@/lib/compliance'

export const CALGARY_FALLBACK = { lat: 51.0447, lng: -114.0719 }

export type ParsedH2kSuccess = {
  ok: true
  data: {
    address: string
    metrics: MetricsInput
    lat: number
    lng: number
    notes: string[]
  }
}

export type ParsedH2kFail = {
  ok: false
  errors: string[]
}

export type ParsedH2k = ParsedH2kSuccess | ParsedH2kFail

/** HOT2000 uses `.h2k`; demo fixtures may use `.xml` (same UTF-8 content). */
const H2K_OR_XML_EXTENSION = /\.(h2k|xml)$/i

export function fileIsH2k(name: string): boolean {
  return H2K_OR_XML_EXTENSION.test(name)
}

function* walkElements(root: Element): Generator<Element> {
  const stack: Element[] = [root]
  while (stack.length) {
    const el = stack.pop()!
    yield el
    for (let i = el.children.length - 1; i >= 0; i--) stack.push(el.children[i]!)
  }
}

function getAttr(el: Element, rawName: string): string | undefined {
  const want = rawName.toLowerCase()
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i]!
    const n = a.localName.toLowerCase()
    if (n === want) return a.value
  }
  return undefined
}

function textOr(el: Element | null | undefined): string {
  return el?.textContent?.trim() ?? ''
}

function parseNumber(msg: string): number | undefined {
  const n = Number(msg)
  return Number.isFinite(n) ? n : undefined
}

function firstChild(el: Element | null, names: string[]): Element | undefined {
  if (!el) return undefined
  for (const nm of names) {
    for (const c of el.children) {
      if (c.localName === nm) return c
    }
  }
  return undefined
}

/** Optional overlay for demos/tests; children are simple text nodes. */
function tryGreenSyncCompliance(doc: Document): ParsedH2kSuccess['data'] | null {
  for (const el of walkElements(doc.documentElement)) {
    if (el.localName !== 'GreenSyncCompliance') continue
    const g = (tag: string): string => {
      for (const c of el.children) {
        if (c.localName === tag) return c.textContent?.trim() ?? ''
      }
      return ''
    }
    const addr = g('FullAddress') || g('Address')
    const wRsi = parseNumber(g('WallEffectiveRSI'))
    const winU = parseNumber(g('WindowU'))
    const ach = parseNumber(g('AirChangeRate'))
    const lat = parseNumber(g('Latitude'))
    const lng = parseNumber(g('Longitude'))
    const notes: string[] = ['Metrics read from GreenSyncCompliance overlay block.']
    if (!addr) return null
    if (wRsi === undefined || winU === undefined || ach === undefined) return null

    return {
      address: addr,
      metrics: {
        wallRSIMin: wRsi,
        worstWindowUSI: winU,
        achN50: ach,
      },
      lat: lat ?? CALGARY_FALLBACK.lat,
      lng: lng ?? CALGARY_FALLBACK.lng,
      notes,
    }
  }
  return null
}

function blowerTestACH(doc: Document): number | undefined {
  for (const el of walkElements(doc.documentElement)) {
    if (el.localName !== 'BlowerTest') continue
    const raw = getAttr(el, 'airChangeRate')
    if (!raw) continue
    return parseNumber(raw)
  }
  return undefined
}

function directConstructionType(parent: Element): Element | undefined {
  for (let i = 0; i < parent.children.length; i++) {
    const c = parent.children[i]!
    if (c.localName !== 'Construction') continue
    for (let j = 0; j < c.children.length; j++) {
      const t = c.children[j]!
      if (t.localName === 'Type') return t
    }
  }
  return undefined
}

function minimumWallRSI(doc: Document): number | undefined {
  const values: number[] = []
  for (const wall of walkElements(doc.documentElement)) {
    if (wall.localName !== 'Wall') continue
    const typeEl = directConstructionType(wall)
    if (!typeEl) continue
    const rsi = parseNumber(getAttr(typeEl, 'rValue') ?? '')
    if (rsi !== undefined && rsi > 0) values.push(rsi)
  }
  return values.length ? Math.min(...values) : undefined
}

function worstWindowU(doc: Document): number | undefined {
  const worst: number[] = []
  for (const win of walkElements(doc.documentElement)) {
    if (win.localName !== 'Window') continue
    const typeEl = directConstructionType(win)
    if (!typeEl) continue
    const rsiGlass = parseNumber(getAttr(typeEl, 'rValue') ?? '')
    if (rsiGlass === undefined || rsiGlass <= 0) continue
    const u = 1 / rsiGlass
    worst.push(u)
  }
  return worst.length ? Math.max(...worst) : undefined
}

function buildAddress(doc: Document): string {
  const prog = doc.getElementsByTagName('ProgramInformation')[0]
  const fileId = prog?.getElementsByTagName('Identification')[0]?.textContent?.trim() ?? ''

  let region = ''
  let location = ''
  const weather = prog?.getElementsByTagName('Weather')[0]
  if (weather) {
    const reg = weather.getElementsByTagName('Region')[0]
    const loc = weather.getElementsByTagName('Location')[0]
    region = textOr(firstChild(reg, ['English']))
    location = textOr(firstChild(loc, ['English']))
  }

  if (location || region)
    return [location || region, location && region && location !== region ? region : '']
      .filter(Boolean)
      .join(', ')

  if (fileId) return fileId
  return '(address not parsed)'
}

export function parseH2kXml(xml: string): ParsedH2k {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')
  const pe = doc.getElementsByTagName('parsererror')[0]
  if (pe) {
    const msg = textOr(pe) || 'Invalid XML.'
    return { ok: false, errors: [msg.slice(0, 500)] }
  }

  const overlay = tryGreenSyncCompliance(doc)
  if (overlay) {
    return { ok: true, data: overlay }
  }

  const errors: string[] = []
  const notes: string[] = [
    'Parsed HOT2000-style HouseFile cues (walls, blower test, glazing). Add <GreenSyncCompliance> for overlays when fields are ambiguous.',
  ]

  const ach = blowerTestACH(doc)
  const wallMin = minimumWallRSI(doc)
  const winU = worstWindowU(doc)

  if (ach === undefined)
    errors.push('Missing blower test ACH: expected <BlowerTest airChangeRate="…" />.')
  if (wallMin === undefined)
    errors.push('Missing envelope wall RSI: expected <Wall>…<Construction><Type rValue="…" /></Construction>.')
  if (winU === undefined)
    errors.push(
      'Missing fenestration to derive U-factor: expected <Window>…<Construction><Type rValue="RSI glazing" /></…>.',
    )

  const address = buildAddress(doc)

  if (errors.length) return { ok: false, errors }

  const wallRSIMin = wallMin as number
  const worstWindowUSI = winU as number
  const achN50 = ach as number

  return {
    ok: true,
    data: {
      address,
      metrics: {
        wallRSIMin,
        worstWindowUSI,
        achN50,
      },
      lat: CALGARY_FALLBACK.lat,
      lng: CALGARY_FALLBACK.lng,
      notes,
    },
  }
}

export async function parseH2kFile(file: File): Promise<ParsedH2k> {
  if (!fileIsH2k(file.name))
    return {
      ok: false,
      errors: [`Invalid file extension: "${file.name}" (expected .h2k or .xml)`],
    }

  let text: string
  try {
    text = await file.text()
  } catch {
    return { ok: false, errors: ['Could not read file as UTF-8 text.'] }
  }

  return parseH2kXml(text)
}
