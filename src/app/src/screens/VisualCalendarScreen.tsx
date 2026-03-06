import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../store/useTaskStore";

type ViewMode = "week" | "month" | "year";
type FilterAssigneeId = "all" | string;

// Helper for local date string YYYY-MM-DD
const toLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to check if a task covers a specific date
const isTaskOnDate = (task: any, dateStr: string) => {
    if (task.date === dateStr) return true;
    if (!task.endDate) return false;

    // Simple string comparison works for YYYY-MM-DD
    return dateStr >= task.date && dateStr <= task.endDate;
};

export function VisualCalendarScreen() {
    const navigate = useNavigate();
    const { tasks, familyMembers, toggleTaskCompletion } = useTaskStore();

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>("month");
    const [selectedAssigneeId, setSelectedAssigneeId] = useState<FilterAssigneeId>("all");
    const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);
    const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
    const [todayFlash, setTodayFlash] = useState(false);
    const agendaScrollRef = useRef<HTMLDivElement | null>(null);

    // Filter Tasks
    const filteredTasks = useMemo(() => {
        if (selectedAssigneeId === "all") return tasks;
        return tasks.filter((task) =>
            task.assignees.some((a) => a.id === selectedAssigneeId)
        );
    }, [tasks, selectedAssigneeId]);

    const handlePrev = () => {
        setSlideDirection("right");
        const newDate = new Date(currentDate);
        if (viewMode === "week") newDate.setDate(newDate.getDate() - 7);
        if (viewMode === "month") newDate.setMonth(newDate.getMonth() - 1);
        if (viewMode === "year") newDate.setFullYear(newDate.getFullYear() - 1);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        setSlideDirection("left");
        const newDate = new Date(currentDate);
        if (viewMode === "week") newDate.setDate(newDate.getDate() + 7);
        if (viewMode === "month") newDate.setMonth(newDate.getMonth() + 1);
        if (viewMode === "year") newDate.setFullYear(newDate.getFullYear() + 1);
        setCurrentDate(newDate);
    };

    const handleToday = () => {
        setSlideDirection("left");
        setCurrentDate(new Date());
        // Flash feedback
        setTodayFlash(true);
        setTimeout(() => setTodayFlash(false), 600);
    };

    const scrollAgendaToTop = () => {
        document.getElementById("agenda-top")?.scrollIntoView({ behavior: "smooth" });
    };

    const handleTaskClick = (taskId: string) => {
        const target = `/edit/${taskId}`;
        if ('startViewTransition' in document) {
            (document as any).startViewTransition(() => navigate(target));
        } else {
            navigate(target);
        }
    };

    // Title Helper
    const getTitle = () => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
        if (viewMode === "year") return currentDate.getFullYear().toString();
        if (viewMode === "week") {
            // Simple week range logic could go here, for now just Month Year of start date
            return `Semana del ${currentDate.toLocaleDateString("es-ES", { month: 'short', day: 'numeric' })}`;
        }
        return currentDate.toLocaleDateString("es-ES", options);
    };

    // Swipe Logic
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrev();
        }
    };

    return (
        <div className="space-y-3 h-full flex flex-col">
            {/* Header */}
            <header className="mt-1 mb-2 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold capitalize text-slate-800">{getTitle()}</h1>
                    <div className="flex items-center gap-1 bg-white border border-slate-200 shadow-sm rounded-xl p-1">
                        <button
                            onClick={handlePrev}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            aria-label="Anterior"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={handleToday}
                            className={`relative px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 overflow-hidden
                                ${todayFlash
                                    ? "text-white bg-indigo-500 shadow-md shadow-indigo-300 scale-95"
                                    : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                                }`}
                        >
                            {todayFlash && (
                                <span className="absolute inset-0 rounded-lg animate-ping bg-indigo-400 opacity-40 pointer-events-none" />
                            )}
                            HOY
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            aria-label="Siguiente"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* View Switcher (Segmented Control) */}
                <div className="flex bg-slate-100/80 backdrop-blur p-1 rounded-xl self-start shadow-inner border border-slate-200/60">
                    {(["week", "month", "year"] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => {
                                setViewMode(mode);
                            }}
                            className={`px-4 py-1.5 text-xs rounded-lg capitalize transition-all duration-200 ${viewMode === mode
                                ? "bg-white shadow-sm font-semibold text-indigo-600"
                                : "text-slate-500 hover:text-slate-700 font-medium"
                                }`}
                        >
                            {mode === "week" ? "Semana" : mode === "month" ? "Mes" : "Agenda del año"}
                        </button>
                    ))}
                </div>
            </header>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    type="button"
                    onClick={() => setSelectedAssigneeId("all")}
                    className={
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all " +
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
                            "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all " +
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

            {/* Content Area */}
            <div
                className="relative flex-1 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-2 min-h-[300px] flex flex-col overflow-hidden touch-pan-y"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div
                    key={`${viewMode}-${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`}
                    className={`flex-1 min-h-0 flex flex-col overflow-hidden ${slideDirection === "left"
                        ? "animate-slide-in-right"
                        : "animate-slide-in-left"
                        }`}
                >
                    {viewMode === "week" && (
                        <WeekView
                            currentDate={currentDate}
                            tasks={filteredTasks}
                            onTaskClick={handleTaskClick}
                            toggleTaskCompletion={toggleTaskCompletion}
                            animatingTaskId={animatingTaskId}
                            setAnimatingTaskId={setAnimatingTaskId}
                        />
                    )}

                    {viewMode === "month" && (
                        <MonthView
                            currentDate={currentDate}
                            tasks={filteredTasks}
                            onDayClick={(date) => {
                                setSlideDirection("left");
                                setCurrentDate(date);
                                setViewMode("week");
                            }}
                        />
                    )}

                    {viewMode === "year" && (
                        <AgendaView
                            currentDate={currentDate}
                            tasks={filteredTasks}
                            onTaskClick={handleTaskClick}
                            ref={agendaScrollRef}
                        />
                    )}
                </div>

                {/* Scroll to top — only shown inside AgendaView */}
                {viewMode === "year" && (
                    <button
                        onClick={scrollAgendaToTop}
                        className="absolute bottom-4 right-4 bg-indigo-600 text-white p-2.5 rounded-full shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all z-20 flex items-center justify-center"
                        aria-label="Volver arriba"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

function WeekView({ currentDate, tasks, onTaskClick, toggleTaskCompletion, animatingTaskId, setAnimatingTaskId }: {
    currentDate: Date,
    tasks: any[],
    onTaskClick: (id: string) => void,
    toggleTaskCompletion: (id: string) => void,
    animatingTaskId: string | null,
    setAnimatingTaskId: (id: string | null) => void
}) {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        weekDays.push(d);
    }

    return (
        <div className="h-full flex flex-col overflow-hidden gap-4">
            {/* Top: Grid View */}
            <div className="flex flex-col shrink-0">
                <div className="grid grid-cols-7 mb-2 border-b pb-1">
                    {weekDays.map(d => (
                        <div key={d.toISOString()} className="text-center">
                            <div className="text-[10px] text-gray-500 uppercase">{d.toLocaleDateString("es-ES", { weekday: 'short' }).slice(0, 1)}</div>
                            <div className={`text-sm font-bold ${d.toDateString() === new Date().toDateString() ? 'text-slate-900 bg-amber-200 rounded-full w-6 h-6 mx-auto flex items-center justify-center' : ''}`}>
                                {d.getDate()}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {weekDays.map(d => {
                        const dateStr = toLocalDateString(d);
                        const dayTasks = tasks.filter(t => isTaskOnDate(t, dateStr)).sort((a, b) => (a.timeLabel || "").localeCompare(b.timeLabel || ""));

                        return (
                            <div key={dateStr} className="flex flex-col gap-1 min-h-[80px] border-r last:border-r-0 border-gray-100 px-0.5 pt-1 bg-slate-50/50 rounded-lg">
                                {dayTasks.map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => onTaskClick(t.id)}
                                        className="p-1 rounded text-[9px] cursor-pointer hover:opacity-80 shadow-sm truncate"
                                        style={{ backgroundColor: t.color || t.assignees[0]?.color || '#eee', color: '#fff' }}
                                        title={t.title}
                                    >
                                        {t.timeLabel && <span className="opacity-75 mr-0.5">{t.timeLabel}</span>}
                                        {t.title}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom: List View */}
            <div className="flex-1 overflow-y-auto px-1 space-y-4 pb-4 border-t border-slate-100 pt-2">
                <h3 className="text-sm font-bold text-dark-400 uppercase tracking-wider">Agenda de la semana</h3>
                {weekDays.map(d => {
                    const dateStr = toLocalDateString(d);
                    const dayTasks = tasks.filter(t => isTaskOnDate(t, dateStr)).sort((a, b) => (a.timeLabel || "").localeCompare(b.timeLabel || ""));

                    if (dayTasks.length === 0) return null;

                    return (
                        <div key={dateStr} className="flex flex-col gap-3">
                            <h4 className=" rounded-lg text-sm font-semibold text-slate-600 sticky top-0 bg-gray-200 backdrop-blur-sm py-1 z-10 flex items-center gap-2">
                                <span className="capitalize ml-2">{d.toLocaleDateString("es-ES", { weekday: 'long' })}</span>
                                <span className="text-slate-400 font-normal">{d.getDate()}</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-2">
                                {dayTasks.map(task => {
                                    const isAnimating = animatingTaskId === task.id;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex flex-col gap-1.5 transition-all duration-300 relative overflow-hidden group
                                                ${isAnimating ? "animate-pop ring-2 ring-emerald-400 border-emerald-400" : "hover:shadow-md hover:border-slate-300"}
                                                ${task.isCompleted ? "opacity-60" : ""}
                                            `}
                                        >
                                            <div
                                                className="absolute left-0 top-0 bottom-0 w-2 transition-all group-hover:w-3"
                                                style={{ backgroundColor: task.color || task.assignees[0]?.color || '#cbd5e1' }}
                                            />

                                            <div className="flex gap-3 items-start pl-2">
                                                {/* Checkbox */}
                                                <div className="pt-0.5 relative shrink-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!task.isCompleted) {
                                                                setAnimatingTaskId(task.id);
                                                                setTimeout(() => setAnimatingTaskId(null), 1000);
                                                            }
                                                            toggleTaskCompletion(task.id);
                                                        }}
                                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-white z-10 relative
                                                            ${task.isCompleted
                                                                ? "border-emerald-500 bg-emerald-50"
                                                                : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                                                            } 
                                                            ${isAnimating ? "scale-110 border-emerald-500 bg-emerald-50" : ""}
                                                        `}
                                                    >
                                                        {(task.isCompleted || isAnimating) && (
                                                            <svg className={`w-4 h-4 text-emerald-500 ${isAnimating ? "scale-125 transition-transform duration-300" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                            </svg>
                                                        )}
                                                    </button>
                                                    {isAnimating && (
                                                        <div className="absolute inset-0 rounded-full animate-burst bg-emerald-400"></div>
                                                    )}
                                                </div>

                                                {/* Task Info */}
                                                <div
                                                    className="flex-1 min-w-0 cursor-pointer"
                                                    onClick={() => onTaskClick(task.id)}
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className={`text-sm font-semibold leading-snug truncate ${task.isCompleted ? "line-through text-slate-500" : "text-slate-800"}`}>
                                                            {task.title}
                                                        </p>

                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {task.notificationTime != null && (
                                                                <span className="animate-bell-shake text-sm">🔔</span>
                                                            )}
                                                            {task.timeLabel && (
                                                                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                                                    {task.timeLabel} h
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {task.description && (
                                                        <p className={`text-xs mt-0.5 line-clamp-1 ${task.isCompleted ? "text-slate-400" : "text-slate-500"}`}>
                                                            {task.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-between mt-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {task.assignees.map((a: any) => (
                                                                <span key={a.id} className="text-[10px] px-2 py-0.5 bg-slate-100/80 text-slate-600 font-medium rounded-full border border-slate-200/60">
                                                                    {a.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
                {tasks.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate >= weekDays[0] && tDate <= weekDays[6];
                }).length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            No hay eventos esta semana
                        </div>
                    )}
            </div>
        </div>
    );
}

interface AgendaViewProps {
    currentDate: Date;
    tasks: any[];
    onTaskClick: (id: string) => void;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const AgendaView = React.forwardRef<HTMLDivElement, AgendaViewProps>(({ currentDate, tasks, onTaskClick, onScroll }, ref) => {
    // Collect all unique months starting from the current displayed month that have events, plus the next 12 months minimum limit.
    // Instead of fixed 12 months from January, let's start from 'currentDate' and show upcoming months that contain events.
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Group tasks by "YYYY-MM"
    const tasksByMonth = useMemo(() => {
        const grouped: Record<string, any[]> = {};

        tasks.forEach(t => {
            // Include starting time month, but note that tasks can span multiple days
            if (!t.date) return;
            const tDate = new Date(t.date);

            // Only consider tasks from the requested year onwards for simplicity in timeline
            if (tDate.getFullYear() < currentYear || (tDate.getFullYear() === currentYear && tDate.getMonth() < currentMonth)) {
                return; // Exclude past events relative to currentDate
            }

            const monthKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;
            if (!grouped[monthKey]) grouped[monthKey] = [];
            grouped[monthKey].push(t);
        });

        // Sort tasks within each month
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });

        return grouped;
    }, [tasks, currentYear, currentMonth]);

    const sortedMonthKeys = Object.keys(tasksByMonth).sort();

    if (sortedMonthKeys.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <div className="bg-slate-100 p-4 rounded-full mb-3">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <p className="text-sm font-medium">No hay eventos planificados próximamente.</p>
                <p className="text-xs mt-1 opacity-70">Añade eventos para verlos aquí.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto px-1 pb-12 space-y-6" ref={ref} onScroll={onScroll}>
            <div id="agenda-top" />
            {sortedMonthKeys.map(monthKey => {
                const [yStr, mStr] = monthKey.split('-');
                const monthDate = new Date(parseInt(yStr), parseInt(mStr) - 1, 1);
                const monthTasks = tasksByMonth[monthKey];
                const isCurrentMonth = parseInt(yStr) === new Date().getFullYear() && parseInt(mStr) - 1 === new Date().getMonth();

                return (
                    <div key={monthKey} className="relative">
                        <div className="sticky m-2 top-0 py-2 mb-3 border-b border-slate-100 flex items-baseline gap-2">
                            <h3 className={`text-lg font-bold capitalize ${isCurrentMonth ? "text-indigo-600" : "text-slate-800"}`}>
                                {monthDate.toLocaleDateString("es-ES", { month: 'long' })}
                            </h3>
                            {parseInt(yStr) !== currentYear && (
                                <span className="text-sm font-medium text-slate-400">{yStr}</span>
                            )}
                            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 ml-auto">
                                {monthTasks.length} {monthTasks.length === 1 ? 'evento' : 'eventos'}
                            </span>
                        </div>

                        <div className="space-y-3 pl-2 pr-1">
                            {monthTasks.map((task) => {
                                const tDate = new Date(task.date);
                                const isPast = tDate < new Date() && !isTaskOnDate(task, toLocalDateString(new Date()));

                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => onTaskClick(task.id)}
                                        className={`group bg-white rounded-xl p-3 shadow-sm border border-slate-100/80 cursor-pointer transition-all hover:shadow-md hover:border-indigo-100 flex gap-3
                                            ${isPast ? "opacity-60 grayscale-[0.5]" : ""}
                                        `}
                                    >
                                        <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 text-center relative overflow-hidden">
                                            <div
                                                className="absolute top-0 w-full h-1"
                                                style={{ backgroundColor: task.color || task.assignees[0]?.color || '#94a3b8' }}
                                            />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mt-1">
                                                {tDate.toLocaleDateString("es-ES", { weekday: 'short' }).slice(0, 3)}
                                            </span>
                                            <span className="text-lg font-black text-slate-700 leading-none mt-0.5">
                                                {tDate.getDate()}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-sm font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-700 transition-colors">
                                                    {task.title}
                                                </h4>
                                                {task.timeLabel && (
                                                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                                                        {task.timeLabel} h
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mt-1.5">
                                                <div className="flex -space-x-1.5">
                                                    {task.assignees.slice(0, 3).map((a: any) => (
                                                        <div
                                                            key={a.id}
                                                            className="w-4 h-4 rounded-full ring-2 ring-white"
                                                            style={{ backgroundColor: a.color }}
                                                            title={a.name}
                                                        />
                                                    ))}
                                                    {task.assignees.length > 3 && (
                                                        <div className="w-4 h-4 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center text-[7px] font-bold text-slate-600">
                                                            +{task.assignees.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                {task.description && (
                                                    <span className="text-xs text-slate-500 truncate flex-1">
                                                        {task.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

function MonthView({ currentDate, tasks, onDayClick }: { currentDate: Date, tasks: any[], onDayClick: (d: Date) => void }) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Adjust for Monday start (0=Sun, 1=Mon... -> 0=Mon, 6=Sun)
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        days.push({ day: prevMonthLastDay - i, type: 'prev', date: new Date(year, month - 1, prevMonthLastDay - i) });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, type: 'current', date: new Date(year, month, i) });
    }

    // Next month padding
    const remainingCells = 42 - days.length; // 6 rows * 7 cols
    for (let i = 1; i <= remainingCells; i++) {
        days.push({ day: i, type: 'next', date: new Date(year, month + 1, i) });
    }

    const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

    return (
        <div className="h-full flex flex-col">
            <div className="grid grid-cols-7 mb-1">
                {weekDays.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-1">
                {days.map((d, idx) => {
                    const dateStr = toLocalDateString(d.date);
                    const dayTasks = tasks.filter(t => isTaskOnDate(t, dateStr));
                    const isToday = toLocalDateString(new Date()) === dateStr;

                    return (
                        <div
                            key={idx}
                            onClick={() => onDayClick(d.date)}
                            className={`rounded-xl p-1 md:p-1.5 flex flex-col items-center cursor-pointer transition-all duration-200 relative min-h-[70px] border border-transparent
                                ${d.type === 'current' ? 'hover:bg-white hover:shadow-md hover:border-slate-100 hover:-translate-y-0.5 z-10' : 'opacity-40 hover:opacity-70'}
                                ${isToday ? 'bg-indigo-50/50' : ''}
                            `}
                        >
                            <span className={`text-xs w-7 h-7 flex items-center justify-center rounded-full font-medium transition-all ${isToday
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300 ring-2 ring-indigo-50'
                                : 'text-slate-600'
                                }`}>
                                {d.day}
                            </span>

                            {/* Task Indicators */}
                            <div className="flex flex-col gap-1 mt-1.5 w-full overflow-hidden px-0.5">
                                {dayTasks.slice(0, 4).map((t: any) => (
                                    <div
                                        key={t.id}
                                        className="text-[9px] px-1.5 py-0.5 rounded-md truncate text-white leading-tight font-medium shadow-sm transition-transform hover:scale-[1.02]"
                                        style={{ backgroundColor: t.color || t.assignees[0]?.color || '#94a3b8' }}
                                        title={t.title}
                                    >
                                        {t.title}
                                    </div>
                                ))}
                                {dayTasks.length > 4 && (
                                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100/80 rounded-md py-0.5 text-center mt-0.5 shadow-sm border border-slate-200/50">
                                        +{dayTasks.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
