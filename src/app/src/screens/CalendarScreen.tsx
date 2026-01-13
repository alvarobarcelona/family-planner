import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../store/useTaskStore";
import { useModal } from "../context/ModalContext";

type FilterAssigneeId = "all" | string;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

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
  const { tasks, familyMembers, removeTask } = useTaskStore();
  const [selectedAssigneeId, setSelectedAssigneeId] =
    useState<FilterAssigneeId>("all");

  // 1) Filtramos por miembro
  const filteredTasks = useMemo(() => {

    const byAssignee = selectedAssigneeId === "all"
      ? tasks
      : tasks.filter((task) =>
        task.assignees.some((a) => a.id === selectedAssigneeId)
      );
    return byAssignee.filter((task) => isTodayOrFuture(task.date));
  }, [tasks, selectedAssigneeId]);

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

  return (
    <div className="space-y-3">
      <header className="mt-1 mb-2">
        <h1 className="text-xl font-semibold">Lista de eventos</h1>
        <p className="text-xs text-gray-500">
          Vista de tareas por día con filtro por miembro
        </p>
      </header>

      <div>Filtros</div>

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
        <p className="text-xs text-gray-400">
          No hay tareas para este filtro. 😊
        </p>
      )}

      <div className="space-y-3">
        {grouped.map(({ date, tasks }, index) => (
          <section
            key={date}
            className={`rounded-xl shadow-sm px-3 py-2 space-y-1 ${index % 2 === 0 ? " bg-white" : "bg-gray-200"}`}
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold">{formatDate(date)}</span>
              <span className="text-[11px] text-gray-400">
                {tasks.length} {tasks.length === 1 ? "tarea" : "tareas"}
              </span>
            </div>

            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  onClick={() => navigate(`/edit/${task.id}`)}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 px-3 py-2 flex flex-col gap-2 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: task.color || task.assignees[0]?.color || '#ccc' }}
                  />
                  <div className="">
                    <div className="flex justify-between items-start">
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
                      <div className="flex gap-1">

                        {task.notificationTime != null && (
                          <span>🔔</span>
                        )}

                        {task.timeLabel && (
                          <p className="text[5px] text-gray-500">
                            {task.timeLabel} h
                          </p>
                        )}
                      </div>
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
                            cancelText: "No borrar serie"
                          }
                        );
                        if (deleteAll) {
                          removeTask(task.id, true);
                        } else {
                          const deleteSingle = await confirm(
                            "¿Borrar solo este evento de la serie?",
                            { title: "Evento único", confirmText: "Borrar evento" }
                          );
                          if (deleteSingle) {
                            removeTask(task.id, false);
                          }
                        }
                      } else {
                        const ok = await confirm("¿Borrar tarea?", { confirmText: "Borrar" });
                        if (ok) removeTask(task.id);
                      }
                    }}
                    className=" items-center gap-1 rounded-full border border-red-200 px-2.5 py-0.5 text[11px] font-medium text-red-500 hover:bg-red-50 hover:border-red-400 active:bg-red-100 transition-colors"
                  >
                    <span className="text-[12px]" aria-hidden="true">
                      🗑️
                    </span>
                    <span>Borrar</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
