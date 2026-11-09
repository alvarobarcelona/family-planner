import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import { useTaskStore } from "../store/useTaskStore";
import { useGoBack } from "../hooks/useGoBack";
import { isDateStr, toLocalDateStr } from "../utils/date";
import {
  emptyTaskFormValues,
  formValuesToInput,
  notificationOptions,
  type TaskFormValues,
} from "../components/taskFormValues";
import { TaskForm } from "../components/TaskForm";

const LAST_NOTIFICATION_KEY = "last_notification_time";

function readLastNotificationTime(): number {
  try {
    const raw = localStorage.getItem(LAST_NOTIFICATION_KEY);
    // Number(null) would be 0 ("at event time"), so check for a stored value first
    if (raw === null) return -1;
    const stored = Number(raw);
    return notificationOptions.some((o) => o.value === stored) ? stored : -1;
  } catch {
    return -1;
  }
}

function saveLastNotificationTime(value: number) {
  try {
    localStorage.setItem(LAST_NOTIFICATION_KEY, String(value));
  } catch {
    // Storage unavailable (private mode): just don't remember the choice
  }
}

export function NewTaskScreen() {
  const goBack = useGoBack();
  const [searchParams] = useSearchParams();
  const { toast } = useModal();
  const { addTask, currentMemberId } = useTaskStore();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed once: the form only reads initialValues on mount
  const [initialValues] = useState<TaskFormValues>(() => {
    const dateParam = searchParams.get("date");
    return {
      ...emptyTaskFormValues(),
      // ?date=YYYY-MM-DD when opened from a calendar day
      date: isDateStr(dateParam) ? dateParam : toLocalDateStr(new Date()),
      // The active profile is both the default assignee and the creator
      assigneeId: currentMemberId || "",
      createdBy: currentMemberId || "",
      notificationTime: readLastNotificationTime(),
    };
  });

  const handleSubmit = async (values: TaskFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const createdTasks = await addTask({
        ...formValuesToInput(values),
        isPrivate: currentMemberId ? values.isPrivate : false,
      });

      if (values.time) saveLastNotificationTime(values.notificationTime);

      const count = createdTasks?.length || 1;
      toast(count === 1 ? "Tarea creada" : `Tarea creada · ${count} eventos`);
      goBack();
    } catch (err) {
      console.error(err);
      setError("No se ha podido crear la tarea");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Nueva tarea</h1>
        <p className="text-sm text-slate-500 mt-1">Añade algo nuevo al plan de la familia</p>
      </header>

      <TaskForm
        initialValues={initialValues}
        submitLabel="Guardar tarea"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={goBack}
        showCreatedBy={!currentMemberId}
        showPrivateToggle={!!currentMemberId}
      />
    </div>
  );
}
