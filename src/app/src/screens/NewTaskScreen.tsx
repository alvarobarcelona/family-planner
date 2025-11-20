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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("El título es obligatorio");
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
        recurrence,
        description,
      });

      // Reset básico y volvemos a Hoy
      setTitle("");
      setTime("");
      setDescription("");
      setRecurrence("NONE");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("No se ha podido crear la tarea");
    } finally {
      setIsSubmitting(false);
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
           <b>Leyenda:</b>  Diariamente: próximos 7 dias. <br /> 
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
