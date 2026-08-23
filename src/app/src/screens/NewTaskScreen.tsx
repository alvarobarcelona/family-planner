import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import {
  useTaskStore,
  type Priority,
  type Recurrence,
} from "../store/useTaskStore";

//canada date format, but respect de rule for local dates and hours
function todayStr(): string {
  return new Date().toLocaleDateString("en-CA");
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

const notificationOptions = [
  { value: -1, label: "Sin notificación" },
  { value: 0, label: "En el momento del evento" },
  { value: 10, label: "10 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
  { value: 120, label: "2 horas antes" },
  { value: 1440, label: "1 día antes" },
  { value: 2880, label: "2 días antes" },
  { value: 10080, label: "1 semana antes" },
];

export function NewTaskScreen() {
  const navigate = useNavigate();
  const { alert } = useModal();
  const { addTask, familyMembers, createdBy, currentMemberId, currentMemberName } = useTaskStore();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayStr());
  const [endDate, setEndDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [recurrence, setRecurrence] = useState<Recurrence>("NONE");
  const [description, setDescription] = useState("");
  const [notificationTime, setNotificationTime] = useState<number>(-1);
  // Pre-fill createdBy from active member profile
  const [selectedCreatedBy, setSelectedCreatedBy] = useState<string>(
    () => currentMemberId || ""
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const [customDays, setCustomDays] = useState<number[]>([]);
  // const [customDurationWeeks, setCustomDurationWeeks] = useState(4); // Removed in favor of generic recurrence
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndCondition, setRecurrenceEndCondition] = useState<'NEVER' | 'DATE' | 'COUNT'>('NEVER');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [recurrenceCount, setRecurrenceCount] = useState<number | undefined>(undefined);


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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    if (!assigneeId) {
      setError("Por favor, selecciona a quién asignar la tarea");
      return;
    }
    if (!selectedCreatedBy || selectedCreatedBy === "default") {
      setError("Por favor, selecciona quién crea la tarea");
      return;
    }
    if (recurrence === 'WEEKLY' && customDays.length > 0) {
      // logic ok
    }
    // Strict validtion for unified recurrence?
    // If Weekly and user wants specific days, they can select them. If empty, maybe defaults to creation day (backend logic).

    setIsSubmitting(true);

    try {
      const createdTasks = await addTask({
        title,
        date,
        endDate: endDate || undefined,
        time: time || undefined,
        endTime: endTime || undefined,
        assigneeId,
        priority,
        recurrence,
        description: description || undefined,
        daysOfWeek: recurrence === 'WEEKLY' || recurrence === 'CUSTOM_WEEKLY' ? customDays : undefined,
        notificationTime: notificationTime >= 0 ? notificationTime : undefined,
        color: selectedColor,
        createdBy: selectedCreatedBy,
        recurrenceInterval,
        recurrenceEndDate: recurrenceEndCondition === 'DATE' ? recurrenceEndDate : undefined,
        recurrenceCount: recurrenceEndCondition === 'COUNT' ? recurrenceCount : undefined,
        isPrivate: currentMemberId ? isPrivate : false,
      });

      // Reset básico y volvemos a Hoy
      setTitle("");
      setEndDate("");
      setTime("");
      setEndTime("");
      setDescription("");
      setCustomDays([]);
      setRecurrence("NONE");
      setRecurrenceInterval(1);
      setRecurrenceEndCondition('NEVER');
      setRecurrenceEndDate("");
      setRecurrenceCount(undefined);
      setNotificationTime(-1);
      setSelectedColor(undefined);
      setIsPrivate(false);

      // Show success message with instance count
      const instanceCount = createdTasks?.length || 1;
      if (instanceCount === 1) {
        await alert("¡Tarea creada exitosamente!");
      } else {
        await alert(`¡Tarea creada exitosamente! Se crearon ${instanceCount} eventos.`);
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("No se ha podido crear la tarea");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Nueva tarea</h1>
        <p className="text-sm text-slate-500 mt-1">
          Añade algo nuevo al plan de la familia
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
            className="w-full rounded-xl border-slate-200 bg-slate-200 px-3 py-3 text-base focus:border-slate-900 focus:bg-white focus:ring-0 transition-all"
            placeholder="Ej: Pediatra Leo, Reunión guardería..."
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
            className="w-full min-h-[100px] rounded-xl border-slate-200 bg-slate-200 px-3 py-3 text-base focus:border-slate-900 focus:bg-white focus:ring-0 transition-all resize-y"
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
            className="w-full rounded-xl border-slate-200 bg-slate-200 px-3 py-2.5 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="col-span-2 sm:col-span-1 space-y-1.5">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide" htmlFor="time">
            Hora <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <div className="flex gap-2 items-center">
            <input
              id="time"
              type="time"
              className="w-full rounded-xl border-slate-200 bg-slate-200 px-2 py-2.5 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <span className="text-slate-400 font-bold">-</span>
            <input
              id="endTime"
              type="time"
              className="w-full rounded-xl border-slate-200 bg-slate-200 px-2 py-2.5 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all disabled:opacity-50"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={!time}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={() => setTime("09:00")} className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors">Mañana (09:00)</button>
            <button type="button" onClick={() => setTime("14:00")} className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors">Mediodía (14:00)</button>
            <button type="button" onClick={() => setTime("17:00")} className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors">Tarde (17:00)</button>
          </div>
        </div>

        {/* End Date */}
        <div className="col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700" htmlFor="endDate">
            Fecha fin (Opcional, para eventos de varios días)
          </label>
          <div className="flex gap-2 items-center">

            <input
              id="endDate"
              type="date"
              className="flex-1 rounded-xl border-slate-200 bg-slate-200 px-3 py-2.5 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={date}
            />

          </div>
        </div>

        {/* Priority */}
        <div className="col-span-2 space-y-2">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Prioridad</label>
          <div className="flex gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((p) => {
              let colors = "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200";
              let label = "";
              if (priority === p) {
                if (p === 'LOW') colors = "bg-green-100 text-green-700 border-green-300 ring-2 ring-green-100/50";
                if (p === 'MEDIUM') colors = "bg-amber-100 text-amber-700 border-amber-300 ring-2 ring-amber-100/50";
                if (p === 'HIGH') colors = "bg-red-100 text-red-700 border-red-300 ring-2 ring-red-100/50";
              }
              if (p === 'LOW') label = "🟢 Baja";
              if (p === 'MEDIUM') label = "🟡 Media";
              if (p === 'HIGH') label = "🔴 Alta";

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${colors}`}
                >
                  {label}
                </button>
              );
            })}
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
              className="w-full appearance-none rounded-xl border-slate-200 bg-slate-200 px-3 py-2.5 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all disabled:opacity-50"
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
            {/* Custom simple chevron */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {!time && (
            <p className="text-xs text-amber-500 flex items-center gap-1">
              ⚠️ Selecciona una hora para activar recordatorios
            </p>
          )}
        </div>

        <div className="col-span-2 h-px bg-slate-100 my-1" />

        {/* Assignee & Created By Row */}
        <div className="col-span-2 sm:col-span-1 space-y-2">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Asignado a</label>
          <div className="flex flex-wrap gap-2">
            {familyMembers.map((m) => {
              const isSelected = assigneeId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAssigneeId(m.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                    isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                    style={{ backgroundColor: m.color || '#94a3b8' }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 space-y-2">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Creado por</label>
          <div className="flex flex-wrap gap-2">
            {createdBy.map((m) => {
              const isSelected = selectedCreatedBy === m.id;
              const color = (m as any).color || '#94a3b8';
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedCreatedBy(m.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                    isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recurrence (Advanced) */}
        <div className="col-span-2 space-y-3 bg-slate-200 p-4 rounded-xl border border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700" htmlFor="recurrence">
              Repetición
            </label>
            <div className="relative">
              <select
                id="recurrence"
                className="w-full appearance-none rounded-xl border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-0 transition-all"
                value={recurrence}
                onChange={(e) => {
                  const val = e.target.value as Recurrence;
                  setRecurrence(val);
                  if (val !== 'WEEKLY' && val !== 'CUSTOM_WEEKLY') {
                    setCustomDays([]);
                  }
                }}
              >
                <option value="NONE">No repetir</option>
                <option value="DAILY">Diaria</option>
                <option value="WEEKLY">Semanal</option>
                <option value="MONTHLY">Mensual</option>
                <option value="YEARLY">Anual</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {recurrence !== 'NONE' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Interval */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">Cada</span>
                <input
                  type="number"
                  min="1"
                  className="w-20 rounded-xl border-slate-200 bg-white px-3 py-2 text-center text-sm focus:border-slate-900 focus:ring-0"
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <span className="text-sm text-slate-600">
                  {recurrence === 'DAILY' && (recurrenceInterval === 1 ? 'día' : 'días')}
                  {recurrence === 'WEEKLY' && (recurrenceInterval === 1 ? 'semana' : 'semanas')}
                  {recurrence === 'MONTHLY' && (recurrenceInterval === 1 ? 'mes' : 'meses')}
                  {recurrence === 'YEARLY' && (recurrenceInterval === 1 ? 'año' : 'años')}
                </span>
              </div>

              {/* Weekdays (Visible only for Weekly) */}
              {(recurrence === 'WEEKLY' || recurrence === 'CUSTOM_WEEKLY') && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Días de la semana</span>
                  <div className="flex gap-2 flex-wrap">
                    {weekdays.map((d) => {
                      const isActive = customDays.includes(d.value);
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
                  {customDays.length === 0 && (
                    <p className="text-xs text-slate-400">Si no seleccionas ninguno, se usará el día de la fecha de inicio.</p>
                  )}
                </div>
              )}

              <div className="h-px bg-slate-200" />

              {/* End Condition */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Finaliza</span>

                <div className="flex flex-col gap-2">
                  {/* NEVER */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="endCondition"
                      className="text-slate-900 focus:ring-slate-900"
                      checked={recurrenceEndCondition === 'NEVER'}
                      onChange={() => setRecurrenceEndCondition('NEVER')}
                    />
                    <span className="text-sm text-slate-700">Nunca</span>
                    <span className="text-[11px] text-slate-400 italic">
                      {recurrence === 'DAILY' && '(máx. 30 eventos)'}
                      {recurrence === 'WEEKLY' && customDays.length === 0 && '(máx. 12 eventos)'}
                      {(recurrence === 'WEEKLY' || recurrence === 'CUSTOM_WEEKLY') && customDays.length > 0 && '(máx. 52 semanas)'}
                      {recurrence === 'MONTHLY' && '(máx. 12 eventos)'}
                      {recurrence === 'YEARLY' && '(máx. 3 eventos)'}
                    </span>
                  </label>

                  {/* DATE */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="endCondition"
                        className="text-slate-900 focus:ring-slate-900"
                        checked={recurrenceEndCondition === 'DATE'}
                        onChange={() => setRecurrenceEndCondition('DATE')}
                      />
                      <span className="text-sm text-slate-700">El día</span>
                    </label>
                    <input
                      type="date"
                      className="flex-1 rounded-lg border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-slate-900 focus:ring-0 disabled:opacity-50"
                      disabled={recurrenceEndCondition !== 'DATE'}
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      min={date}
                    />
                  </div>

                  {/* COUNT */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="endCondition"
                        className="text-slate-900 focus:ring-slate-900"
                        checked={recurrenceEndCondition === 'COUNT'}
                        onChange={() => setRecurrenceEndCondition('COUNT')}
                      />
                      <span className="text-sm text-slate-700">Después de</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-20 rounded-lg border-slate-200 bg-white px-2 py-1.5 text-center text-sm focus:border-slate-900 focus:ring-0 disabled:opacity-50"
                      disabled={recurrenceEndCondition !== 'COUNT'}
                      value={recurrenceCount || ''}
                      onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || undefined)}
                      placeholder="#"
                    />
                    <span className="text-sm text-slate-600">
                      {recurrence === 'WEEKLY' && customDays.length > 0
                        ? (recurrenceCount === 1 ? 'semana' : 'semanas')
                        : (recurrenceCount === 1 ? 'vez' : 'veces')
                      }
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

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

        {/* Private toggle — only visible when a member profile is active */}
        {currentMemberId && (
          <div className="col-span-2">
            <button
              id="toggle-private-task"
              type="button"
              onClick={() => setIsPrivate((v) => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                isPrivate
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{isPrivate ? "🔒" : "👁️"}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold">{isPrivate ? "Tarea privada" : "Tarea pública"}</p>
                  <p className={`text-xs ${isPrivate ? "text-slate-300" : "text-slate-400"}`}>
                    {isPrivate ? `Solo la verás tú (${currentMemberName})` : "Visible para toda la familia"}
                  </p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-all duration-300 relative ${
                isPrivate ? "bg-indigo-500" : "bg-slate-300"
              }`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                  isPrivate ? "left-5" : "left-1"
                }`} />
              </div>
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="col-span-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="col-span-2 flex gap-3 pt-6 mt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
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
            ) : "Guardar Tarea"}
          </button>
        </div>

      </form>
    </div>
  );
}
