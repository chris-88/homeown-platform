import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { directusAuthed } from "@/api/client";

export default function PortalIndexPage(props: { kind: "client" | "agent" }) {
  const [meResponse, setMeResponse] = useState<string>("");

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {props.kind === "client" ? "Client portal" : "Agent portal"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <div>Placeholder route shell. Implement per Epic 04+ tickets.</div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={async () => {
                const res = await directusAuthed.request<unknown>("/users/me");
                setMeResponse(JSON.stringify(res, null, 2));
              }}
            >
              Test /users/me
            </Button>
          </div>
          {meResponse ? (
            <pre className="max-h-64 overflow-auto rounded-md border bg-background/40 p-3 text-xs text-foreground">
              {meResponse}
            </pre>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
