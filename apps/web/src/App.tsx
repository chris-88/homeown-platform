import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import MarketingLayout from "@/layouts/MarketingLayout";
import AuthLayout from "@/layouts/AuthLayout";
import PortalLayout from "@/layouts/PortalLayout";
import HomePage from "@/pages/HomePage";
import CalcPage from "@/pages/CalcPage";
import SaveResultsPage from "@/pages/SaveResultsPage";
import AuthLoginPage from "@/pages/AuthLoginPage";
import PortalIndexPage from "@/pages/PortalIndexPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="/how-it-works"
            element={<PlaceholderPage title="How it works" />}
          />
          <Route path="/faq" element={<PlaceholderPage title="FAQ" />} />
          <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
          <Route path="/privacy" element={<PlaceholderPage title="Privacy" />} />
          <Route path="/terms" element={<PlaceholderPage title="Terms" />} />
          <Route path="/calc" element={<CalcPage />} />
          <Route path="/calc/save" element={<SaveResultsPage />} />
        </Route>

        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login" element={<AuthLoginPage />} />
        </Route>

        <Route path="/app" element={<PortalLayout />}>
          <Route index element={<Navigate to="/app/client" replace />} />
          <Route path="client/*" element={<PortalIndexPage kind="client" />} />
          <Route path="agent/*" element={<PortalIndexPage kind="agent" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
}

