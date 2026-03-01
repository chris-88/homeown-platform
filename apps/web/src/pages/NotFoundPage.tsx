import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Not found</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="text-sm text-muted-foreground">
          This route does not exist.
        </div>
        <div>
          <Button asChild variant="secondary">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

