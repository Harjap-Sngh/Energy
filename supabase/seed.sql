-- Demo Calgary building pins for map/table. Runs as the database superuser (bypasses RLS).
--
-- Rows attach to the earliest auth user only. After `supabase db reset`, create one account
-- in the app, then run:  supabase db seed
-- Or use the SQL editor on a hosted project and replace :user_id with your uuid from auth.users.

delete from public.buildings where source = 'seed_demo_calgary';

insert into public.buildings (
  user_id, address, r_value, u_value, ach_value, lat, lng, is_compliant, compliance_details, source, parsed_at
)
select
  u.id,
  v.address,
  v.r_value,
  v.u_value,
  v.ach_value,
  v.lat,
  v.lng,
  v.is_compliant,
  v.compliance_details::jsonb,
  'seed_demo_calgary',
  now()
from (select id from auth.users order by created_at asc limit 1) as u
cross join (
  values
    (
      'Calgary Tower — 101 9 Ave SW',
      5.0::double precision,
      1.1::double precision,
      2.0::double precision,
      51.0444::double precision,
      -114.0631::double precision,
      true,
      $c${
        "thresholds": {"minWallRSI": 3.8746037337090526, "maxWindowU": 1.4, "maxACH": 2.5},
        "notes": "Thresholds approximate a demo municipal gate (wall RSI mapped from ~effective R-22 nomenclature, window U SI, ACH@50 Pa); not authoritative for permits.",
        "violations": [],
        "parseNotes": ["seed_demo_calgary_portfolio"]
      }$c$
    ),
    (
      'Olympic Plaza — 228 8 Ave SE',
      5.0::double precision,
      1.55::double precision,
      2.0::double precision,
      51.0461::double precision,
      -114.0624::double precision,
      false,
      $c${
        "thresholds": {"minWallRSI": 3.8746037337090526, "maxWindowU": 1.4, "maxACH": 2.5},
        "notes": "Thresholds approximate a demo municipal gate (wall RSI mapped from ~effective R-22 nomenclature, window U SI, ACH@50 Pa); not authoritative for permits.",
        "violations": [
          {
            "metric": "window_U",
            "observed": 1.55,
            "threshold": 1.4,
            "delta": 0.15,
            "message": "Worst glazing U-factor 1.55 W/(m²·K) exceeds demo limit 1.4 by 0.15."
          }
        ],
        "parseNotes": ["seed_demo_calgary_portfolio"]
      }$c$
    ),
    (
      'Kensington — 10 St NW & Memorial Dr NW',
      5.2::double precision,
      1.22::double precision,
      3.8::double precision,
      51.0553::double precision,
      -114.0870::double precision,
      false,
      $c${
        "thresholds": {"minWallRSI": 3.8746037337090526, "maxWindowU": 1.4, "maxACH": 2.5},
        "notes": "Thresholds approximate a demo municipal gate (wall RSI mapped from ~effective R-22 nomenclature, window U SI, ACH@50 Pa); not authoritative for permits.",
        "violations": [
          {
            "metric": "ACH",
            "observed": 3.8,
            "threshold": 2.5,
            "delta": 1.3,
            "message": "Air leakage 3.8 ACH@50 Pa exceeds demo limit 2.5 by 1.3."
          }
        ],
        "parseNotes": ["seed_demo_calgary_portfolio"]
      }$c$
    ),
    (
      'Calgary Zoo — St. George''s Island NE',
      3.5::double precision,
      1.05::double precision,
      2.0::double precision,
      51.0453::double precision,
      -114.0334::double precision,
      false,
      $c${
        "thresholds": {"minWallRSI": 3.8746037337090526, "maxWindowU": 1.4, "maxACH": 2.5},
        "notes": "Thresholds approximate a demo municipal gate (wall RSI mapped from ~effective R-22 nomenclature, window U SI, ACH@50 Pa); not authoritative for permits.",
        "violations": [
          {
            "metric": "wall_RSI_effective",
            "observed": 3.5,
            "threshold": 3.8746,
            "delta": 0.3746,
            "message": "Wall RSI (effective, minimum across modeled walls 3.5) is 0.3746 RSI below demo target (~imperial equivalent R-22 framing)."
          }
        ],
        "parseNotes": ["seed_demo_calgary_portfolio"]
      }$c$
    ),
    (
      'Chinook LRT / Macleod Tr — demo pin',
      3.2::double precision,
      1.8::double precision,
      4.5::double precision,
      51.0022::double precision,
      -114.0740::double precision,
      false,
      $c${
        "thresholds": {"minWallRSI": 3.8746037337090526, "maxWindowU": 1.4, "maxACH": 2.5},
        "notes": "Thresholds approximate a demo municipal gate (wall RSI mapped from ~effective R-22 nomenclature, window U SI, ACH@50 Pa); not authoritative for permits.",
        "violations": [
          {
            "metric": "wall_RSI_effective",
            "observed": 3.2,
            "threshold": 3.8746,
            "delta": 0.6746,
            "message": "Wall RSI (effective, minimum across modeled walls 3.2) is 0.6746 RSI below demo target (~imperial equivalent R-22 framing)."
          },
          {
            "metric": "window_U",
            "observed": 1.8,
            "threshold": 1.4,
            "delta": 0.4,
            "message": "Worst glazing U-factor 1.8 W/(m²·K) exceeds demo limit 1.4 by 0.4."
          },
          {
            "metric": "ACH",
            "observed": 4.5,
            "threshold": 2.5,
            "delta": 2,
            "message": "Air leakage 4.5 ACH@50 Pa exceeds demo limit 2.5 by 2."
          }
        ],
        "parseNotes": ["seed_demo_calgary_portfolio"]
      }$c$
    ),
    (
      'University of Calgary — main campus',
      5.0::double precision,
      1.1::double precision,
      2.0::double precision,
      51.0779::double precision,
      -114.1342::double precision,
      true,
      $c${
        "thresholds": {"minWallRSI": 3.8746037337090526, "maxWindowU": 1.4, "maxACH": 2.5},
        "notes": "Thresholds approximate a demo municipal gate (wall RSI mapped from ~effective R-22 nomenclature, window U SI, ACH@50 Pa); not authoritative for permits.",
        "violations": [],
        "parseNotes": ["seed_demo_calgary_portfolio"]
      }$c$
    ),
    (
      'Marda Loop — 33 Ave SW corridor',
      4.95::double precision,
      1.15::double precision,
      2.1::double precision,
      51.0248::double precision,
      -114.0955::double precision,
      true,
      $c${
        "thresholds": {"minWallRSI": 3.8746037337090526, "maxWindowU": 1.4, "maxACH": 2.5},
        "notes": "Thresholds approximate a demo municipal gate (wall RSI mapped from ~effective R-22 nomenclature, window U SI, ACH@50 Pa); not authoritative for permits.",
        "violations": [],
        "parseNotes": ["seed_demo_calgary_portfolio"]
      }$c$
    )
) as v (
  address,
  r_value,
  u_value,
  ach_value,
  lat,
  lng,
  is_compliant,
  compliance_details
);
