import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Seo from "@/components/Seo";

export default function HowItWorksPage() {
  return (
    <div className="grid gap-6">
      <Seo
        title="Homeown — How it works"
        description="A structured service pathway from eligibility and verification through sale agreed, acquisition, occupation, and completion."
      />

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <p>
            Homeown delivers a structured service pathway: eligibility and
            readiness checks, onboarding and verification, progressing a chosen
            property to sale agreed, then moving through the pathway milestones
            to completion.
          </p>

          <div className="grid gap-2">
            <div className="font-medium text-foreground">What Homeown is</div>
            <ul className="list-disc space-y-1 pl-5">
              <li>An eligibility and readiness process (verification first)</li>
              <li>A guided route to progress a property to sale agreed</li>
              <li>
                A pathway with clear milestones and evidence (documents and
                notices)
              </li>
              <li>
                A purchase option at a fixed strike price (a right, not an
                obligation)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What this is not</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <p className="text-sm text-muted-foreground">
            Drift-prevention guardrails: platform copy and data models must stay
            within the approved perimeter and language.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Not a loan or a credit product</li>
            <li>Not a deposit product or a savings account</li>
            <li>Not an instalment purchase</li>
            <li>Not a tenancy or a landlord arrangement</li>
          </ul>

          <div className="grid gap-2">
            <div className="font-medium text-foreground">Required notes</div>
            <ul className="list-disc space-y-1 pl-5">
              <li>Homeown is not a lender.</li>
              <li>Homeown does not provide mortgage credit.</li>
              <li>Mortgage approval is not guaranteed.</li>
              <li>The purchase option is a right, not an obligation.</li>
              <li>Domiter is a service fee, not rent and not savings.</li>
              <li>
                Your ownership stake (Class C Units) is at risk and may be
                cancelled on exit or termination.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
