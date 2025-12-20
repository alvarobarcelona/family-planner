import { useState, useEffect } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { HomeScreen } from "./screens/HomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { VisualCalendarScreen } from "./screens/VisualCalendarScreen";
import { NewTaskScreen } from "./screens/NewTaskScreen";
import { EditTaskScreen } from "./screens/EditTaskScreen";
import { ShoppingListScreen } from "./screens/ShoppingListScreen";
import { TaskProvider } from "./store/useTaskStore";
import { useNotifications } from "./hooks/useNotifications";

function AppContent() {
  useNotifications();

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 flex flex-col relative">
      <main className="flex-1 w-full mx-auto px-4 py-4 pb-36 pb-[calc(9rem+env(safe-area-inset-bottom))] max-w-md md:max-w-4xl lg:max-w-6xl transition-all duration-300">
        <nav className="fixed bottom-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[90%] md:w-[60%] max-w-[600px] bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl z-50 transition-all duration-300">
          <div className="flex flex-col gap-2 py-3 px-2">
            {/* First Row: Hoy, Agenda, Calendario, + */}
            <div className="flex justify-around items-center w-full">
              <NavLink
                to="/"
                className={({ isActive }) => `flex flex-col items-center gap-0.5 transition 
                        ${isActive ? "text-slate-900 font-semibold" : "text-gray-500"} hover:text-slate-900`
                }
              >
                <span className="text-lg">Hoy</span>
              </NavLink>

              <NavLink
                to="/calendar" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition 
                ${isActive ? "text-slate-900 font-semibold" : "text-gray-500"} hover:text-slate-900`
                }
              >
                <span className="text-lg">Agenda</span>
              </NavLink>

              <NavLink
                to="/visual-calendar" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition 
                ${isActive ? "text-slate-900 font-semibold" : "text-gray-500"} hover:text-slate-900`
                }
              >
                <span className="text-lg">Calendario</span>
              </NavLink>

              <NavLink
                to="/new" className={({ isActive }) => `flex flex-col items-center justify-center rounded-full w-10 h-10 shadow-lg shadow-indigo-500/30 text-sm font-medium transition-transform active:scale-95 
                ${isActive ? "bg-indigo-600" : "bg-indigo-600"} text-white hover:bg-indigo-700`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </NavLink>
            </div>

            {/* Second Row: Compras */}
            <div className="flex justify-center items-center w-full">
              <NavLink
                to="/shopping-list" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition 
                ${isActive ? "text-slate-900 font-semibold" : "text-gray-500"} hover:text-slate-900`
                }
              >
                <span className="text-lg">Compras</span>
              </NavLink>
            </div>
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
