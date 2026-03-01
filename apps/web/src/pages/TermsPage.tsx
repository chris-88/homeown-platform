import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Seo from "@/components/Seo";

export default function TermsPage() {
  return (
    <div className="grid gap-6">
      <Seo
        title="Homeown — Terms"
        description="Terms of use for the Homeown website (draft for MVP)."
      />

      <Card>
        <CardHeader>
          <CardTitle>Terms</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <div>
            Draft placeholder for Cohort Zero MVP. Do not rely on this text for
            production until counsel-approved.
          </div>
          <div>
            This site provides information about the Homeown pathway and a
            diagnostic calculator. Outputs are indicative only and are not a
            commitment or decision.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

