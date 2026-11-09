import type { CreateTaskInput, Priority, Recurrence } from "../store/useTaskStore";
import { toLocalDateStr } from "../utils/date";

export type RecurrenceEndCondition = "NEVER" | "DATE" | "COUNT";

export interface TaskFormValues {
  title: string;
  description: string;
  date: string;
  endDate: string;
  time: string;
  endTime: string;
  assigneeId: string;
  createdBy: string;
  priority: Priority;
  notificationTime: number; // -1 = none
  recurrence: Recurrence;
  customDays: number[];
  recurrenceInterval: number;
  recurrenceEndCondition: RecurrenceEndCondition;
  recurrenceEndDate: string;
  recurrenceCount: number | undefined;
  color: string | undefined;
  isPrivate: boolean;
}

/** Defaults for a new task. `date` is "today" at call time. */
export function emptyTaskFormValues(): TaskFormValues {
  return {
    title: "",
    description: "",
    date: toLocalDateStr(new Date()),
    endDate: "",
    time: "",
    endTime: "",
    assigneeId: "",
    createdBy: "",
    priority: "MEDIUM",
    notificationTime: -1,
    recurrence: "NONE",
    customDays: [],
    recurrenceInterval: 1,
    recurrenceEndCondition: "NEVER",
    recurrenceEndDate: "",
    recurrenceCount: undefined,
    color: undefined,
    isPrivate: false,
  };
}

/** Maps form values to the API input shared by create and update. */
export function formValuesToInput(v: TaskFormValues): CreateTaskInput {
  const isWeekly = v.recurrence === "WEEKLY" || v.recurrence === "CUSTOM_WEEKLY";
  return {
    title: v.title,
    date: v.date,
    endDate: v.endDate || undefined,
    time: v.time || undefined,
    endTime: v.endTime || undefined,
    assigneeId: v.assigneeId,
    priority: v.priority,
    recurrence: v.recurrence,
    description: v.description || undefined,
    daysOfWeek: isWeekly ? v.customDays : undefined,
    // Reminders only make sense with a start time
    notificationTime: v.time && v.notificationTime >= 0 ? v.notificationTime : undefined,
    color: v.color,
    createdBy: v.createdBy,
    recurrenceInterval: v.recurrenceInterval,
    recurrenceEndDate: v.recurrenceEndCondition === "DATE" ? v.recurrenceEndDate : undefined,
    recurrenceCount: v.recurrenceEndCondition === "COUNT" ? v.recurrenceCount : undefined,
    isPrivate: v.isPrivate,
  };
}

export const notificationOptions = [
  { value: -1, label: "Sin notificación", short: "" },
  { value: 0, label: "En el momento del evento", short: "Aviso al empezar" },
  { value: 10, label: "10 minutos antes", short: "Aviso 10 min" },
  { value: 30, label: "30 minutos antes", short: "Aviso 30 min" },
  { value: 60, label: "1 hora antes", short: "Aviso 1 h" },
  { value: 120, label: "2 horas antes", short: "Aviso 2 h" },
  { value: 1440, label: "1 día antes", short: "Aviso 1 día" },
  { value: 2880, label: "2 días antes", short: "Aviso 2 días" },
  { value: 10080, label: "1 semana antes", short: "Aviso 1 semana" },
];

const recurrenceLabels: Record<Recurrence, string> = {
  NONE: "",
  DAILY: "Diaria",
  WEEKLY: "Semanal",
  CUSTOM_WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  YEARLY: "Anual",
};

/** Short labels for the "Más opciones" fields that differ from their defaults. */
export function advancedSummary(v: TaskFormValues): string[] {
  const items: string[] = [];
  if (v.description.trim()) items.push("Notas");
  if (v.endDate) {
    const end = new Date(`${v.endDate}T00:00:00`);
    items.push(`Hasta ${end.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`);
  }
  if (v.priority === "HIGH") items.push("Prioridad alta");
  if (v.priority === "LOW") items.push("Prioridad baja");
  if (v.time && v.notificationTime >= 0) {
    const opt = notificationOptions.find((o) => o.value === v.notificationTime);
    if (opt) items.push(opt.short);
  }
  if (v.recurrence !== "NONE") items.push(recurrenceLabels[v.recurrence]);
  if (v.color) items.push("Color");
  if (v.isPrivate) items.push("Privada");
  return items;
}

export function hasAdvancedValues(v: TaskFormValues): boolean {
  return advancedSummary(v).length > 0;
}
