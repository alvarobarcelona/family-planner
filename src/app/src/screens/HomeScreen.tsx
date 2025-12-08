import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../store/useTaskStore";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { logout } from "../api/tasksApi";

type FilterAssigneeId = "all" | string;

export function HomeScreen() {
  const navigate = useNavigate();
  // Destructure refreshTasks
  const { tasksToday, familyMembers, removeTask, toggleTaskCompletion, isLoading, refreshTasks } = useTaskStore();
  const [selectedAssigneeId, setSelectedAssigneeId] =
    useState<FilterAssigneeId>("all");

  const { permission, isSubscribed, subscribeToPush, unsubscribeFromPush, loading } = usePushNotifications();

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
          <h1 className="text-xl font-semibold">Hoy {new Date().toLocaleDateString()}</h1>
          <button
            onClick={logout}
            className="group flex items-center gap-2 text-xs font-medium text-red-500 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.97] transition-all duration-200"
          >
            <svg className="w-4 h-4 text-red-500 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 0a2 2 0 00-2 2v10a2 2 0 002 2" />
            </svg>
            Cerrar sesión
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Esto es lo que tiene la familia para hoy
        </p>




        <div className="text-[10px] text-gray-400 font-mono">
          Notificaciones: Subscribed={String(isSubscribed)}, Permission={permission}
        </div>

      </header>

      {!isSubscribed && permission !== 'denied' && (
        <div className="mb-3 bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <p className="text-xs text-indigo-800">
              Activa las notificaciones para recibir recordatorios.
            </p>
          </div>
          <button
            onClick={() => subscribeToPush()}
            disabled={loading}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full font-medium shadow-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? 'Activando...' : 'Activar'}
          </button>
        </div>
      )}

      {isSubscribed && (
        <div className="mb-3 bg-green-50 border border-green-100 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <p className="text-xs text-green-800">
              Notificaciones activadas.
            </p>
          </div>
          <button
            onClick={() => unsubscribeFromPush()}
            disabled={loading}
            className="text-xs bg-white border border-green-200 text-green-700 px-3 py-1.5 rounded-full font-medium shadow-sm active:scale-95 transition-transform disabled:opacity-50 hover:bg-green-50"
          >
            {loading ? 'Desactivando...' : 'Desactivar'}
          </button>
        </div>
      )}
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
                onClick={() => navigate(`/edit/${task.id}`)}
                className={`bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 flex flex-col gap-2 cursor-pointer transition-all duration-200 relative overflow-hidden ${task.isCompleted ? "opacity-60" : "hover:shadow-md hover:-translate-y-0.5"
                  }`}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: task.color || task.assignees[0]?.color || '#ccc' }}
                />

                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    {/* Completion Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskCompletion(task.id);
                      }}
                      className="flex-shrink-0 mt-0.5"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.isCompleted
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 hover:border-green-400"
                        }`}>
                        {task.isCompleted && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
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

                    {task.timeLabel && (
                      <p className="text[5px] text-gray-500 flex-shrink-0">{task.timeLabel} h</p>
                    )}
                  </div>

                  <div className="flex gap-1 mt-1 flex-wrap">
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

                {task.description && (
                  <p className="mt-1 text-[10px] text-gray-600 whitespace-pre-line">
                    {task.description}
                  </p>
                )}

                <div className="mt-auto flex justify-between">
                  <span className="mr-1">Prioridad:</span>
                  {task.priority === "HIGH" && (
                    <span className="text[10px] text-red-500 font-semibold">
                      Alta
                    </span>
                  )}
                  {task.priority === "MEDIUM" && (
                    <span className="text[10px] text-amber-500">Media</span>
                  )}
                  {task.priority === "LOW" && (
                    <span className="text[10px] text-gray-400">Baja</span>
                  )}
                  {task.createdBy && (
                    <div className="flex gap-1">
                      <span className="text-[10px] text-gray-500">Creado por:</span>
                      <span className="text-[10px] text-gray-400">{task.createdBy}</span>
                      {task.createdAt && (
                        <span className="text-[10px] text-gray-400">
                          a las {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (task.seriesId) {
                      const deleteAll = window.confirm(
                        "Este evento es parte de una serie.\n\n¿Quieres borrar TODA la serie?\n(Aceptar = Toda la serie, Cancelar = Solo este evento)"
                      );
                      if (deleteAll) {
                        removeTask(task.id, true);
                      } else {
                        const deleteSingle = window.confirm(
                          "¿Borrar solo este evento de la serie?"
                        );
                        if (deleteSingle) {
                          removeTask(task.id, false);
                        }
                      }
                    } else {
                      const ok = window.confirm("¿Borrar tarea?");
                      if (ok) removeTask(task.id);
                    }
                  }}
                  className="mt-auto items-center gap-1 rounded-full border border-red-200 px-2.5 py-0.5 text[11px] font-medium text-red-500 hover:bg-red-50 hover:border-red-400 active:bg-red-100 transition-colors"
                >
                  <span className="text-[12px]" aria-hidden="true">
                    🗑️
                  </span>
                  <span>Borrar</span>
                </button>
              </li>
            ))}

            {filteredTasks.length === 0 && (
              <p className="text-xs text-gray-400">
                No hay tareas para este filtro. 😊
              </p>
            )}
          </ul>
        )
      }
    </div >
  );
}
