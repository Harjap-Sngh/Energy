import type { ComplianceDetails, ComplianceViolation } from '@/types/database.types'

/** Rough metric RSI equivalent to nominally "effective R-22" in imperial nomenclature (demo-only). */
export const IMPERIAL_TO_METRIC_RS = 5.678
export const DEMO_MIN_WALL_RSI = 22 / IMPERIAL_TO_METRIC_RS
export const DEMO_MAX_WINDOW_U_SI = 1.4
export const DEMO_MAX_ACH_N50 = 2.5

export type MetricsInput = {
  wallRSIMin: number
  /** Worst fenestration U-factor SI (W/m²·K); higher is worse */
  worstWindowUSI: number
  achN50: number
}

/**
 * Demonstration compliance gate—not code or permit advice.
 */
export function evaluateDemoCompliance(m: MetricsInput): ComplianceDetails {
  const thresholds = {
    minWallRSI: DEMO_MIN_WALL_RSI,
    maxWindowU: DEMO_MAX_WINDOW_U_SI,
    maxACH: DEMO_MAX_ACH_N50,
  }

  const violations: ComplianceViolation[] = []

  if (m.wallRSIMin + 1e-9 < DEMO_MIN_WALL_RSI) {
    const delta = DEMO_MIN_WALL_RSI - m.wallRSIMin
    violations.push({
      metric: 'wall_RSI_effective',
      observed: round4(m.wallRSIMin),
      threshold: round4(DEMO_MIN_WALL_RSI),
      delta: round4(delta),
      message: `Wall RSI (effective, minimum across modeled walls ${round4(m.wallRSIMin)}) is ${round4(delta)} RSI below demo target (~imperial equivalent R-22 framing).`,
    })
  }

  if (m.worstWindowUSI - 1e-9 > DEMO_MAX_WINDOW_U_SI) {
    const delta = m.worstWindowUSI - DEMO_MAX_WINDOW_U_SI
    violations.push({
      metric: 'window_U',
      observed: round4(m.worstWindowUSI),
      threshold: DEMO_MAX_WINDOW_U_SI,
      delta: round4(delta),
      message: `Worst glazing U-factor ${round4(m.worstWindowUSI)} W/(m²·K) exceeds demo limit ${DEMO_MAX_WINDOW_U_SI} by ${round4(delta)}.`,
    })
  }

  if (m.achN50 - 1e-9 > DEMO_MAX_ACH_N50) {
    const delta = m.achN50 - DEMO_MAX_ACH_N50
    violations.push({
      metric: 'ACH',
      observed: round4(m.achN50),
      threshold: DEMO_MAX_ACH_N50,
      delta: round4(delta),
      message: `Air leakage ${round4(m.achN50)} ACH@50 Pa exceeds demo limit ${DEMO_MAX_ACH_N50} by ${round4(delta)}.`,
    })
  }

  return {
    thresholds,
    notes:
      'Thresholds approximate a demo municipal gate (wall RSI mapped from ~effective R-22 nomenclature, window U SI, ACH@50 Pa); not authoritative for permits.',
    violations,
  }
}

function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000
}

export function isDetailsCompliant(details: ComplianceDetails): boolean {
  return details.violations.length === 0
}
