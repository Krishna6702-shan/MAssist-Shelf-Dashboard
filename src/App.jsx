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
import SkuBrandsPage from "./pages/SkuBrandsPage";
import SkuTrainingPage from "./pages/SkuTrainingPage";

const pageComponents = {
  dashboard: DashboardPage,
  users: UsersPage,
  submissions: SubmissionsPage,
  sku: SkuBrandsPage,
  skuTraining: SkuTrainingPage,
  storeByStore: StoreByStorePage,
  export: ExportPage,
  planogram: PlanogramPage,
};

const App = () => {
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);

  const handleLogout = async () => {
    const sessionToken = localStorage.getItem('sessionToken');

    if (sessionToken) {
      try {
        const formData = new FormData();
        formData.append("session_token", sessionToken);

        await fetch('/logout', {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        console.error('Logout request failed:', err);
      }
    }

    // Clear local storage
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');

    // Set auth state to false
    setAuthed(false);
  };

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
      <AppLayout page={page} setPage={setPage} onLogout={handleLogout}>
        <CurrentPage
          page={page}
          setPage={setPage}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedSku={selectedSku}
          setSelectedSku={setSelectedSku}
        />
      </AppLayout>
    </ThemeProvider>
  );
};

export default App;