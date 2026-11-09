import { useState, type FormEvent, type ReactNode } from "react";
import { useTaskStore, type Priority, type Recurrence } from "../store/useTaskStore";
import { advancedSummary, notificationOptions, type TaskFormValues } from "./taskFormValues";
import { nextEndTime } from "../utils/time";
import { addDays, toLocalDateStr } from "../utils/date";

const weekdays = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "X" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 7, label: "D" },
];

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

const quickTimes = ["09:00", "14:00", "17:00"];

/** Hoy, Mañana and the next Saturday that isn't today or tomorrow. */
function quickDates(): { label: string; value: string }[] {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
  const saturday = addDays(today, daysUntilSaturday < 2 ? daysUntilSaturday + 7 : daysUntilSaturday);
  return [
    { label: "Hoy", value: toLocalDateStr(today) },
    { label: "Mañana", value: toLocalDateStr(addDays(today, 1)) },
    { label: `Sábado ${saturday.getDate()}`, value: toLocalDateStr(saturday) },
  ];
}

const inputClass =
  "w-full rounded-xl border-slate-200 bg-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all";
const labelClass = "block text-xs font-medium text-slate-500 uppercase tracking-wide";
const chipClass = (active: boolean) =>
  `px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
    active ? "bg-slate-900 text-white" : "bg-slate-300 text-slate-700 hover:bg-slate-400"
  }`;

