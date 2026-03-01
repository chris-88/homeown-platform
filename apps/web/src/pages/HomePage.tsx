import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Seo from "@/components/Seo";

export default function HomePage() {
  return (
    <div className="grid gap-6">
      <Seo
        title="Homeown — Cohort Zero"
        description="Homeown is a structured service pathway with an anonymous-first calculator."
      />
      <Card>
        <CardHeader>
          <CardTitle>Homeown</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            A structured service pathway with an anonymous-first calculator.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/calc">Use the calculator</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/how-it-works">How it works</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth/login">Log in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
