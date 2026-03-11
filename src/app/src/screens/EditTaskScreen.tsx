import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useTaskStore,
  type Priority,
  type Recurrence,
  type Task,
} from "../store/useTaskStore";
import { useModal } from "../context/ModalContext";
import { getSeriesCount } from "../api/tasksApi";

const notificationOptions = [
  { value: 0, label: "Sin recordatorio" },
  { value: 5, label: "5 minutos antes" },
  { value: 10, label: "10 minutos antes" },
  { value: 15, label: "15 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
  { value: 120, label: "2 horas antes" },
  { value: 1440, label: "1 día antes" },
];

const colorOptions = [
  { value: "", label: "Por defecto" },
  { value: "#f87171", label: "Rojo" },
  { value: "#fb923c", label: "Naranja" },
  { value: "#fbbf24", label: "Amarillo" },
  { value: "#4ade80", label: "Verde" },
  { value: "#22d3ee", label: "Cian" },
  { value: "#818cf8", label: "Índigo" },
  { value: "#c084fc", label: "Violeta" },
  { value: "#f472b6", label: "Rosa" },
];

const weekdays = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "X" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 7, label: "D" },
];

export function EditTaskScreen() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, removeTask, updateTask, familyMembers } = useTaskStore();
  const { confirm } = useModal();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [recurrence, setRecurrence] = useState<Recurrence>("NONE");
  const [description, setDescription] = useState("");
  const [notificationTime, setNotificationTime] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>("");
  const [storedCreatedBy, setStoredCreatedBy] = useState("familia");
  const [storedCreatedAt, setStoredCreatedAt] = useState<string | undefined>();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [seriesCount, setSeriesCount] = useState<number | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // States for read-only recurrence display information
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [customDurationWeeks, setCustomDurationWeeks] = useState(4);

  useEffect(() => {
    if (taskId && tasks.length > 0) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setCurrentTask(task);
        setTitle(task.title);
        setDate(task.date);
        setEndDate(task.endDate || "");
        setTime(task.timeLabel || "");
        setEndTime(task.endTime || "");
        setAssigneeId(task.assignees[0]?.id || "familia");
        setPriority(task.priority);
        setRecurrence(task.recurrence || "NONE");
        setDescription(task.description || "");
        setNotificationTime(task.notificationTime || 0);
        setSelectedColor(task.color);
        setStoredCreatedBy(task.createdBy || "familia");
        setStoredCreatedAt(task.createdAt);

        // Populate custom days for read-only display
        if (task.recurrence === "CUSTOM_WEEKLY" || task.recurrence === "WEEKLY") {
          setCustomDays(task.daysOfWeek || []);
          setCustomDurationWeeks(task.durationWeeks || 4);
        }

        // Fetch series count if this task is part of a series
        if (task.seriesId) {
          getSeriesCount(task.seriesId)
            .then(count => setSeriesCount(count))
            .catch(err => console.error("Error fetching series count:", err));
        }

        setIsLoading(false);
      } else {
        setError("Tarea no encontrada");
        setIsLoading(false);
      }
    } else if (tasks.length > 0) {
      setError("Tarea no encontrada");
      setIsLoading(false);
    }
  }, [taskId, tasks]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError("Debes indicar un título");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await updateTask(taskId!, {
        title,
        date,
        endDate: endDate || undefined,
        time: time || undefined,
        endTime: endTime || undefined,
        assigneeId,
        priority,
        recurrence,
        description: description || undefined,
        notificationTime: notificationTime > 0 ? notificationTime : undefined,
        color: selectedColor,
        createdBy: storedCreatedBy,
        createdAt: storedCreatedAt,
      });

      navigate(-1);
    } catch (err) {
      console.error(err);
      setError("No se ha podido actualizar la tarea");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando...</div>;
  if (error && !title) return (
    <div className="p-8 text-center text-red-500">
      <p className="font-semibold">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-slate-500 underline text-sm">Volver</button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Editar tarea</h1>
        <p className="text-sm text-slate-500 mt-1">
          Modifica los detalles de este evento
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-4 gap-y-5">

        {/* Title */}
        <div className="col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700" htmlFor="title">
            Título
          </label>
          <input
            id="title"
            type="text"
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-3 text-base focus:border-slate-900 focus:bg-white focus:ring-0 transition-all font-medium"
            placeholder="Título de la tarea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700" htmlFor="description">
            Notas
          </label>
          <textarea
            id="description"
            className="w-full min-h-[100px] rounded-xl border-slate-200 bg-slate-50 px-3 py-3 text-base focus:border-slate-900 focus:bg-white focus:ring-0 transition-all resize-y"
            placeholder="Detalles adicionales..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Date and Time Row */}
        <div className="col-span-2 sm:col-span-1 space-y-1.5">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide" htmlFor="date">
            Fecha
          </label>
          <input
            id="date"
            type="date"
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="col-span-2 sm:col-span-1 space-y-1.5">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide" htmlFor="time">
            Hora <span className="text-slate-300 font-normal">(opcional)</span>
          </label>
          <div className="flex gap-2 items-center">
            <input
              id="time"
              type="time"
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-2 py-2.5 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all cursor-text text-left"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <span className="text-slate-400 font-bold">-</span>
            <input
              id="endTime"
              type="time"
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-2 py-2.5 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all disabled:opacity-50 cursor-text text-left"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={!time}
            />
          </div>
        </div>

        {/* End Date */}
        <div className="col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700" htmlFor="endDate">
            Fecha fin (Opcional, para eventos de varios días)
          </label>
          <input
            id="endDate"
            type="date"
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={date}
          />
        </div>

        <div className="col-span-2 h-px bg-slate-100 my-1" />

        {/* Priority */}
        <div className="col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Prioridad</label>
          <div className="flex gap-6">
            {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((p) => (
              <label key={p} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="priority"
                  className="text-slate-900 focus:ring-slate-900 w-4 h-4"
                  checked={priority === p}
                  onChange={() => setPriority(p)}
                />
                <span className={`text-sm font-medium transition-colors ${priority === p ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                  {p === 'LOW' ? 'Baja' : p === 'MEDIUM' ? 'Media' : 'Alta'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Notification */}
        <div className="col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700" htmlFor="notification">
            Recordatorio
          </label>
          <div className="relative">
            <select
              id="notification"
              className="w-full appearance-none rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all disabled:opacity-50"
              value={notificationTime}
              onChange={(e) => setNotificationTime(Number(e.target.value))}
              disabled={!time}
            >
              {notificationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {!time && (
            <p className="text-xs text-amber-500 flex items-center gap-1">
              <span>⚠️</span> Selecciona una hora para activar recordatorios
            </p>
          )}
        </div>

        <div className="col-span-2 h-px bg-slate-100 my-1" />

        {/* Assignee */}
        <div className="col-span-2 space-y-1.5">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Asignado a</label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all font-medium"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              {familyMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Recurrence - Read Only Display */}
        {recurrence && recurrence !== "NONE" && (
          <div className="col-span-2 space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex flex-col shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Recurrencia activa</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-800">
                {recurrence === "DAILY" && "Diaria"}
                {recurrence === "WEEKLY" && customDays.length > 0 && (
                  <>
                    Semanal - {customDays.map(d => {
                      const day = weekdays.find(w => w.value === d);
                      return day?.label;
                    }).join(", ")}
                  </>
                )}
                {recurrence === "WEEKLY" && customDays.length === 0 && "Semanal"}
                {recurrence === "MONTHLY" && "Mensual"}
                {recurrence === "YEARLY" && "Anual"}
                {recurrence === "CUSTOM_WEEKLY" && customDays.length > 0 && (
                  <>
                    Personalizada - {customDays.map(d => {
                      const day = weekdays.find(w => w.value === d);
                      return day?.label;
                    }).join(", ")}
                  </>
                )}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {currentTask?.recurrenceEndDate && (
                  <>Finaliza el {new Date(currentTask.recurrenceEndDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                )}
                {currentTask?.recurrenceCount && !currentTask?.recurrenceEndDate && (
                  <>Durante {currentTask.recurrenceCount} {recurrence === "WEEKLY" || recurrence === "CUSTOM_WEEKLY" ? "semanas" : "veces"}</>
                )}
                {!currentTask?.recurrenceEndDate && !currentTask?.recurrenceCount && (
                  <>Sin fecha de finalización (ilimitada)</>
                )}
              </span>
            </div>
            <p className="text-[11px] text-amber-700 bg-white/60 p-2 rounded-lg border border-amber-200/50 italic leading-snug">
              ℹ️ Los patrones de recurrencia no se pueden editar. Si necesitas cambiarlo, elimina la serie y crea una nueva.
            </p>
          </div>
        )}

        {/* Color */}
        <div className="col-span-2 space-y-2">
          <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Etiqueta de Color</span>
          <div className="flex flex-wrap gap-3">
            {colorOptions.map((c) => (
              <button
                key={c.value || "default"}
                type="button"
                onClick={() => setSelectedColor(c.value)}
                className={
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-sm " +
                  (selectedColor === c.value
                    ? "border-slate-900 scale-110 ring-2 ring-slate-100"
                    : "border-transparent hover:scale-105 hover:shadow-md")
                }
                style={{ backgroundColor: c.value || "#f1f5f9" }}
                title={c.label}
              >
                {selectedColor === c.value && <span className="text-xs text-white drop-shadow-md">✓</span>}
              </button>
            ))}
          </div>
        </div>


        {error && (
          <div className="col-span-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="col-span-2 flex gap-3 pt-6 mt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-xl border border-slate-200 bg-white text-slate-700 py-3.5 text-sm font-semibold hover:bg-slate-50 active:scale-95 transition-all"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] rounded-xl bg-slate-900 text-white py-3.5 text-sm font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-70 disabled:shadow-none"
          >
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

        {/* Individual Delete Link */}
        <div className="col-span-2 flex justify-center">
          <button
            type="button"
            onClick={async () => {
              if (await confirm("¿Borrar solo este evento?", { confirmText: "Borrar evento" })) {
                setIsSubmitting(true);
                try {
                  await removeTask(taskId!, false);
                  navigate(-1);
                } catch (err) {
                  console.error(err);
                  setError("Error al borrar evento");
                  setIsSubmitting(false);
                }
              }
            }}
            disabled={isSubmitting}
            className="text-sm text-red-500 font-medium hover:text-red-700 hover:underline transition-all py-1"
          >
            Eliminar solo este evento individual
          </button>
        </div>

        {/* Series Options Extension */}
        {tasks.find((t) => t.id === taskId)?.seriesId && (
          <div className="col-span-2 mt-2 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm border-dashed">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Afectar a toda la serie</p>
              {seriesCount !== null && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase">{seriesCount} {seriesCount === 1 ? 'evento' : 'eventos'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={async () => {
                  const message = seriesCount !== null
                    ? `¿Borrar TODA la serie? Se eliminarán ${seriesCount} eventos de tu calendario.`
                    : "¿Borrar TODA la serie?";
                  if (await confirm(message, {
                    confirmText: "Borrar Serie",
                    confirmVariant: "danger",
                    title: "Borrar Serie Completa"
                  })) {
                    setIsSubmitting(true);
                    try {
                      await removeTask(taskId!, true);
                      navigate(-1);
                    } catch (err) {
                      console.error(err);
                      setError("Error al borrar serie");
                      setIsSubmitting(false);
                    }
                  }
                }}
                disabled={isSubmitting}
                className="rounded-xl bg-red-50 border border-red-100 text-red-600 py-3 text-xs font-bold hover:bg-red-100 active:scale-95 transition-all"
              >
                Borrar Serie
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (
                    await confirm(
                      "¿Actualizar toda la serie? Se aplicarán estos cambios a todos los eventos futuros y pasados de esta serie.",
                      { confirmText: "Actualizar Serie", title: "Cambio Global" }
                    )
                  ) {
                    setIsSubmitting(true);
                    try {
                      await updateTask(
                        taskId!,
                        {
                          title,
                          date,
                          time: time || undefined,
                          endTime: endTime || undefined,
                          assigneeId,
                          priority,
                          recurrence: recurrence,
                          description: description || undefined,
                          daysOfWeek: customDays,
                          durationWeeks: customDurationWeeks,
                          notificationTime: notificationTime > 0 ? notificationTime : undefined,
                          color: selectedColor,
                          createdBy: storedCreatedBy,
                          createdAt: storedCreatedAt,
                        },
                        true
                      );
                      navigate(-1);
                    } catch (err) {
                      console.error(err);
                      setError("Error al actualizar serie");
                      setIsSubmitting(false);
                    }
                  }
                }}
                disabled={isSubmitting}
                className="rounded-xl bg-slate-700 text-white py-3 text-xs font-bold hover:bg-slate-600 shadow-md active:scale-95 transition-all"
              >
                Guardar Serie
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
