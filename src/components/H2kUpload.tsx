import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type DragEvent, useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { evaluateDemoCompliance, isDetailsCompliant } from "@/lib/compliance";
import { fileIsH2k, parseH2kFile } from "@/lib/parseH2k";
import { supabase } from "@/lib/supabase";
import type { ComplianceDetails } from "@/types/database.types";

export function H2kUpload() {
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  const ingest = useMutation({
    mutationKey: ["ingest-h2k"],
    mutationFn: async (file: File) => {
      const parsed = await parseH2kFile(file);
      if (parsed.ok === false) throw new Error(parsed.errors.join(" "));

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("Not signed in.");

      const evalRes = evaluateDemoCompliance(parsed.data.metrics);
      const details: ComplianceDetails = {
        ...evalRes,
        parseNotes: parsed.data.notes,
      };

      const row = {
        user_id: user.id,
        address: parsed.data.address,
        r_value: parsed.data.metrics.wallRSIMin,
        u_value: parsed.data.metrics.worstWindowUSI,
        ach_value: parsed.data.metrics.achN50,
        lat: parsed.data.lat,
        lng: parsed.data.lng,
        is_compliant: isDetailsCompliant(details),
        compliance_details: details,
        source: "h2k_upload",
        parsed_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("buildings").insert(row);
      if (error) throw error;
      return row.address;
    },
    onSuccess: (address) => {
      void queryClient.invalidateQueries({ queryKey: ["buildings"] });
      toast.success("Building ingested", { description: address });
    },
    onError: (e: Error) => {
      toast.error("Upload failed", { description: e.message });
    },
  });

  const processFile = useCallback(
    async (file: File) => {
      if (!fileIsH2k(file.name)) {
        toast.error("Invalid file", {
          description:
            "Only `.h2k` or `.xml` (UTF-8 HOT2000 / GreenSync) files are accepted.",
        });
        return;
      }
      setBusy(true);
      try {
        await ingest.mutateAsync(file);
      } finally {
        setBusy(false);
      }
    },
    [ingest],
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) void processFile(f);
    },
    [processFile],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">HOT2000 / GreenSync intake</CardTitle>
        <CardDescription>
          Drop `.h2k` or demo `.xml`. GreenSync reads blower ACH, wall RSI,
          window RSI → U, or a GreenSyncCompliance overlay.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-6 text-center text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300"
        >
          {busy || ingest.isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Parsing &amp; saving…
            </div>
          ) : (
            <>
              <p className="font-medium">
                Drag &amp; drop `.h2k` or `.xml` here
              </p>
              <p className="mt-1 text-xs">or choose a file below</p>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" disabled={busy || ingest.isPending} asChild>
          <label className="cursor-pointer">
            Browse
            <input
              type="file"
              accept=".h2k,.xml,application/xml,text/xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void processFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </Button>
      </CardFooter>
    </Card>
  );
}
