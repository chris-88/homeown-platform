import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlaceholderPage(props: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Placeholder route shell.
      </CardContent>
    </Card>
  );
}

