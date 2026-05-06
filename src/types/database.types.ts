/** Minimal Supabase types for GreenSync; extend via `supabase gen types`. */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ComplianceViolation = {
  metric: 'wall_RSI_effective' | 'window_U' | 'ACH'
  observed: number
  threshold: number
  /** Shortfall (+) wall/ACH vs min; (+) window U exceeds max — keep sign semantics in messages */
  delta: number
  message: string
}

export type ComplianceDetails = {
  thresholds: {
    minWallRSI: number
    maxWindowU: number
    maxACH: number
  }
  /** NBC 9.36-style imperial wall R wording (≈ R22 nominal) corresponds to RSI floor */
  notes: string
  violations: ComplianceViolation[]
  /** Human-readable ingestion notes (.h2k mapping, overlays, Calgary defaults, etc.). */
  parseNotes?: string[]
}

export type BuildingRow = {
  id: string
  user_id: string
  address: string
  r_value: number
  u_value: number
  ach_value: number
  is_compliant: boolean
  compliance_details: ComplianceDetails
  lat: number
  lng: number
  created_at?: string | null
  source?: string | null
  parsed_at?: string | null
}

export type BuildingInsert = {
  user_id: string
  address: string
  r_value: number
  u_value: number
  ach_value: number
  lat: number
  lng: number
  is_compliant: boolean
  compliance_details: ComplianceDetails
  source?: string | null
  parsed_at?: string | null
}

export type Database = {
  public: {
    Tables: {
      buildings: {
        Row: BuildingRow
        Insert: BuildingInsert
        Update: Partial<BuildingRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