function Chevron({ open = false }: { open?: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function MemberPicker({
  label,
  members,
  selectedId,
  onSelect,
  className,
}: {
  label: string;
  members: { id: string; name: string; color?: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  className: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <span className={labelClass}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {members.map((m) => {
          const isSelected = selectedId === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md scale-105"
                  : "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200"
              }`}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                style={{ backgroundColor: m.color || "#94a3b8" }}
              >
                {m.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{m.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TaskFormProps {
  /** Only read on mount; remount the form (key) to load other values. */
  initialValues: TaskFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  /** Ask who creates the task (only when there is no active profile). */
  showCreatedBy: boolean;
  showPrivateToggle: boolean;
  initiallyExpanded?: boolean;
  /** Extra actions under the main buttons (e.g. delete, series options). */
  renderExtraActions?: (values: TaskFormValues) => ReactNode;
}

export function TaskForm({
  initialValues,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
  showCreatedBy,
  showPrivateToggle,
  initiallyExpanded = false,
  renderExtraActions,
}: TaskFormProps) {
  const { familyMembers, createdBy: createdByOptions, currentMemberName } = useTaskStore();
  const [values, setValues] = useState<TaskFormValues>(initialValues);
  const [showAdvanced, setShowAdvanced] = useState(initiallyExpanded);
  const [validationError, setValidationError] = useState<string | null>(null);

  const set = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const changeStartTime = (time: string) =>
    setValues((prev) => ({ ...prev, time, endTime: nextEndTime(prev.time, prev.endTime, time) }));

  // An end date before the new start date is no longer valid
  const changeDate = (date: string) =>
    setValues((prev) => ({ ...prev, date, endDate: prev.endDate && prev.endDate < date ? "" : prev.endDate }));

  const toggleCustomDay = (day: number) =>
    setValues((prev) => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter((d) => d !== day)
        : [...prev.customDays, day],
    }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!values.title.trim()) return setValidationError("El título es obligatorio");
    if (!values.assigneeId) return setValidationError("Por favor, selecciona a quién asignar la tarea");
    if (showCreatedBy && !values.createdBy) return setValidationError("Por favor, selecciona quién crea la tarea");
    setValidationError(null);
    onSubmit(values);
  };

  const v = values;
  const shownError = validationError ?? error;
  const summary = advancedSummary(v);
  const isWeekly = v.recurrence === "WEEKLY" || v.recurrence === "CUSTOM_WEEKLY";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-4 gap-y-5">
      {/* Title */}
      <div className="col-span-2 space-y-1.5">
        <label className="block text-sm font-medium text-slate-700" htmlFor="title">
          Título
        </label>
        <input
          id="title"
          type="text"
          className="w-full rounded-xl border-slate-200 bg-slate-300 px-3 py-3 text-base focus:border-slate-900 focus:bg-white focus:ring-0 transition-all"
          placeholder="Ej: Pediatra Leo, Reunión guardería..."
          value={v.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      {/* Date */}
      <div className="col-span-2 sm:col-span-1 space-y-1.5">
        <label className={labelClass} htmlFor="date">
          Fecha
        </label>
        <input id="date" type="date" className={inputClass} value={v.date} onChange={(e) => changeDate(e.target.value)} />
        <div className="flex flex-wrap gap-2 mt-2">
          {quickDates().map((d) => (
            <button key={d.label} type="button" onClick={() => changeDate(d.value)} className={chipClass(v.date === d.value)}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div className="col-span-2 sm:col-span-1 space-y-1.5">
        <label className={labelClass} htmlFor="time">
          Hora <span className="text-slate-400 font-normal normal-case">(opcional)</span>
        </label>
        <div className="flex gap-2 items-center">
          <input
            id="time"
            type="time"
            className={`${inputClass} px-2`}
            value={v.time}
            onChange={(e) => changeStartTime(e.target.value)}
          />
          <span className="text-slate-400 font-bold">-</span>
          <input
            id="endTime"
            type="time"
            aria-label="Hora de fin"
            className={`${inputClass} px-2 disabled:opacity-50`}
            value={v.endTime}
            onChange={(e) => set("endTime", e.target.value)}
            disabled={!v.time}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {quickTimes.map((t) => (
            <button key={t} type="button" onClick={() => changeStartTime(t)} className={chipClass(v.time === t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Assignee & Created By */}
      <MemberPicker
        label="Asignado a"
        members={familyMembers}
        selectedId={v.assigneeId}
        onSelect={(id) => set("assigneeId", id)}
        className={showCreatedBy ? "col-span-2 sm:col-span-1" : "col-span-2"}
      />
      {showCreatedBy && (
        <MemberPicker
          label="Creado por"
          members={createdByOptions}
          selectedId={v.createdBy}
          onSelect={(id) => set("createdBy", id)}
          className="col-span-2 sm:col-span-1"
        />
      )}

      {/* More options toggle */}
      <div className="col-span-2">
        <button
          type="button"
          onClick={() => setShowAdvanced((s) => !s)}
          aria-expanded={showAdvanced}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-left"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700">Más opciones</p>
            <p className="text-xs text-slate-500 truncate">
              {summary.length > 0 ? summary.join(" · ") : "Notas, recordatorio, repetición, color…"}
            </p>
          </div>
          <span className="text-slate-500 shrink-0">
            <Chevron open={showAdvanced} />
          </span>
        </button>
      </div>

      {showAdvanced && (
        <>
          {/* Notes */}
          <div className="col-span-2 space-y-1.5">
            <label className={labelClass} htmlFor="description">
              Notas
            </label>
            <textarea
              id="description"
              rows={2}
              className="w-full rounded-xl border-slate-200 bg-slate-300 px-3 py-2.5 text-base focus:border-slate-900 focus:bg-white focus:ring-0 transition-all resize-y"
              placeholder="Detalles adicionales..."
              value={v.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          {/* Notification */}
          <div className="col-span-2 sm:col-span-1 space-y-1.5">
            <label className={labelClass} htmlFor="notification">
              Recordatorio
            </label>
            <div className="relative">
              <select
                id="notification"
                className={`${inputClass} appearance-none disabled:opacity-50`}
                value={v.notificationTime}
                onChange={(e) => set("notificationTime", Number(e.target.value))}
                disabled={!v.time}
              >
                {notificationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <Chevron />
              </div>
            </div>
            {!v.time && <p className="text-xs text-amber-500">⚠️ Selecciona una hora para activar recordatorios</p>}
          </div>

          {/* End Date */}
          <div className="col-span-2 sm:col-span-1 space-y-1.5">
            <label className={labelClass} htmlFor="endDate">
              Fecha fin <span className="text-slate-400 font-normal normal-case">(varios días)</span>
            </label>
            <input
              id="endDate"
              type="date"
              className={inputClass}
              value={v.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              min={v.date}
            />
          </div>

          {/* Priority */}
          <div className="col-span-2 space-y-2">
            <span className={labelClass}>Prioridad</span>
            <div className="flex gap-2">
              {(
                [
                  ["LOW", "🟢 Baja", "bg-green-100 text-green-700 border-green-300 ring-2 ring-green-100/50"],
                  ["MEDIUM", "🟡 Media", "bg-amber-100 text-amber-700 border-amber-300 ring-2 ring-amber-100/50"],
                  ["HIGH", "🔴 Alta", "bg-red-100 text-red-700 border-red-300 ring-2 ring-red-100/50"],
                ] as [Priority, string, string][]
              ).map(([p, label, activeColors]) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set("priority", p)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                    v.priority === p ? activeColors : "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div className="col-span-2 space-y-3 bg-slate-300 p-4 rounded-xl border border-slate-100">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700" htmlFor="recurrence">
                Repetición
              </label>
              <div className="relative">
                <select
                  id="recurrence"
                  className="w-full appearance-none rounded-xl border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-0 transition-all"
                  value={v.recurrence}
                  onChange={(e) => {
                    const recurrence = e.target.value as Recurrence;
                    const weekly = recurrence === "WEEKLY" || recurrence === "CUSTOM_WEEKLY";
                    setValues((prev) => ({ ...prev, recurrence, customDays: weekly ? prev.customDays : [] }));
                  }}
                >
                  <option value="NONE">No repetir</option>
                  <option value="DAILY">Diaria</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensual</option>
                  <option value="YEARLY">Anual</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <Chevron />
                </div>
              </div>
            </div>

            {v.recurrence !== "NONE" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Interval */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">Cada</span>
                  <input
                    type="number"
                    min="1"
                    className="w-20 rounded-xl border-slate-200 bg-white px-3 py-2 text-center text-sm focus:border-slate-900 focus:ring-0"
                    value={v.recurrenceInterval}
                    onChange={(e) => set("recurrenceInterval", Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <span className="text-sm text-slate-600">
                    {v.recurrence === "DAILY" && (v.recurrenceInterval === 1 ? "día" : "días")}
                    {isWeekly && (v.recurrenceInterval === 1 ? "semana" : "semanas")}
                    {v.recurrence === "MONTHLY" && (v.recurrenceInterval === 1 ? "mes" : "meses")}
                    {v.recurrence === "YEARLY" && (v.recurrenceInterval === 1 ? "año" : "años")}
                  </span>
                </div>

                {/* Weekdays */}
                {isWeekly && (
                  <div className="space-y-2">
                    <span className={labelClass}>Días de la semana</span>
                    <div className="flex gap-2 flex-wrap">
                      {weekdays.map((d) => {
                        const isActive = v.customDays.includes(d.value);
                        return (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => toggleCustomDay(d.value)}
                            className={
                              "w-9 h-9 rounded-full text-xs font-bold transition-all " +
                              (isActive
                                ? "bg-slate-900 text-white shadow-md scale-105"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300")
                            }
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                    {v.customDays.length === 0 && (
                      <p className="text-xs text-slate-400">Si no seleccionas ninguno, se usará el día de la fecha de inicio.</p>
                    )}
                  </div>
                )}

                <div className="h-px bg-slate-400" />

                {/* End condition */}
                <div className="space-y-2">
                  <span className={labelClass}>Finaliza</span>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="endCondition"
                        className="text-slate-900 focus:ring-slate-900"
                        checked={v.recurrenceEndCondition === "NEVER"}
                        onChange={() => set("recurrenceEndCondition", "NEVER")}
                      />
                      <span className="text-sm text-slate-700">Nunca</span>
                      <span className="text-[11px] text-slate-400 italic">
                        {v.recurrence === "DAILY" && "(máx. 30 eventos)"}
                        {v.recurrence === "WEEKLY" && v.customDays.length === 0 && "(máx. 12 eventos)"}
                        {isWeekly && v.customDays.length > 0 && "(máx. 52 semanas)"}
                        {v.recurrence === "MONTHLY" && "(máx. 12 eventos)"}
                        {v.recurrence === "YEARLY" && "(máx. 3 eventos)"}
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer shrink-0">
                        <input
                          type="radio"
                          name="endCondition"
                          className="text-slate-900 focus:ring-slate-900"
                          checked={v.recurrenceEndCondition === "DATE"}
                          onChange={() => set("recurrenceEndCondition", "DATE")}
                        />
                        <span className="text-sm text-slate-700">El día</span>
                      </label>
                      <input
                        type="date"
                        className="flex-1 rounded-lg border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-slate-900 focus:ring-0 disabled:opacity-50"
                        disabled={v.recurrenceEndCondition !== "DATE"}
                        value={v.recurrenceEndDate}
                        onChange={(e) => set("recurrenceEndDate", e.target.value)}
                        min={v.date}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer shrink-0">
                        <input
                          type="radio"
                          name="endCondition"
                          className="text-slate-900 focus:ring-slate-900"
                          checked={v.recurrenceEndCondition === "COUNT"}
                          onChange={() => set("recurrenceEndCondition", "COUNT")}
                        />
                        <span className="text-sm text-slate-700">Después de</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-20 rounded-lg border-slate-200 bg-white px-2 py-1.5 text-center text-sm focus:border-slate-900 focus:ring-0 disabled:opacity-50"
                        disabled={v.recurrenceEndCondition !== "COUNT"}
                        value={v.recurrenceCount || ""}
                        onChange={(e) => set("recurrenceCount", parseInt(e.target.value) || undefined)}
                        placeholder="#"
                      />
                      <span className="text-sm text-slate-600">
                        {v.recurrence === "WEEKLY" && v.customDays.length > 0
                          ? v.recurrenceCount === 1 ? "semana" : "semanas"
                          : v.recurrenceCount === 1 ? "vez" : "veces"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Color */}
          <div className="col-span-2 space-y-2">
            <span className={labelClass}>Etiqueta de color</span>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((c) => (
                <button
                  key={c.value || "default"}
                  type="button"
                  onClick={() => set("color", c.value)}
                  className={
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-sm " +
                    (v.color === c.value
                      ? "border-slate-900 scale-110 ring-2 ring-slate-100"
                      : "border-transparent hover:scale-105 hover:shadow-md")
                  }
                  style={{ backgroundColor: c.value || "#f1f5f9" }}
                  title={c.label}
                  aria-label={c.label}
                >
                  {v.color === c.value && <span className="text-xs text-white drop-shadow-md">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Private toggle */}
          {showPrivateToggle && (
            <div className="col-span-2">
              <button
                type="button"
                onClick={() => set("isPrivate", !v.isPrivate)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                  v.isPrivate
                    ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{v.isPrivate ? "🔒" : "👁️"}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{v.isPrivate ? "Tarea privada" : "Tarea pública"}</p>
                    <p className={`text-xs ${v.isPrivate ? "text-slate-300" : "text-slate-400"}`}>
                      {v.isPrivate ? `Solo la verás tú (${currentMemberName})` : "Visible para toda la familia"}
                    </p>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full transition-all duration-300 relative ${v.isPrivate ? "bg-indigo-500" : "bg-slate-300"}`}>
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                      v.isPrivate ? "left-5" : "left-1"
                    }`}
                  />
                </div>
              </button>
            </div>
          )}
        </>
      )}

      {/* Error */}
      {shownError && (
        <div className="col-span-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {shownError}
        </div>
      )}

      {/* Actions */}
      <div className="col-span-2 flex gap-3 pt-6 mt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-200 bg-white text-slate-700 py-3.5 text-sm font-semibold hover:bg-slate-200 active:scale-95 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-[2] rounded-xl bg-slate-900 text-white py-3.5 text-sm font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-70 disabled:shadow-none"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>

      {renderExtraActions?.(values)}
    </form>
  );
}
