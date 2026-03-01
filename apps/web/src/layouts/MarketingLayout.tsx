import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function MarketingLayout() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-semibold">
            Homeown
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link to="/how-it-works" className="text-sm hover:underline">
              How it works
            </Link>
            <Link to="/faq" className="text-sm hover:underline">
              FAQ
            </Link>
            <Link to="/calc" className="text-sm hover:underline">
              Calculator
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link to="/auth/login">Log in</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link to="/terms" className="hover:underline">
            Terms
          </Link>
          <Link to="/contact" className="hover:underline">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}

