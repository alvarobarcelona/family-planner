import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import { useTaskStore, type Task } from "../store/useTaskStore";
import { getSeriesCount } from "../api/tasksApi";
import { useGoBack } from "../hooks/useGoBack";
import {
  emptyTaskFormValues,
  formValuesToInput,
  hasAdvancedValues,
  type TaskFormValues,
} from "../components/taskFormValues";
import { TaskForm } from "../components/TaskForm";

function taskToFormValues(task: Task, allTasks: Task[]): TaskFormValues {
  let date = task.date;
  let endDate = task.endDate || "";

  // Date-range series: recurrence=NONE with a seriesId. Each day is its own
  // task row with no endDate, so we reconstruct the range from the series.
  if (task.seriesId && (!task.recurrence || task.recurrence === "NONE") && !task.endDate) {
    const sortedDates = allTasks
      .filter((t) => t.seriesId === task.seriesId)
      .map((t) => t.date)
      .sort();
    date = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];
    endDate = lastDate !== date ? lastDate : "";
  }

  const isWeekly = task.recurrence === "WEEKLY" || task.recurrence === "CUSTOM_WEEKLY";

  return {
    ...emptyTaskFormValues(),
    title: task.title,
    description: task.description || "",
    date,
    endDate,
    time: task.timeLabel || "",
    endTime: task.endTime || "",
    assigneeId: task.assignees[0]?.id || "",
    createdBy: task.createdBy || "",
    priority: task.priority,
    notificationTime: task.notificationTime ?? -1,
    recurrence: task.recurrence || "NONE",
    customDays: isWeekly ? task.daysOfWeek || [] : [],
    recurrenceInterval: task.recurrenceInterval || 1,
    recurrenceEndCondition: task.recurrenceEndDate ? "DATE" : task.recurrenceCount ? "COUNT" : "NEVER",
    recurrenceEndDate: task.recurrenceEndDate ? task.recurrenceEndDate.slice(0, 10) : "",
    recurrenceCount: task.recurrenceCount,
    color: task.color,
    isPrivate: task.isPrivate ?? false,
  };
}

export function EditTaskScreen() {
  const { taskId } = useParams<{ taskId: string }>();
  const goBack = useGoBack();
  const { confirm } = useModal();
  const { tasks, isLoading, updateTask, removeTask, currentMemberId } = useTaskStore();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seriesCount, setSeriesCount] = useState<number | null>(null);

  const task = tasks.find((t) => t.id === taskId);

  // Built once per task: background refreshes of `tasks` must not overwrite
  // what the user is typing (the form also only reads initialValues on mount).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialValues = useMemo(() => (task ? taskToFormValues(task, tasks) : null), [task?.id]);

  const seriesId = task?.seriesId;
  useEffect(() => {
    if (!seriesId) return;
    getSeriesCount(seriesId)
      .then(setSeriesCount)
      .catch((err) => console.error("Error fetching series count:", err));
  }, [seriesId]);

  if (!initialValues) {
    if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando...</div>;
    return (
      <div className="p-8 text-center text-red-500">
        <p className="font-semibold">Tarea no encontrada</p>
        <button onClick={goBack} className="mt-4 text-slate-500 underline text-sm">
          Volver
        </button>
      </div>
    );
  }

  const toInput = (values: TaskFormValues) => ({
    ...formValuesToInput(values),
    createdAt: task?.createdAt,
  });

  /** Runs a save/delete action with the shared submitting/error handling. */
  const run = async (action: () => Promise<void>, errorMessage: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await action();
      goBack();
    } catch (err) {
      console.error(err);
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (values: TaskFormValues) =>
    run(() => updateTask(taskId!, toInput(values)), "No se ha podido actualizar la tarea");

  const deleteSingle = async () => {
    if (await confirm("¿Borrar solo este evento?", { confirmText: "Borrar evento" })) {
      await run(() => removeTask(taskId!, false), "Error al borrar evento");
    }
  };

  const deleteSeries = async () => {
    const message =
      seriesCount !== null
        ? `¿Borrar TODA la serie? Se eliminarán ${seriesCount} eventos de tu calendario.`
        : "¿Borrar TODA la serie?";
    if (await confirm(message, { confirmText: "Borrar Serie", confirmVariant: "danger", title: "Borrar Serie Completa" })) {
      await run(() => removeTask(taskId!, true), "Error al borrar serie");
    }
  };

  const saveSeries = async (values: TaskFormValues) => {
    const ok = await confirm(
      "¿Actualizar toda la serie? Se aplicarán estos cambios a todos los eventos futuros y pasados de esta serie.",
      { confirmText: "Actualizar Serie", title: "Cambio Global" }
    );
    if (ok) await run(() => updateTask(taskId!, toInput(values), true), "Error al actualizar serie");
  };

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Editar tarea</h1>
        <p className="text-sm text-slate-500 mt-1">Modifica los detalles de este evento</p>
      </header>

      <TaskForm
        key={taskId}
        initialValues={initialValues}
        submitLabel="Guardar cambios"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={goBack}
        showCreatedBy={false}
        // Only the creator can change visibility
        showPrivateToggle={!!currentMemberId && task?.createdByMemberId === currentMemberId}
        initiallyExpanded={hasAdvancedValues(initialValues)}
        renderExtraActions={(values) => (
          <>
            <div className="col-span-2 flex justify-center mt-2">
              <button
                type="button"
                onClick={deleteSingle}
                disabled={isSubmitting}
                className="text-sm text-red-500 font-medium hover:text-red-700 hover:underline transition-all py-1"
              >
                Eliminar solo este evento
              </button>
            </div>

            {task?.seriesId && (
              <div className="col-span-2 mt-2 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm border-dashed">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Afectar a toda la serie</p>
                  {seriesCount !== null && (
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase">
                        {seriesCount} {seriesCount === 1 ? "evento" : "eventos"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={deleteSeries}
                    disabled={isSubmitting}
                    className="rounded-xl bg-red-50 border border-red-100 text-red-600 py-3 text-xs font-bold hover:bg-red-100 active:scale-95 transition-all"
                  >
                    Borrar Serie
                  </button>
                  <button
                    type="button"
                    onClick={() => saveSeries(values)}
                    disabled={isSubmitting}
                    className="rounded-xl bg-slate-700 text-white py-3 text-xs font-bold hover:bg-slate-600 shadow-md active:scale-95 transition-all"
                  >
                    Guardar Serie
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      />
    </div>
  );
}
