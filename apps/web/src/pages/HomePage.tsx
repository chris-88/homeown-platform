import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Build the Cohort Zero platform</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Sprint 0 scaffold: routes, styling baseline, and Directus connectivity.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/calc">Open calculator</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/auth/login">Log in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2 text-sm text-muted-foreground">
        <div>
          Public routes: <span className="font-mono">/#/</span>,{" "}
          <span className="font-mono">/#/calc</span>,{" "}
          <span className="font-mono">/#/calc/save</span>
        </div>
        <div>
          Portal routes: <span className="font-mono">/#/app/client</span>,{" "}
          <span className="font-mono">/#/app/agent</span>
        </div>
      </div>
    </div>
  );
}

