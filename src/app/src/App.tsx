import { Routes, Route, NavLink } from "react-router-dom";
import { HomeScreen } from "./screens/HomeScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { NewTaskScreen } from "./screens/NewTaskScreen";
import { TaskProvider } from "./store/useTaskStore";

export default function App() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <main className="flex-1 max-w-md w-full mx-auto px-3 py-2">
          <nav className="border bg-white max-w-md w-full mx-auto">
            <div className="flex justify-around items-center py-2 text-xs">
              <NavLink
                to="/"
                className={({ isActive }) =>`flex flex-col items-center gap-0.5 transition 
                        ${isActive ? "text-slate-900 font-semibold" : "text-gray-500"} hover:text-slate-900`
                }
              >
                <span className="text-sm">Hoy</span>
              </NavLink>

              <NavLink
                to="/calendar" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition 
                ${isActive ? "text-slate-900 font-semibold" : "text-gray-500"} hover:text-slate-900`
                }
              >
                <span className="text-sm">Calendario</span>
              </NavLink>

              <NavLink
                to="/new" className={({ isActive }) => `flex flex-col items-center rounded-full px-5 py-2 shadow-md text-sm font-medium transition 
                ${isActive ? "bg-slate-800" : "bg-slate-900"} text-white hover:bg-slate-800`
                }
              >
                ➕ Nuevo
              </NavLink>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/calendar" element={<CalendarScreen />} />
            <Route path="/new" element={<NewTaskScreen />} />
          </Routes>
        </main>
      </div>
    </TaskProvider>
  );
}
