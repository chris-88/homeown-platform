import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Seo from "@/components/Seo";

export default function PrivacyPage() {
  return (
    <div className="grid gap-6">
      <Seo
        title="Homeown — Privacy"
        description="Privacy information for the Homeown pathway (draft for MVP)."
      />

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <div>
            Draft placeholder for Cohort Zero MVP. Do not rely on this text for
            production until counsel-approved.
          </div>
          <div>
            The calculator is anonymous-first. Contact details are collected
            only when you explicitly choose to save results and provide consent.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

