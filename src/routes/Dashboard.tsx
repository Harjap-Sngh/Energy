import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { BuildingMap } from "@/components/BuildingMap";
import { BuildingTable } from "@/components/BuildingTable";
import { DemoBanner } from "@/components/DemoBanner";
import { H2kUpload } from "@/components/H2kUpload";
import { InspectionPanel } from "@/components/InspectionPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import type { BuildingRow, ComplianceDetails } from "@/types/database.types";

export function Dashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const mapToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";

  const { data: userEmail } = useQuery({
    queryKey: ["auth-email"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.email ?? "(session)";
    },
  });

  const buildingsQuery = useQuery({
    queryKey: ["buildings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as BuildingRow[];
      return rows.map((row) => ({
        ...row,
        compliance_details: row.compliance_details as ComplianceDetails,
      }));
    },
  });

  const buildings = buildingsQuery.data ?? [];
  const selected = buildings.find((b) => b.id === selectedId) ?? null;

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <DemoBanner />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            GreenSync dashboard
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {userEmail}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void signOut()}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4 lg:gap-6 lg:px-8 lg:py-6">
        {buildingsQuery.isError && (
          <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
            {(buildingsQuery.error as Error).message}
          </p>
        )}

        <H2kUpload />

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight">
            Submitted buildings
          </h2>
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              size="sm"
              variant={mobileView === "list" ? "default" : "outline"}
              onClick={() => setMobileView("list")}
            >
              List
            </Button>
            <Button
              size="sm"
              variant={mobileView === "map" ? "default" : "outline"}
              onClick={() => setMobileView("map")}
            >
              Map
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <div className={mobileView === "list" ? "hidden lg:block" : ""}>
            <BuildingMap
              buildings={buildings}
              token={mapToken}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <Card
            className={
              "flex min-h-0 min-w-0 flex-col sm:h-[60vh] sm:min-h-[360px] sm:max-h-[520px] lg:h-[520px] " +
              (mobileView === "map" ? "hidden lg:flex" : "")
            }
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base">List</CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-hidden">
              <div className="h-full w-full overflow-auto">
                <BuildingTable
                  buildings={buildings}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog
          open={Boolean(selectedId)}
          onOpenChange={(open) => {
            if (!open) setSelectedId(null);
          }}
        >
          <DialogContent className="max-h-[85vh] overflow-auto">
            <InspectionPanel building={selected} variant="plain" />
            <div className="mt-5 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedId(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
