import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { config } from "@/config";
import { directusPublic } from "@/api/client";
import { setAccessToken } from "@/auth/token";

export default function AuthLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            setError(null);
            try {
              const res = await directusPublic.login(email, password);
              setAccessToken(res.access_token);
              navigate("/app/client", { replace: true });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Login failed");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div className="grid gap-1">
            <label className="text-sm" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        {error ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
            {error}
          </div>
        ) : null}

        <div className="text-xs text-muted-foreground">
          Directus: <span className="font-mono">{config.directusUrl}</span>
        </div>
      </CardContent>
    </Card>
  );
}
