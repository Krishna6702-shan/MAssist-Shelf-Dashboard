import React, { useState } from "react";
import AppLayout from "./components/layout/AppLayout";
import { ThemeProvider } from "./context/ThemeContext";
import DashboardPage from "./pages/DashboardPage";
import ExportPage from "./pages/ExportPage";
import LoginPage from "./pages/LoginPage";
import PlanogramPage from "./pages/PlanogramPage";
import StoreByStorePage from "./pages/StoreByStorePage";
import SubmissionsPage from "./pages/SubmissionsPage";
import UsersPage from "./pages/UsersPage";
import SkuTrainingPage from "./pages/SkuTrainingPage";
import OrganizationPage from "./pages/OrganizationPage";
import OrganizationDetailsPage from './pages/OrganizationDetailsPage';

const pageComponents = {
  dashboard: DashboardPage,
  users: UsersPage,
  submissions: SubmissionsPage,
  training: SkuTrainingPage,
  sku: OrganizationPage,
  storeByStore: StoreByStorePage,
  export: ExportPage,
  planogram: PlanogramPage,
  organizationDetails: OrganizationDetailsPage,
};

const App = () => {
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [selectedOrgId, setSelectedOrgId] = useState(null); // ✅ NEW: Store selected org

  if (!authed) {
    return (
      <ThemeProvider>
        <LoginPage onLogin={() => setAuthed(true)} />
      </ThemeProvider>
    );
  }

  const CurrentPage = pageComponents[page] || DashboardPage;

  return (
    <ThemeProvider>
      <AppLayout page={page} setPage={setPage}>
        <CurrentPage
          page={page}
          setPage={setPage}
          selectedOrgId={selectedOrgId}           // ✅ Pass selected org ID
          setSelectedOrgId={setSelectedOrgId}    // ✅ Pass setter
        />
      </AppLayout>
    </ThemeProvider>
  );
};

export default App;