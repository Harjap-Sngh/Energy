import { describe, expect, it } from 'vitest'
import {
  DEMO_MAX_ACH_N50,
  DEMO_MAX_WINDOW_U_SI,
  evaluateDemoCompliance,
  isDetailsCompliant,
} from '@/lib/compliance'

describe('evaluateDemoCompliance', () => {
  it('passes when all gates clear', () => {
    const d = evaluateDemoCompliance({
      wallRSIMin: 4.2,
      worstWindowUSI: 1.2,
      achN50: 2,
    })
    expect(isDetailsCompliant(d)).toBe(true)
    expect(d.violations).toHaveLength(0)
  })

  it('flags wall RSI shortfall only', () => {
    const d = evaluateDemoCompliance({
      wallRSIMin: 3,
      worstWindowUSI: 1.3,
      achN50: 2,
    })
    expect(isDetailsCompliant(d)).toBe(false)
    expect(d.violations).toHaveLength(1)
    expect(d.violations[0].metric).toBe('wall_RSI_effective')
  })

  it('flags ACH over limit only', () => {
    const d = evaluateDemoCompliance({
      wallRSIMin: 5,
      worstWindowUSI: 1.2,
      achN50: DEMO_MAX_ACH_N50 + 0.4,
    })
    expect(d.violations.some((v) => v.metric === 'ACH')).toBe(true)
  })

  it('flags window U over limit', () => {
    const d = evaluateDemoCompliance({
      wallRSIMin: 5,
      worstWindowUSI: DEMO_MAX_WINDOW_U_SI + 0.2,
      achN50: 1,
    })
    expect(d.violations.some((v) => v.metric === 'window_U')).toBe(true)
  })
})
