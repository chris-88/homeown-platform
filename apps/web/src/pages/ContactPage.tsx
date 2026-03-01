import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Seo from "@/components/Seo";

export default function ContactPage() {
  return (
    <div className="grid gap-6">
      <Seo
        title="Homeown — Contact"
        description="Contact Homeown about the pathway."
      />

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <div>
            For Cohort Zero MVP, keep intake minimal. Use the calculator first,
            then choose “Save results” if you want Homeown to follow up.
          </div>
          <div>
            Email:{" "}
            <a className="underline" href="mailto:hello@homeown.example">
              hello@homeown.example
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

