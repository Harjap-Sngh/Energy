import type { ParsedH2kSuccess } from '@/lib/parseH2k'

/** Dev/test payload only unless no file parsing is used */
export function getSampleParsedHouse(): ParsedH2kSuccess['data'] {
  return {
    address: '123 Calgary Trail NW, Calgary AB',
    metrics: {
      wallRSIMin: 3.521,
      worstWindowUSI: 1.6,
      achN50: 3.2,
    },
    lat: 51.05,
    lng: -114.08,
    notes: ['Synthetic sample-house payload (prefer real .h2k).'],
  }
}
