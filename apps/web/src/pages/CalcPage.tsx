import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalcPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Calculator</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Placeholder route shell. Implement per Epic 02/03 tickets.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/calc/save">Save results</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/">Back</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

