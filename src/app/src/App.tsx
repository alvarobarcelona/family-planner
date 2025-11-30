import { Routes, Route, NavLink } from "react-router-dom";
import { HomeScreen } from "./screens/HomeScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { VisualCalendarScreen } from "./screens/VisualCalendarScreen";
import { NewTaskScreen } from "./screens/NewTaskScreen";
import { EditTaskScreen } from "./screens/EditTaskScreen";
import { TaskProvider } from "./store/useTaskStore";

export default function App() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-[#fdfbf7] text-slate-900 flex flex-col relative">
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
          <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl z-50">
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
                <span className="text-sm">Eventos</span>
              </NavLink>

              <NavLink
                to="/visual-calendar" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition 
                ${isActive ? "text-slate-900 font-semibold" : "text-gray-500"} hover:text-slate-900`
                }
              >
                <span className="text-sm">Calendario</span>
              </NavLink>

              <NavLink
                to="/new" className={({ isActive }) => `flex flex-col items-center justify-center rounded-full w-10 h-10 shadow-lg shadow-indigo-500/30 text-sm font-medium transition-transform active:scale-95 
                ${isActive ? "bg-indigo-600" : "bg-indigo-600"} text-white hover:bg-indigo-700`
                }
              >
                ➕
              </NavLink>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/calendar" element={<CalendarScreen />} />
            <Route path="/visual-calendar" element={<VisualCalendarScreen />} />
            <Route path="/new" element={<NewTaskScreen />} />
            <Route path="/edit/:taskId" element={<EditTaskScreen />} />
          </Routes>
        </main>
      </div>
    </TaskProvider>
  );
}
