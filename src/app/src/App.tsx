import { useState, useEffect } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { HomeScreen } from "./screens/HomeScreen";
import { AdminScreen } from "./screens/AdminScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { VisualCalendarScreen } from "./screens/VisualCalendarScreen";
import { NewTaskScreen } from "./screens/NewTaskScreen";
import { EditTaskScreen } from "./screens/EditTaskScreen";
import { ShoppingListScreen } from "./screens/ShoppingListScreen";
import { TaskProvider } from "./store/useTaskStore";
import { useNotifications } from "./hooks/useNotifications";
import { ShoppingProvider } from "./store/useShoppingStore";
import { FamilyWallProvider } from "./store/useFamilyWallStore";

function AppContent() {
  useNotifications();

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 flex flex-col relative">
      <main className="flex-1 w-full mx-auto px-4 py-4 pb-36 pb-[calc(9rem+env(safe-area-inset-bottom))] max-w-md md:max-w-4xl lg:max-w-6xl transition-all duration-300">
        <nav className="fixed bottom-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[95%] md:w-[60%] max-w-[350px] bg-white/90 backdrop-blur-xl border border-black/50 shadow-2xl shadow-slate-200/50 rounded-2xl z-50 transition-all duration-300">
          <div className="grid grid-cols-5 items-end justify-items-center py-2 px-1 h-[4.5rem]">

            {/* 1. Hoy */}
            <NavLink
              to="/"
              className={({ isActive }) => `flex flex-col items-center gap-1 pb-2 transition-all duration-300 w-full
                      ${isActive ? "text-indigo-600" : "text-gray-400 hover:text-slate-600"}`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className="text-[10px] font-medium">Hoy</span>
            </NavLink>

            {/* 2. Agenda */}
            <NavLink
              to="/calendar" className={({ isActive }) => `flex flex-col items-center gap-1 pb-2 transition-all duration-300 w-full
              ${isActive ? "text-indigo-600" : "text-gray-400 hover:text-slate-600"}`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 17.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span className="text-[10px] font-medium">Agenda</span>
            </NavLink>

            {/* 3. New Task (Floating) */}
            <div className="relative w-full flex justify-center h-full">
              <NavLink
                to="/new" className={({ isActive }) => `absolute -top-6 flex flex-col items-center justify-center rounded-full w-14 h-14 shadow-xl shadow-pink-500/30 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isActive ? "bg-gradient-to-r from-pink-500 to-rose-600 scale-110 rotate-180" : "bg-gradient-to-r from-pink-400 to-rose-500"} text-white hover:scale-110 hover:shadow-pink-500/50 active:scale-95 active:rotate-90`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </NavLink>
            </div>

            {/* 4. Calendario */}
            <NavLink
              to="/visual-calendar" className={({ isActive }) => `flex flex-col items-center gap-1 pb-2 transition-all duration-300 w-full
              ${isActive ? "text-indigo-600" : "text-gray-400 hover:text-slate-600"}`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0h18M5.25 20.25h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <span className="text-[10px] font-medium">Calendario</span>
            </NavLink>

            {/* 5. Compras */}
            <NavLink
              to="/shopping-list" className={({ isActive }) => `flex flex-col items-center gap-1 pb-2 transition-all duration-300 w-full
              ${isActive ? "text-indigo-600" : "text-gray-400 hover:text-slate-600"}`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <span className="text-[10px] font-medium">Compras</span>
            </NavLink>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/calendar" element={<CalendarScreen />} />
          <Route path="/visual-calendar" element={<VisualCalendarScreen />} />
          <Route path="/shopping-list" element={<ShoppingListScreen />} />
          <Route path="/new" element={<NewTaskScreen />} />
          <Route path="/edit/:taskId" element={<EditTaskScreen />} />
        </Routes>
      </main>
    </div>
  );
}

import { ModalProvider } from "./context/ModalContext";

// ... imports remain the same

// ... AppContent component remains the same

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const path = window.location.pathname;
  if (path === "/admin") {
    return <AdminScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <TaskProvider>
      <ModalProvider>
        <ShoppingProvider>
          <FamilyWallProvider>
            <AppContent />
          </FamilyWallProvider>
        </ShoppingProvider>
      </ModalProvider>
    </TaskProvider>
  );
}
