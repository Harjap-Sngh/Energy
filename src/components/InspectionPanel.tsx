import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { BuildingRow } from "@/types/database.types";

type Props = {
  building: BuildingRow | null;
  variant?: "card" | "plain";
};

export function InspectionPanel({ building, variant = "card" }: Props) {
  if (!building) {
    if (variant === "plain") return null;
    return (
      <Card className="h-full border-dashed">
        <CardHeader>
          <CardTitle>Inspection panel</CardTitle>
          <CardDescription>
            Select a row or marker to review metrics and commentary.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const d = building.compliance_details;

  const body = (
    <div className="space-y-4 text-sm">
      <dl className="grid grid-cols-2 gap-2">
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Wall RSI (min)</dt>
          <dd className="font-mono text-base">{building.r_value.toFixed(4)} RSI</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Window U</dt>
          <dd className="font-mono text-base">
            {building.u_value.toFixed(3)} W/(m²·K)
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">ACH@50</dt>
          <dd className="font-mono text-base">{building.ach_value.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Coordinates</dt>
          <dd className="font-mono text-xs">
            {building.lat.toFixed(4)}, {building.lng.toFixed(4)}
          </dd>
        </div>
      </dl>
      <Separator />
      <div>
        <p className="mb-2 font-semibold text-zinc-800 dark:text-zinc-100">
          Compliance engine
        </p>
        <ul className="list-inside list-disc space-y-1 text-zinc-600 dark:text-zinc-300">
          <li>
            Min wall RSI (~R-22 demo): &gt;= {d.thresholds.minWallRSI.toFixed(3)}
          </li>
          <li>Max window U: &lt;= {d.thresholds.maxWindowU}</li>
          <li>Max ACH@50: &lt;= {d.thresholds.maxACH}</li>
        </ul>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{d.notes}</p>
      </div>
      {d.violations.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="mb-2 font-semibold text-red-700 dark:text-red-400">
              Violations
            </p>
            <ul className="space-y-2">
              {d.violations.map((v, i) => (
                <li
                  key={i}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
                >
                  {v.message}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      {d.parseNotes && d.parseNotes.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Parse notes</p>
            <ul className="list-inside list-disc text-zinc-600 dark:text-zinc-300">
              {d.parseNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );

  if (variant === "plain") {
    return (
      <div className="space-y-2">
        <div>
          <p className="text-base font-semibold tracking-tight">
            {building.address}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {building.is_compliant
              ? "Demo gate passes all three checks."
              : "One or more demo checks failed."}
          </p>
        </div>
        {body}
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{building.address}</CardTitle>
        <CardDescription>
          {building.is_compliant
            ? "Demo gate passes all three checks."
            : "One or more demo checks failed."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">{body}</CardContent>
    </Card>
  );
}
