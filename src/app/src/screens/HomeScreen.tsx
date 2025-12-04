import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../store/useTaskStore";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { logout } from "../api/tasksApi";

type FilterAssigneeId = "all" | string;

export function HomeScreen() {
  const navigate = useNavigate();
  const { tasksToday, familyMembers, removeTask } = useTaskStore();
  const [selectedAssigneeId, setSelectedAssigneeId] =
    useState<FilterAssigneeId>("all");

  const { permission, isSubscribed, subscribeToPush, loading } = usePushNotifications();

  const filteredTasks = useMemo(() => {
    if (selectedAssigneeId === "all") return tasksToday;

    return tasksToday.filter((task) =>
      task.assignees.some((a) => a.id === selectedAssigneeId)
    );
  }, [tasksToday, selectedAssigneeId]);

  return (
    <div className="space-y-3">
      <header className="mt-1 mb-2">
        <h1 className="text-xl font-semibold">Hoy {new Date().toLocaleDateString()}</h1>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            Esto es lo que tiene la familia para hoy
          </p>
          <button
            onClick={logout}
            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="text-[10px] text-gray-400 font-mono">
          Debug: Subscribed={String(isSubscribed)}, Permission={permission}
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

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            onClick={() => navigate(`/edit/${task.id}`)}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 flex flex-col gap-2 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden"
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1.5"
              style={{ backgroundColor: task.color || task.assignees[0]?.color || '#ccc' }}
            />

            <div className="flex-1">
              <div className="flex justify-between">
                <p
                  className={
                    "text-sm font-medium leading-snug " +
                    (task.title.length > 30
                      ? "whitespace-normal wrap-break-word"
                      : "whitespace-nowrap")
                  }
                >
                  {task.title}
                </p>

                {task.timeLabel && (
                  <p className="text[5px] text-gray-500">{task.timeLabel} h</p>
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

            <div className="mt-auto flex">
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
    </div>
  );
}
