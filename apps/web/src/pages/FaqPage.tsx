import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Seo from "@/components/Seo";

export default function FaqPage() {
  return (
    <div className="grid gap-6">
      <Seo
        title="Homeown — FAQ"
        description="Frequently asked questions about the Homeown pathway."
      />

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <div className="grid gap-1">
            <div className="font-medium text-foreground">
              Do I need to give my details to use the calculator?
            </div>
            <div>
              No. The calculator is anonymous-first. You only share contact
              details if you choose to save results and proceed.
            </div>
          </div>

          <div className="grid gap-1">
            <div className="font-medium text-foreground">
              What does “purchase option” mean?
            </div>
            <div>
              It means you may choose to buy at the strike price at completion.
              It is a right, not an obligation.
            </div>
          </div>

          <div className="grid gap-1">
            <div className="font-medium text-foreground">
              Is mortgage approval guaranteed?
            </div>
            <div>
              No. Mortgage approval (if you choose to proceed at completion) is
              determined by an independent regulated lender at that time.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

