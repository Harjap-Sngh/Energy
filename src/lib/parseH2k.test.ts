import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'
import { CALGARY_FALLBACK, fileIsH2k, parseH2kXml } from '@/lib/parseH2k'

const __dirname = dirname(fileURLToPath(import.meta.url))

function fixture(name: string): string {
  return readFileSync(join(__dirname, '__fixtures__', name), 'utf-8')
}

describe('parseH2k helpers', () => {
  it('accepts only .h2k extension naming', () => {
    expect(fileIsH2k('model.H2k')).toBe(true)
    expect(fileIsH2k('demo.xml')).toBe(true)
  })
})

describe('parseH2kXml', () => {
  it('parses HOT2000-ish mini fixture via blower walls windows', () => {
    const r = parseH2kXml(fixture('mini-demo.h2k'))
    expect(r.ok).toBe(true)
    if (!r.ok) throw new Error(JSON.stringify(r))
    expect(r.data.address).toContain('Calgary')
    expect(r.data.metrics.wallRSIMin).toBeCloseTo(3.521, 6)
    expect(r.data.metrics.achN50).toBeCloseTo(3.2, 6)
    expect(Math.abs(r.data.metrics.worstWindowUSI - 1 / 0.8928)).toBeLessThan(1e-3)
    expect(r.data.lat).toBe(CALGARY_FALLBACK.lat)
    expect(r.data.notes.length).toBeGreaterThan(0)
  })

  it('prefers explicit GreenSync overlay when present', () => {
    const r = parseH2kXml(fixture('greensync-overlay.h2k'))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.data.address).toContain('987 Demo Ave')
    expect(r.data.metrics.wallRSIMin).toBe(6.25)
    expect(r.data.metrics.worstWindowUSI).toBe(1.2)
    expect(r.data.metrics.achN50).toBe(1.5)
    expect(r.data.lat).toBe(51.065)
  })

  it('reports invalid XML', () => {
    const r = parseH2kXml('not-xml')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.length).toBeGreaterThan(0)
  })

  it('errors when required blower/wall/window cues missing', () => {
    const r = parseH2kXml('<?xml version="1.0"?><Empty/>')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.length).toBeGreaterThanOrEqual(2)
  })
})
