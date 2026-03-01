import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import MarketingLayout from "@/layouts/MarketingLayout";
import AuthLayout from "@/layouts/AuthLayout";
import PortalLayout from "@/layouts/PortalLayout";
import HomePage from "@/pages/HomePage";
import HowItWorksPage from "@/pages/HowItWorksPage";
import FaqPage from "@/pages/FaqPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import CalcPage from "@/pages/CalcPage";
import SaveResultsPage from "@/pages/SaveResultsPage";
import AuthLoginPage from "@/pages/AuthLoginPage";
import PortalIndexPage from "@/pages/PortalIndexPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/calc" element={<CalcPage />} />
          <Route path="/calc/results" element={<CalcPage />} />
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
