import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export function Login() {
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } } | undefined)?.from
      ?.pathname ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setAuthed(true);
    });
  }, []);

  if (authed) return <Navigate to={from} replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "sign-in") {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
        if (!data.session) {
          throw new Error(
            "No session returned — check Supabase email confirmation settings.",
          );
        }
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
        });
        if (err) throw err;
        if (!data.session) {
          setError(
            "Account created. Confirm the email Supabase sends, or disable confirmations in Auth settings for local demos.",
          );
          setLoading(false);
          return;
        }
      }
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-950">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          GreenSync
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Municipal energy compliance dashboard (demo)
        </p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </CardTitle>
          <CardDescription>
            Use the email/password provider enabled in your Supabase project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Please wait…"
                : mode === "sign-in"
                  ? "Sign in"
                  : "Sign up"}
            </Button>
          </form>
          <button
            type="button"
            className="mt-4 w-full text-center text-sm text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
            onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          >
            {mode === "sign-in"
              ? "Need an account? Sign up"
              : "Have an account? Sign in"}
          </button>
        </CardContent>
      </Card>
      <p className="mt-6 max-w-md text-center text-xs text-zinc-500">
        Portfolio demo only — configure your own Supabase project before
        handling real municipal data.
      </p>
    </div>
  );
}
