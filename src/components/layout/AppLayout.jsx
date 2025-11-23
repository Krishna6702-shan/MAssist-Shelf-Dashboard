import React, { useEffect, useState } from "react";
import Logo from "../branding/Logo";
import { Icon } from "../icons";
import { Button } from "../ui";
import VoiceWaveBg from "../background/VoiceWaveBg";
import useRevealAnimation from "../../hooks/useRevealAnimation";

const navItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "users", label: "Users" },
  { key: "submissions", label: "Submissions" },
  { key: "training", label: "Training" },
  { key: "sku", label: "Organizations" },
  { key: "storeByStore", label: "Store-by-Store" },
  { key: "export", label: "Export" },
  { key: "planogram", label: "Planogram" },
];

const AppLayout = ({ page, setPage, children }) => {
  useRevealAnimation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  // ✅ JWT-based logout
  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");

      // Try to call backend logout (optional - clears server-side sessions if any)
      if (accessToken) {
        try {
          await fetch("http://localhost:8000/api/auth/logout", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`
            }
          });
        } catch (err) {
          console.error("Backend logout failed:", err);
          // Continue anyway - client-side logout is more important
        }
      }

      // ✅ Clear all auth data
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");

      // ✅ Redirect to login
      window.location.href = "/";

    } catch (err) {
      console.error("Logout error:", err);
      // Force logout even on error
      localStorage.clear();
      window.location.href = "/";
    }
  };

  // ✅ Get user info for display (optional)
  const [userName, setUserName] = useState("");

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.full_name || user.email?.split('@')[0] || "User");
      }
    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  }, []);

  useEffect(() => {
    const onEsc = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const NavButton = ({ item }) => {
    const isActive = page === item.key;
    return (
      <button
        onClick={() => {
          setPage(item.key);
          setSidebarOpen(false);
        }}
        className={`group flex w-full items-center gap-3 rounded-xl px-4 py-2 text-left text-sm font-medium transition duration-200 ease-brand ${
          isActive ? "bg-black/15 text-black" : "hover:bg-black/10"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="text-lg" aria-hidden="true">
          •
        </span>
        {item.label}
      </button>
    );
  };

  return (
    <div className="relative flex min-h-screen text-black">
      <VoiceWaveBg />

      {/* Desktop Sidebar */}
      <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 border border-black/12 bg-white px-4 pb-6 pt-4 md:block">
        <div className="flex h-16 items-center gap-3">
          <Logo />
        </div>
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <NavButton key={item.key} item={item} />
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4">
              <Logo />
              <button onClick={() => setSidebarOpen(false)}>
                <Icon.x className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-6 space-y-1 px-4">
              {navItems.map((item) => (
                <NavButton key={item.key} item={item} />
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-20 flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-black/12 bg-white/90 px-4 backdrop-blur-xl sm:h-16 sm:px-6">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Icon.menu className="h-6 w-6" />
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <Logo />
          </div>

          <div className="relative ml-auto w-full max-w-xl">
            <Icon.search className="pointer-events-none absolute left-4 top-2.5 h-4 w-4" />
            <input
              placeholder="Search here..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-full border border-black/15 bg-white py-2 pl-10 pr-4 text-sm"
            />
          </div>

          <div className="ml-4 flex items-center gap-3">
            {/* ✅ Show username */}
            {userName && (
              <span className="hidden sm:inline text-sm text-gray-700">
                Hi, {userName}
              </span>
            )}
            <button
              className="text-sm font-semibold hover:text-red-600 transition-colors"
              onClick={handleLogout}
            >
              Sign out
            </button>
            <Button>Start free</Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

