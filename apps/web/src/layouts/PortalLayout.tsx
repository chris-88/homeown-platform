import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { clearAccessToken } from "@/auth/token";

export default function PortalLayout() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/app/client" className="text-lg font-semibold">
            Homeown Portal
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              clearAccessToken();
              window.location.hash = "#/auth/login";
            }}
          >
            Log out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

