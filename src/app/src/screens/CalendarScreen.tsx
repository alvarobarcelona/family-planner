import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../store/useTaskStore";
import { useModal } from "../context/ModalContext";

type FilterAssigneeId = "all" | string;

function isTodayOrFuture(dateStr: string): boolean {
  const taskDate = new Date(dateStr);
  const today = new Date();

  taskDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return taskDate >= today;
}




export function CalendarScreen() {
  const navigate = useNavigate();
  const { confirm } = useModal();
  const { tasks, familyMembers, removeTask, toggleTaskCompletion } = useTaskStore();
  const [selectedAssigneeId, setSelectedAssigneeId] =
    useState<FilterAssigneeId>("all");
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollToToday, setShowScrollToToday] = useState(false);
  const todayRef = useRef<HTMLElement | null>(null);

  // 1) Filtramos por miembro y por búsqueda
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filtro por assignee
    if (selectedAssigneeId !== "all") {
      result = result.filter((task) =>
        task.assignees.some((a) => a.id === selectedAssigneeId)
      );
    }

    // Filtro por fecha (solo futuras/hoy)
    result = result.filter((task) => isTodayOrFuture(task.date));

    // Filtro por búsqueda (título o descripción)
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description?.toLowerCase() ?? "").includes(q)
      );
    }

    return result;
  }, [tasks, selectedAssigneeId, searchQuery]);

  const handleTaskClick = (taskId: string) => {
    const target = `/edit/${taskId}`;
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => navigate(target));
    } else {
      navigate(target);
    }
  };

  // 2) Agrupamos por fecha las tareas ya filtradas
  const grouped = useMemo(() => {
    const byDate: Record<string, typeof filteredTasks> = {};

    for (const task of filteredTasks) {
      // Determine start and end dates
      const startDate = new Date(task.date);
      const endDate = task.endDate ? new Date(task.endDate) : new Date(task.date);

      // Normalize to midnight to avoid time issues
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      // Iterate from start to end
      const current = new Date(startDate);
      while (current <= endDate) {
        // Format as YYYY-MM-DD
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        if (!byDate[dateStr]) byDate[dateStr] = [];
        byDate[dateStr].push(task);

        // Next day
        current.setDate(current.getDate() + 1);
      }
    }

    const sortedDates = Object.keys(byDate).sort();

    return sortedDates.map((date) => ({
      date,
      tasks: byDate[date].sort((a, b) =>
        (a.timeLabel ?? "").localeCompare(b.timeLabel ?? "")
      ),
    }));
  }, [filteredTasks]);

  // Observer to hide/show "Scroll to Today" button
  useEffect(() => {
    // Si no hay nodo de hoy, siempre mostramos el botón (para que puedan volver arriba u orientarse)
    // a menos que estén escribiendo en el buscador.
    if (!todayRef.current) {
      setShowScrollToToday(searchQuery.length === 0 && grouped.length > 0);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show button if Today is NOT visible
        setShowScrollToToday(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(todayRef.current);
    return () => observer.disconnect();
  }, [grouped.length, searchQuery.length]);

  const scrollToToday = () => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      // If today isn't rendered (e.g., no tasks today), just scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-3">
      <header className="mt-1 mb-2 space-y-3">
        <h1 className="text-xl font-semibold">Lista de eventos</h1>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar eventos, notas, familia..."
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Filtros por miembro (igual que en Hoy) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          type="button"
          onClick={() => setSelectedAssigneeId("all")}
          className={
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all  " +
            (selectedAssigneeId === "all"
              ? "bg-slate-800 text-white shadow-md shadow-slate-300"
              : "bg-white text-slate-600 border border-transparent shadow-sm hover:bg-slate-50")
          }
        >
          Todos
        </button>

        {familyMembers.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedAssigneeId(m.id)}
            className={
              "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all  " +
              (selectedAssigneeId === m.id
                ? "bg-slate-800 text-white shadow-md shadow-slate-300"
                : "bg-white text-slate-600 border border-transparent shadow-sm hover:bg-slate-50")
            }
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full ring-2 ring-white"
              style={{ backgroundColor: m.color }}
            />
            {m.name}
          </button>
        ))}
      </div>

      {grouped.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center opacity-80">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-500 font-medium">
            No encontramos tareas que coincidan.
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Intenta cambiar los filtros o añadir un evento nuevo.
          </p>
        </div>
      )}

      <div className="space-y-6 pl-1 pb-8 mt-4">

        {grouped.map(({ date, tasks }) => {
          const isToday = new Date().toISOString().slice(0, 10) === date;

          const isLast = grouped[grouped.length - 1].date === date;

          return (
            <section
              key={date}
              ref={isToday ? todayRef : null}
              className="relative flex gap-2 md:gap-3 items-start"
            >
              {/* Date Column with inline connector */}
              <div className="flex flex-col items-center mt-3 w-[28px] md:w-[44px] shrink-0 self-stretch">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider leading-none">
                  {new Date(date).toLocaleDateString("es-ES", { weekday: "short" })}
                </span>
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold shadow-sm border-4 border-[#fdfbf7] z-10 relative ${isToday ? "bg-indigo-600 text-white" : "bg-white text-slate-700 shadow-slate-200/50"}`}>
                  {new Date(date).getDate()}
                </div>
                {/* Vertical connector to next item */}
                {!isLast && (
                  <div className="flex-1 w-px mt-2 rounded-full bg-gradient-to-b from-indigo-200 via-slate-300 to-transparent" />
                )}
              </div>

              {/* Tasks Column */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pt-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task.id)}
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white px-4 py-3 flex flex-col gap-2 cursor-pointer transition-all duration-300 relative overflow-hidden group 
                      ${task.isCompleted ? "opacity-60" : ""} 
                      ${animatingTaskId === task.id ? "animate-pop" : "hover:shadow-md hover:bg-white hover:-translate-y-0.5"}`}
                  >
                    {/* Color indicator bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                      style={{ backgroundColor: task.color || task.assignees[0]?.color || '#ccc' }}
                    />

                    <div className="flex-1 pl-1">
                      <div className="flex justify-between items-start gap-2">
                        {/* Completion Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!task.isCompleted) {
                              setAnimatingTaskId(task.id);
                              setTimeout(() => setAnimatingTaskId(null), 1000);
                            }
                            toggleTaskCompletion(task.id);
                          }}
                          className="flex-shrink-0 relative z-10 p-2 -m-2 mt-0.5"
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors relative ${task.isCompleted
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 group-hover:border-green-400"
                            }`}>
                            {task.isCompleted && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {animatingTaskId === task.id && (
                              <div className="absolute -inset-2 rounded-full border-green-400 animate-burst pointer-events-none" />
                            )}
                          </div>
                        </button>

                        <div className="flex-1">
                          <p
                            className={
                              `text-sm font-semibold text-slate-700 leading-snug ${task.isCompleted ? "line-through text-slate-400" : ""} ` +
                              (task.title.length > 30 ? "whitespace-normal break-words" : "whitespace-nowrap")
                            }
                          >
                            {task.title}
                          </p>
                        </div>

                        <div>
                          {task.notificationTime != null && <span className="animate-bell-shake">🔔</span>}
                        </div>

                        {task.timeLabel && (
                          <p className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100/80 px-1.5 py-0.5 rounded-md flex-shrink-0">
                            {task.timeLabel} h
                          </p>
                        )}
                      </div>

                      <div className="flex gap-1 mt-1.5 flex-wrap ml-7">
                        {task.assignees.map((a) => (
                          <span
                            key={a.id}
                            className="text-[10px] px-2 py-0.5 rounded-full text-white shadow-sm"
                            style={{ backgroundColor: a.color }}
                          >
                            {a.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {task.description && (
                      <p className="mt-1 text-[11px] text-slate-500 whitespace-pre-line ml-8">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-2 ml-8 flex justify-between items-end">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">Prioridad:
                          {task.priority === "HIGH" && (
                            <span className="ml-1 text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">Alta</span>
                          )}
                          {task.priority === "MEDIUM" && (
                            <span className="ml-1 text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Media</span>
                          )}
                          {task.priority === "LOW" && (
                            <span className="ml-1 text-slate-400 font-bold">Baja</span>
                          )}
                        </span>
                        {task.createdBy && (
                          <span className="text-[9px] text-slate-400 mt-1">
                            Creado por {task.createdBy}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (task.seriesId) {
                            const deleteAll = await confirm("Este evento es parte de una serie.\n\n¿Quieres borrar TODA la serie?", {
                              title: "Serie Recurrente", confirmText: "Borrar Serie Completa", cancelText: "Borrar solo este"
                            });
                            if (deleteAll === true) {
                              const deleteSeries = await confirm("¿Estás SEGURO de que quieres borrar TODA la serie?", { title: "⚠️ Borrar Serie", confirmText: "Sí, borrar TODO" });
                              if (deleteSeries) removeTask(task.id, true);
                            } else if (deleteAll === false) {
                              const deleteSingle = await confirm("¿Borrar solo este evento?", { title: "Evento único", confirmText: "Borrar evento" });
                              if (deleteSingle) removeTask(task.id, false);
                            }
                          } else {
                            const ok = await confirm("¿Borrar tarea?", { confirmText: "Borrar" });
                            if (ok) removeTask(task.id);
                          }
                        }}
                        className="flex items-center gap-1 rounded-full border border-red-200/60 px-3 py-1 text-[10px] font-medium text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-colors"
                      >
                        🗑️ Borrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Floating Scroll to Today Button */}
      {showScrollToToday && (
        <button
          onClick={scrollToToday}
          className="fixed bottom-24 right-4 md:right-8 bg-indigo-600 text-white p-3 rounded-full shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-1 transition-all z-50 flex items-center justify-center group"
          aria-label="Volver a hoy"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
          </svg>
          <div className="absolute right-full mr-3 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Ir a hoy
          </div>
        </button>
      )}
    </div>
  );
}
