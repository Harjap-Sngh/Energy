import 'mapbox-gl/dist/mapbox-gl.css'
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox'
import { MapPin } from 'lucide-react'
import { CALGARY_MAP_CENTER } from '@/lib/map'
import type { BuildingRow } from '@/types/database.types'

type Props = {
  buildings: BuildingRow[]
  token: string
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function BuildingMap({ buildings, token, selectedId, onSelect }: Props) {
  if (!token) {
    return (
      <div className="flex h-[340px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-400 bg-zinc-50 px-6 text-center text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
        <p className="font-medium">Mapbox token missing</p>
        <p className="mt-2">
          Add <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">VITE_MAPBOX_ACCESS_TOKEN</code> to{' '}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">.env.local</code>.
        </p>
      </div>
    )
  }

  let initialViewState: {
    latitude: number
    longitude: number
    zoom: number
  } = { ...CALGARY_MAP_CENTER, zoom: 10 }

  if (buildings.length === 1) {
    initialViewState = {
      latitude: buildings[0]!.lat,
      longitude: buildings[0]!.lng,
      zoom: 12,
    }
  }

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 sm:h-[420px] lg:h-[520px] [&_.mapboxgl-ctrl-bottom-right]:hidden">
      <Map
        mapboxAccessToken={token}
        initialViewState={initialViewState}
        reuseMaps
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={() => onSelect(null)}
      >
        <NavigationControl position="top-left" />
        {buildings.map((b) => {
          const compliant = Boolean(b.is_compliant)
          const isSelected = selectedId === b.id
          return (
            <Marker
              key={b.id}
              latitude={b.lat}
              longitude={b.lng}
              anchor="bottom"
              onClick={(ev) => {
                ev.originalEvent.stopPropagation()
                onSelect(isSelected ? null : b.id)
              }}
            >
              {isSelected ? (
                <div className="translate-y-[-2px]">
                  <MapPin
                    aria-label="Selected building"
                    fill="currentColor"
                    className={
                      compliant
                        ? 'h-7 w-7 text-emerald-600 drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]'
                        : 'h-7 w-7 text-red-600 drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]'
                    }
                  />
                </div>
              ) : (
                <div
                  aria-label={compliant ? 'Compliant' : 'Non-compliant'}
                  className={
                    compliant
                      ? 'h-3 w-3 cursor-pointer rounded-full border-2 border-white bg-emerald-500 shadow-md'
                      : 'h-3 w-3 cursor-pointer rounded-full border-2 border-white bg-red-500 shadow-md'
                  }
                />
              )}
            </Marker>
          )
        })}
      </Map>
    </div>
  )
}
