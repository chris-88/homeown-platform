import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold">
            Homeown
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}

