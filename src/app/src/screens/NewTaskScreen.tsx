import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useTaskStore,
  type Priority,
  type Recurrence,
} from "../store/useTaskStore";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const weekdays = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "X" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 7, label: "D" },
];

export function NewTaskScreen() {
  const navigate = useNavigate();
  const { addTask, familyMembers } = useTaskStore();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("");
  const [assigneeId, setAssigneeId] = useState("familia");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [recurrence, setRecurrence] = useState<Recurrence>("NONE");
  const [description, setDescription] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [useCustomDays, setUseCustomDays] = useState(false);
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [customDurationWeeks, setCustomDurationWeeks] = useState(4); // por defecto 4 semanas

  const toggleCustomDay = (value: number) => {
    setCustomDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    if (useCustomDays && customDays.length === 0) {
      setError("Selecciona al menos un día de la semana");
      return;
    }

    setIsSubmitting(true);

    try {
      addTask({
        title,
        date,
        time: time || undefined,
        assigneeId,
        priority,
        recurrence: useCustomDays ? "CUSTOM_WEEKLY" : recurrence,
        description: description || undefined,
        daysOfWeek: useCustomDays ? customDays : undefined,
        durationWeeks: useCustomDays ? customDurationWeeks : undefined,
      });

      // Reset básico y volvemos a Hoy
      setTitle("");
      setTime("");
      setDescription("");
      setCustomDays([]);
      setUseCustomDays(false);
      setCustomDurationWeeks(4);
      setRecurrence("NONE");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("No se ha podido crear la tarea");
    } finally {
      setIsSubmitting(false);
      window.alert("Tarea creada existosamente!");
    }
  };

  return (
    <div className="space-y-3">
      <header className="mt-1 mb-2">
        <h1 className="text-xl font-semibold">Nueva tarea / evento</h1>
        <p className="text-xs text-gray-500">
          Añade algo nuevo al plan de la familia
        </p>
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
            placeholder="Pediatra Hugo, Reunión Kita..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {/* Fecha */}
          <div className="flex-1 space-y-1">
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

          {/* Hora */}
          <div className="flex-1 space-y-1">
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
                A partir de la fecha seleccionada, se crearán eventos en los
                días marcados durante {customDurationWeeks} semana(s).
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
          <label className="block text-xs text-gray-600" htmlFor="description">
            Notas / descripción (opcional)
          </label>
          <textarea
            id="description"
            className="w-full min-h-[70px] rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/60 resize-y"
            placeholder="Detalles, direcciones, cosas a llevar..."
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

        <div className="space-y-1">
          <span className="block text-xs text-gray-600">Repetir</span>
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
          <div>
            <b>Leyenda:</b> Diariamente: próximos 7 dias. <br />
            Semanalmente: próximas 4 semanas. <br />
            Mensualmente: próximos 12 meses.
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
}
