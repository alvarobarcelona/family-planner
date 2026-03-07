import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../store/useTaskStore";
import { logout } from "../api/tasksApi";
import { useModal } from "../context/ModalContext";
import { FamilyWall } from "../components/FamilyWall";

type FilterAssigneeId = "all" | string;

export function HomeScreen() {
  const navigate = useNavigate();
  const dayRaw = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
  const DayString = dayRaw.charAt(0).toUpperCase() + dayRaw.slice(1);
  const { confirm } = useModal();
  // Destructure refreshTasks
  const { tasksToday, tasksTomorrow, familyMembers, removeTask, toggleTaskCompletion, isLoading, refreshTasks } = useTaskStore();
  const [selectedAssigneeId, setSelectedAssigneeId] =
    useState<FilterAssigneeId>("all");
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);

  // Auto-refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshTasks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshTasks]);

  // Pull to Refresh Logic
  const [pullStartPoint, setPullStartPoint] = useState(0);
  const [pullChange, setPullChange] = useState(0);
  const refreshThreshold = 150; // pixels to trigger refresh

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setPullStartPoint(e.targetTouches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartPoint > 0 && window.scrollY === 0) {
      const touchY = e.targetTouches[0].clientY;
      const diff = touchY - pullStartPoint;
      if (diff > 0) {
        // Add resistance
        setPullChange(diff < refreshThreshold ? diff : refreshThreshold + (diff - refreshThreshold) * 0.3);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullChange >= refreshThreshold) {
      await refreshTasks();
    }
    setPullStartPoint(0);
    setPullChange(0);
  };

  const filteredTasks = useMemo(() => {
    if (selectedAssigneeId === "all") return tasksToday;

    return tasksToday.filter((task) =>
      task.assignees.some((a) => a.id === selectedAssigneeId)
    );
  }, [tasksToday, selectedAssigneeId]);

  // Navigate with View Transition animation if supported
  const handleTaskClick = (taskId: string) => {
    const target = `/edit/${taskId}`;
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => navigate(target));
    } else {
      navigate(target);
    }
  };

  return (
    <div
      className="space-y-3 min-h-[80vh]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div
        className="fixed top-0 left-0 right-0 flex justify-center items-center pointer-events-none transition-transform duration-200 z-50"
        style={{
          height: '50px',
          transform: `translateY(${pullChange > 0 ? (pullChange - 50) : -50}px)`,
          opacity: pullChange > 0 ? 1 : 0
        }}
      >
        <div className="bg-white rounded-full shadow-md p-2">
          {pullChange >= refreshThreshold ? (
            <span className="animate-spin block text-indigo-600">↻</span>
          ) : (
            <span className={`text-gray-400 transform transition-transform ${pullChange > 50 ? 'rotate-180' : ''}`}>↓</span>
          )}
        </div>
      </div>

      <header className="mt-1 mb-2">
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-xl font-semibold">Hoy {new Date().toLocaleDateString()} {DayString}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/members")}
              className="p-1.5 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 pr-2 pl-1.5 py-1 rounded-full text-[10px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="m10 17 5-5-5-5m5 5H3m12-9h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path></svg>
              Cerrar Sesión
            </button>
          </div>
        </div>

      </header>

      {/* Family Wall Section */}
      <FamilyWall />

      <div className="flex flex-col items-center justify-center gap-1 mt-4 mb-2">
        <div className="text-gray-500 text-lg font-medium text-center"> 📅 Para hoy 📅</div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 animate-bounce">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      <div>Filtros</div>
      {/* Filtros por miembro */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          type="button"
          onClick={() => setSelectedAssigneeId("all")}
          className={
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all " +
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
              "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all " +
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

      {
        isLoading && (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500 font-medium animate-pulse">Cargando tareas...</p>
          </div>
        )
      }

      {
        !isLoading && (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className={`bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 flex flex-col gap-2 cursor-pointer transition-all duration-200 relative overflow-hidden ${task.isCompleted ? "opacity-60" : ""} ${animatingTaskId === task.id ? "animate-pop" : "hover:shadow-md hover:-translate-y-0.5"}`}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: task.color || task.assignees[0]?.color || '#ccc' }}
                />

                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    {/* Completion Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Solo animar si la estamos completando, no des-completando
                        if (!task.isCompleted) {
                          setAnimatingTaskId(task.id);
                          setTimeout(() => setAnimatingTaskId(null), 1000);
                        }
                        toggleTaskCompletion(task.id);
                      }}
                      className="flex-shrink-0 relative z-10 p-2 -m-2"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors relative ${task.isCompleted
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 hover:border-green-400"
                        }`}>
                        {task.isCompleted && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {/* Burst Animation Overlay */}
                        {animatingTaskId === task.id && (
                          <div className="absolute -inset-2 rounded-full border-green-400 animate-burst pointer-events-none" />
                        )}
                      </div>
                    </button>

                    <div className="flex-1">
                      <p
                        className={
                          `text-sm font-medium leading-snug ${task.isCompleted ? "line-through text-gray-400" : ""} ` +
                          (task.title.length > 30
                            ? "whitespace-normal wrap-break-word"
                            : "whitespace-nowrap")
                        }
                      >
                        {task.title}
                      </p>
                    </div>

                    <div>
                      {task.notificationTime != null && (
                        <span className="animate-bell-shake">🔔</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between gap-2 mt-1  items-center">
                    <div className="flex gap-1 flex-wrap">
                      {task.assignees.map((a) => (
                        <span
                          key={a.id}
                          className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: a.color }}
                        >
                          {a.name}
                        </span>
                      ))}
                    </div>
                    {task.timeLabel && (
                      <p className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">{task.timeLabel} h</p>
                    )}

                  </div>
                </div>

                {task.description && (
                  <p className="mt-1 text-[10px] text-gray-600 whitespace-pre-line">
                    {task.description}
                  </p>
                )}

                <div className="mt-auto  ">
                  <span className="mr-1">Prioridad:
                    {task.priority === "HIGH" && (
                      <span className=" ml-1 text[10px] text-red-500 font-semibold">
                        Alta
                      </span>
                    )}
                    {task.priority === "MEDIUM" && (
                      <span className=" ml-1 text[10px] text-amber-500">Media</span>
                    )}
                    {task.priority === "LOW" && (
                      <span className=" ml-1 text[10px] text-gray-400">Baja</span>
                    )}
                  </span>
                  {task.createdBy && (
                    <div className="flex justify-end">
                      <span className="mr-1 text-[10px] text-gray-500">Creado por:</span>
                      <span className="mr-2 text-[10px] text-gray-400">{task.createdBy}</span>
                      {task.createdAt && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(task.createdAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (task.seriesId) {
                      const deleteAll = await confirm(
                        "Este evento es parte de una serie.\n\n¿Quieres borrar TODA la serie?",
                        {
                          title: "Serie Recurrente",
                          confirmText: "Borrar Serie Completa",
                          cancelText: "Borrar solo este evento"
                        }
                      );

                      if (deleteAll === true) {
                        // Wait for the first modal to fully close (200ms animation)
                        await new Promise(resolve => setTimeout(resolve, 300));

                        const deleteSeries = await confirm(
                          "¿Estás SEGURO de que quieres borrar TODA la serie?\n\nEsta acción borrará todos los eventos futuros y pasados de esta serie y no se puede deshacer.",
                          { title: "⚠️ Borrar Serie Completa", confirmText: "Sí, borrar TODO", cancelText: "Cancelar" }
                        );

                        if (deleteSeries === true) {
                          removeTask(task.id, true);
                        }
                      } else if (deleteAll === false) {
                        // User explicitly clicked "Delete only this event" (Cancel button)
                        // Wait for the first modal to fully close (200ms animation)
                        await new Promise(resolve => setTimeout(resolve, 300));

                        const deleteSingle = await confirm(
                          "¿Estás seguro de que quieres borrar solo este evento?",
                          { title: "Evento único", confirmText: "Sí, borrar" }
                        );

                        // If deleteSingle is null (dismissed) or false (cancel), we do nothing.
                        if (deleteSingle === true) {
                          removeTask(task.id, false);
                        }
                      }
                      // If deleteAll is null (backdrop click), we do nothing (cancel operation).
                    } else {
                      const ok = await confirm("¿Borrar tarea?", { confirmText: "Borrar", title: "Confirmar" });
                      if (ok) removeTask(task.id);
                    }
                  }}
                  className="mt-4 self-end flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-1 text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-400 active:bg-red-100 transition-colors"
                >
                  <span className="text-[14px]" aria-hidden="true">
                    🗑️
                  </span>
                  <span>Borrar</span>
                </button>
              </li>
            ))}

            {filteredTasks.length === 0 && (
              <p className="text-md text-gray-400">
                No hay tareas para este filtro. 😊
              </p>
            )}
          </ul>
        )
      }
      <div className="border-t border-b border-slate-200 my-8"></div>
      {/* Sección: Tareas de mañana */}
      <div className="mt-8 mb-4">
        <div className="flex flex-col items-center justify-center gap-1 mb-3">
          <div className="text-gray-500 text-lg font-medium text-center">📅 Mañana teneis 📅</div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 animate-bounce">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-6">
            <p className="text-gray-400 text-sm animate-pulse">Cargando...</p>
          </div>
        )}

        {!isLoading && (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasksTomorrow.map((task) => (
              <li
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className={`bg-slate-50 rounded-2xl shadow-sm border border-slate-100 px-4 py-3 flex flex-col gap-2 cursor-pointer transition-all duration-200 relative overflow-hidden ${task.isCompleted ? "opacity-60" : "hover:shadow-md hover:-translate-y-0.5"}`}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: task.color || task.assignees[0]?.color || '#ccc' }}
                />

                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p
                        className={
                          `text-sm font-medium leading-snug ${task.isCompleted ? "line-through text-gray-400" : ""} ` +
                          (task.title.length > 30 ? "whitespace-normal wrap-break-word" : "whitespace-nowrap")
                        }
                      >
                        {task.title}
                      </p>
                    </div>
                    <div>
                      {task.notificationTime != null && <span className="animate-bell-shake">🔔</span>}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1 flex-wrap items-center">
                    {task.timeLabel && (
                      <p className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">{task.timeLabel} h</p>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {task.assignees.map((a) => (
                        <span
                          key={a.id}
                          className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: a.color }}
                        >
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {task.description && (
                  <p className="mt-1 text-[10px] text-gray-600 whitespace-pre-line">
                    {task.description}
                  </p>
                )}

                <div className="mt-auto">
                  <span className="mr-1">Prioridad:
                    {task.priority === "HIGH" && (
                      <span className="ml-1 text[10px] text-red-500 font-semibold">Alta</span>
                    )}
                    {task.priority === "MEDIUM" && (
                      <span className="ml-1 text[10px] text-amber-500">Media</span>
                    )}
                    {task.priority === "LOW" && (
                      <span className="ml-1 text[10px] text-gray-400">Baja</span>
                    )}
                  </span>
                  {task.createdBy && (
                    <div className="flex justify-end">
                      <span className="mr-1 text-[10px] text-gray-500">Creado por:</span>
                      <span className="mr-2 text-[10px] text-gray-400">{task.createdBy}</span>
                      {task.createdAt && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(task.createdAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}

            {tasksTomorrow.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center animate-fadeIn relative overflow-hidden px-4">
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-200/40 rounded-full blur-3xl animate-pulse" />

                <div className="glass-pill px-8 py-10 rounded-3xl text-center space-y-4 relative z-10 border border-white/50 shadow-xl shadow-indigo-100/20">
                  <div className="relative inline-block mb-2">
                    <span className="text-6xl block animate-float-sparkle">🎉</span>
                    <span className="absolute -top-1 -right-2 text-2xl animate-pulse opacity-75">✨</span>
                    <span className="absolute -bottom-1 -left-2 text-2xl animate-rotate-slow opacity-60">🌈</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold animate-rainbow">
                      ¡Tiempo Libre Detectado!
                    </h3>
                    <p className="text-sm text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                      Nada planeado para mañana. ¡Disfrutad del descanso en familia!
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest animate-bounce">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                      Día libre activo
                    </span>
                  </div>
                </div>
              </div>
            )}
          </ul>
        )}
      </div>
    </div>


  );
}
