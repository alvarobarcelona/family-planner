import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../store/useTaskStore";

type FilterAssigneeId = "all" | string;

export function HomeScreen() {
  const navigate = useNavigate();
  const { tasksToday, familyMembers, removeTask } = useTaskStore();
  const [selectedAssigneeId, setSelectedAssigneeId] =
    useState<FilterAssigneeId>("all");

  const filteredTasks = useMemo(() => {
    if (selectedAssigneeId === "all") return tasksToday;

    return tasksToday.filter((task) =>
      task.assignees.some((a) => a.id === selectedAssigneeId)
    );
  }, [tasksToday, selectedAssigneeId]);

  return (
    <div className="space-y-3">
      <header className="mt-1 mb-2">
        <h1 className="text-xl font-semibold">Hoy</h1>
        <p className="text-xs text-gray-500">
          Esto es lo que tiene la familia para hoy
        </p>
      </header>
      <div>Filtros</div>
      {/* Filtros por miembro */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedAssigneeId("all")}
          className={
            "px-2 py-1 rounded-full text-xs border " +
            (selectedAssigneeId === "all"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-gray-300")
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
              "px-2 py-1 rounded-full text-xs border flex items-center gap-1 " +
              (selectedAssigneeId === m.id
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-gray-300")
            }
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: m.color }}
            />
            {m.name}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            onClick={() => navigate(`/edit/${task.id}`)}
            className="bg-amber-200 rounded-xl shadow-sm px-3 py-2 flex flex-col gap-2 cursor-pointer hover:bg-amber-300 transition-colors"
          >
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
                  <p className="text[5px] text-gray-500">
                    {task.timeLabel} h
                  </p>
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
