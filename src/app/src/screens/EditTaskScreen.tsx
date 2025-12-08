import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useTaskStore,
  type Priority,
  type Recurrence,
} from "../store/useTaskStore";

const weekdays = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "X" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 7, label: "D" },
];

const notificationOptions = [
  { value: 0, label: "Sin notificación" },
  { value: 10, label: "10 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
  { value: 1440, label: "1 día antes" },
];

export function EditTaskScreen() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, removeTask, familyMembers } = useTaskStore();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [time, setTime] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [recurrence, setRecurrence] = useState<Recurrence>("NONE");
  const [description, setDescription] = useState("");
  const [notificationTime, setNotificationTime] = useState<number>(0);
  const [storedCreatedBy, setStoredCreatedBy] = useState<string>("");

  const [useCustomDays, setUseCustomDays] = useState(false);
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [customDurationWeeks, setCustomDurationWeeks] = useState(4);

  const toggleCustomDay = (value: number) => {
    setCustomDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

  const colorOptions = [
    { value: undefined, label: "Por defecto" },
    { value: "#ef4444", label: "Rojo" },
    { value: "#f97316", label: "Naranja" },
    { value: "#f59e0b", label: "Ámbar" },
    { value: "#22c55e", label: "Verde" },
    { value: "#14b8a6", label: "Turquesa" },
    { value: "#3b82f6", label: "Azul" },
    { value: "#6366f1", label: "Índigo" },
    { value: "#a855f7", label: "Violeta" },
    { value: "#ec4899", label: "Rosa" },
    { value: "#64748b", label: "Gris" },
  ];

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (taskId && tasks.length > 0) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setTitle(task.title);
        setDate(task.date);
        setEndDate(task.endDate || "");
        setTime(task.timeLabel || "");
        setAssigneeId(task.assignees[0]?.id || "familia");
        setPriority(task.priority);
        setRecurrence(task.recurrence || "NONE");
        setDescription(task.description || "");
        setNotificationTime(task.notificationTime || 0);
        setSelectedColor(task.color);
        setStoredCreatedBy(task.createdBy || "familia");

        // Initialize custom days if applicable
        if (task.recurrence === "CUSTOM_WEEKLY") {
          setUseCustomDays(true);
          setCustomDays(task.daysOfWeek || []);
          setCustomDurationWeeks(task.durationWeeks || 4);
        } else {
          setUseCustomDays(false);
          setCustomDays([]);
          setCustomDurationWeeks(4);
        }

        setIsLoading(false);
      } else {
        // If task not found in store (maybe refresh), we might need to fetch it or just redirect
        // For now, assuming store is populated or we redirect if not found
        // Ideally we should fetch individual task if not in list, but list is loaded on app start
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
    setError(null);

    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    if (!taskId) return;

    setIsSubmitting(true);

    try {
      await updateTask(taskId, {
        title,
        date,
        endDate: endDate || undefined,
        time: time || undefined,
        assigneeId,
        priority,
        recurrence, // Note: Editing recurrence might be tricky if it changes future events. For now, simple update.
        description: description || undefined,
        notificationTime: notificationTime > 0 ? notificationTime : undefined,
        color: selectedColor,
        createdBy: storedCreatedBy,
      });

      navigate(-1); // Go back
    } catch (err) {
      console.error(err);
      setError("No se ha podido actualizar la tarea");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-4">Cargando...</div>;
  if (error && !title) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-3">
      <header className="mt-1 mb-2">
        <h1 className="text-xl font-semibold">Editar tarea</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div className="space-y-1">
          <label className="block text-xs text-gray-600" htmlFor="title">
            Título
          </label>
          <input
            id="title"
            type="text"
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/60"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>


        {/* Fecha */}
        <div className="space-y-1">
          <label className="block text-xs text-gray-600" htmlFor="date">
            Fecha
          </label>
          <input
            id="date"
            type="date"
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/60"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Fecha fin (opcional, solo para eventos de varios días seguidos) */}
        <div className="space-y-1">
          <label className="block text-xs text-gray-600" htmlFor="endDate">
            Fecha fin (opcional)
          </label>
          <input
            id="endDate"
            type="date"
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/60"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={date}
          />
          <p className="text-[10px] text-gray-400">
            * Para eventos de varios días seguidos
          </p>
        </div>

        {/* Hora */}
        <div className="space-y-1">
          <label className="block text-xs text-gray-600" htmlFor="time">
            Hora (opcional)
          </label>
          <input
            id="time"
            type="time"
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/60"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>


        {/* Notificación */}
        <div className="space-y-1">
          <label className="block text-xs text-gray-600" htmlFor="notification">
            Notificación
          </label>
          <select
            id="notification"
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/60"
            value={notificationTime}
            onChange={(e) => setNotificationTime(Number(e.target.value))}
            disabled={!time} // Disable if no time is set, as notification depends on time
          >
            {notificationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {!time && (
            <p className="text-[10px] text-gray-400">
              * Requiere hora para activar notificaciones
            </p>
          )}
        </div>

        {/*recurrencia personalizada por días */}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={useCustomDays}
              onChange={(e) => {
                setUseCustomDays(e.target.checked);
                if (!e.target.checked) {
                  setCustomDays([]);
                }
              }}
            />
            <span>Repetir en días concretos de la semana</span>
          </label>

          {useCustomDays && (
            <>
              <div className="flex gap-1 flex-wrap mt-1">
                {weekdays.map((d) => {
                  const isActive = customDays.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleCustomDay(d.value)}
                      className={
                        "px-2 py-1 rounded-full text-xs border " +
                        (isActive
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-gray-300")
                      }
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>

              {/* duración de la recurrencia personalizada */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] text-gray-600">
                  Repetir durante
                </span>
                <select
                  className="rounded-lg border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/60"
                  value={customDurationWeeks}
                  onChange={(e) =>
                    setCustomDurationWeeks(Number(e.target.value))
                  }
                >
                  <option value={1}>1 semana</option>
                  <option value={2}>2 semanas</option>
                  <option value={4}>4 semanas</option>
                  <option value={8}>8 semanas</option>
                  <option value={12}>12 semanas</option>
                </select>
              </div>

              <p className="text-[11px] text-gray-400 mt-1">
                Nota: Editar la recurrencia aquí no regenerará los eventos pasados, solo actualizará la etiqueta.
              </p>
            </>
          )}
        </div>

        <div className="space-y-1">
          <span className="block text-xs text-gray-600">Asignado a</span>
          <select
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/60"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            {familyMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <span className="block text-xs text-gray-600">Color</span>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((c) => (
              <button
                key={c.value || "default"}
                type="button"
                onClick={() => setSelectedColor(c.value)}
                className={
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all " +
                  (selectedColor === c.value
                    ? "border-slate-900 scale-110"
                    : "border-transparent hover:scale-105")
                }
                style={{ backgroundColor: c.value || "#e2e8f0" }}
                title={c.label}
              >
                {selectedColor === c.value && (
                  <span className="text-[10px] text-white font-bold">✓</span>
                )}
                {!c.value && !selectedColor && (
                  <span className="text-[10px] text-slate-500 font-bold">?</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-gray-600" htmlFor="description">
            Notas / descripción (opcional)
          </label>
          <textarea
            id="description"
            className="w-full min-h-[70px] rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/60 resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <span className="block text-xs text-gray-600">Prioridad</span>
          <div className="flex gap-2">
            {(["LOW", "MEDIUM", "HIGH"] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={
                  "flex-1 rounded-full border px-2 py-1 text-xs " +
                  (priority === p
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-gray-300")
                }
              >
                {p === "LOW" && "Baja"}
                {p === "MEDIUM" && "Media"}
                {p === "HIGH" && "Alta"}
              </button>
            ))}
          </div>
        </div>

        {/* Recurrence editing is simplified or disabled for now to avoid complexity with series */}
        <div className="space-y-1">
          <span className="block text-xs text-gray-600">Repetir (Editar recurrencia no cambia eventos pasados)</span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: "NONE", label: "No repetir" },
                { value: "DAILY", label: "Diariamente" },
                { value: "WEEKLY", label: "Semanalmente" },
                { value: "MONTHLY", label: "Mensualmente" },
              ] as { value: Recurrence; label: string }[]
            ).map((r) => (
              <button
                disabled={useCustomDays}
                key={r.value}
                type="button"
                onClick={() => setRecurrence(r.value)}
                className={
                  "rounded-full border px-2 py-1 text-xs " +
                  (recurrence === r.value
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-gray-300")
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 rounded-lg border border-gray-300 text-slate-700 py-2 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm("¿Borrar solo este evento?")) {
                  setIsSubmitting(true);
                  try {
                    await removeTask(taskId!, false); // deleteAll = false
                    navigate(-1);
                  } catch (err) {
                    console.error(err);
                    setError("Error al borrar evento");
                    setIsSubmitting(false);
                  }
                }
              }}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-red-200 text-red-600 py-2 text-xs font-medium hover:bg-red-50"
            >
              Borrar solo este evento
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-slate-900 text-white py-2 text-sm font-medium disabled:opacity-60"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>

          {/* Series Options */}
          {tasks.find((t) => t.id === taskId)?.seriesId && (
            <div className="border-t pt-2 mt-2 space-y-2">
              <p className="text-xs text-gray-500 font-medium">
                Opciones de serie
              </p>
              <div className="flex gap-2">


                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm("¿Borrar TODA la serie?")) {
                      setIsSubmitting(true);
                      try {
                        await removeTask(taskId!, true); // deleteAll = true
                        navigate(-1);
                      } catch (err) {
                        console.error(err);
                        setError("Error al borrar serie");
                        setIsSubmitting(false);
                      }
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-red-50 border border-red-200 text-red-600 py-2 text-xs font-medium hover:bg-red-100"
                >
                  Borrar Serie
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "¿Actualizar toda la serie? (Se mantendrán las fechas originales de cada evento)"
                      )
                    ) {
                      setIsSubmitting(true);
                      try {
                        await updateTask(
                          taskId!,
                          {
                            title,
                            date, // This date is ignored for other series items in store logic
                            time: time || undefined,
                            assigneeId,
                            priority,
                            recurrence: useCustomDays ? "CUSTOM_WEEKLY" : recurrence,
                            description: description || undefined,
                            daysOfWeek: useCustomDays ? customDays : undefined,
                            durationWeeks: useCustomDays ? customDurationWeeks : undefined,
                            notificationTime: notificationTime > 0 ? notificationTime : undefined,
                            color: selectedColor,
                            createdBy: storedCreatedBy,

                          },
                          true // updateAll
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
                  className="flex-1 rounded-lg bg-slate-700 text-white py-2 text-xs font-medium disabled:opacity-60"
                >
                  Guardar Serie
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
