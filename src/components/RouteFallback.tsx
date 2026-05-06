export function RouteFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-zinc-50 px-6 text-center text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
      <span className="text-sm font-medium">Loading dashboard…</span>
      <span className="max-w-xs text-xs">
        First load bundles the map (~1.8 MB uncompressed).
      </span>
    </div>
  );
}
