import { useState, useMemo } from "react";
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

export function VisualCalendarScreen() {
    const navigate = useNavigate();
    const { tasks, familyMembers } = useTaskStore();

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>("month");
    const [selectedAssigneeId, setSelectedAssigneeId] = useState<FilterAssigneeId>("all");

    // Filter Tasks
    const filteredTasks = useMemo(() => {
        if (selectedAssigneeId === "all") return tasks;
        return tasks.filter((task) =>
            task.assignees.some((a) => a.id === selectedAssigneeId)
        );
    }, [tasks, selectedAssigneeId]);

    // Navigation Handlers
    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (viewMode === "week") newDate.setDate(newDate.getDate() - 7);
        if (viewMode === "month") newDate.setMonth(newDate.getMonth() - 1);
        if (viewMode === "year") newDate.setFullYear(newDate.getFullYear() - 1);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === "week") newDate.setDate(newDate.getDate() + 7);
        if (viewMode === "month") newDate.setMonth(newDate.getMonth() + 1);
        if (viewMode === "year") newDate.setFullYear(newDate.getFullYear() + 1);
        setCurrentDate(newDate);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    // Title Helper
    const getTitle = () => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
        if (viewMode === "year") return currentDate.getFullYear().toString();
        if (viewMode === "week") {
            // Simple week range logic could go here, for now just Month Year of start date
            return `Semana de ${currentDate.toLocaleDateString("es-ES", { month: 'short', day: 'numeric' })}`;
        }
        return currentDate.toLocaleDateString("es-ES", options);
    };

    return (
        <div className="space-y-3 h-full flex flex-col">
            {/* Header */}
            <header className="mt-1 mb-2 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold capitalize">{getTitle()}</h1>
                    <div className="flex gap-1">
                        <button onClick={handlePrev} className="p-1 rounded hover:bg-gray-100">◀️</button>
                        <button onClick={handleToday} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Hoy</button>
                        <button onClick={handleNext} className="p-1 rounded hover:bg-gray-100">▶️</button>
                    </div>
                </div>

                {/* View Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-lg self-start">
                    {(["week", "month", "year"] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3 py-1 text-xs rounded-md capitalize transition-all ${viewMode === mode ? "bg-white shadow-sm font-medium text-slate-900" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {mode === "week" ? "Semana" : mode === "month" ? "Mes" : "Año"}
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
            <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-2 min-h-[300px] flex flex-col overflow-hidden">
                {viewMode === "week" && (
                    <WeekView
                        currentDate={currentDate}
                        tasks={filteredTasks}
                        onTaskClick={(id) => navigate(`/edit/${id}`)}
                    />
                )}

                {viewMode === "month" && (
                    <MonthView
                        currentDate={currentDate}
                        tasks={filteredTasks}
                        onDayClick={(date) => {
                            setCurrentDate(date);
                            setViewMode("week");
                        }}
                    />
                )}

                {viewMode === "year" && (
                    <YearView
                        currentDate={currentDate}
                        tasks={filteredTasks}
                        onMonthClick={(date) => {
                            setCurrentDate(date);
                            setViewMode("month");
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function WeekView({ currentDate, tasks, onTaskClick }: { currentDate: Date, tasks: any[], onTaskClick: (id: string) => void }) {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        weekDays.push(d);
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
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
            <div className="flex-1 grid grid-cols-7 gap-1 overflow-y-auto">
                {weekDays.map(d => {
                    const dateStr = toLocalDateString(d);
                    const dayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => (a.timeLabel || "").localeCompare(b.timeLabel || ""));

                    return (
                        <div key={dateStr} className="flex flex-col gap-1 min-h-[100px] border-r last:border-r-0 border-gray-100 px-0.5 pt-1">
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
    );
}

function YearView({ currentDate, tasks, onMonthClick }: { currentDate: Date, tasks: any[], onMonthClick: (d: Date) => void }) {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
        <div className="h-full overflow-y-auto grid grid-cols-3 gap-2 p-1">
            {months.map(month => {
                const date = new Date(year, month, 1);
                const monthName = date.toLocaleDateString("es-ES", { month: 'short' });

                // Simple check for tasks in this month
                // Ideally we render a mini grid, but for space we can just show a heat dot or count?
                // Let's try a mini grid (7x6) very small

                return (
                    <div
                        key={month}
                        onClick={() => onMonthClick(date)}
                        className="border rounded p-1 hover:border-slate-400 cursor-pointer flex flex-col gap-1"
                    >
                        <h3 className="text-xs font-bold capitalize text-center">{monthName}</h3>
                        <MiniMonthGrid year={year} month={month} tasks={tasks} />
                    </div>
                );
            })}
        </div>
    );
}

function MiniMonthGrid({ year, month, tasks }: { year: number, month: number, tasks: any[] }) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7;
    const daysInMonth = lastDay.getDate();

    // We need 42 cells for consistent grid
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);
    while (cells.length < 42) cells.push(null);

    return (
        <div className="grid grid-cols-7 gap-[1px]">
            {cells.map((day, idx) => {
                if (!day) return <div key={idx} className="w-full pt-[100%]" />;

                const dateStr = toLocalDateString(new Date(year, month, day));
                const hasTask = tasks.some(t => t.date === dateStr);

                return (
                    <div key={idx} className="w-full pt-[100%] relative">
                        <div className={`absolute inset-0 flex items-center justify-center text-[6px] rounded-full
                            ${hasTask ? 'bg-slate-200 font-bold text-slate-900' : 'text-gray-300'}
                        `}>
                            {day}
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

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
                    const dayTasks = tasks.filter(t => t.date === dateStr);
                    const isToday = toLocalDateString(new Date()) === dateStr;

                    return (
                        <div
                            key={idx}
                            onClick={() => onDayClick(d.date)}
                            className={`rounded-2xl p-1 flex flex-col items-center cursor-pointer transition-all relative min-h-[60px]
                                ${d.type === 'current' ? 'hover:bg-white hover:shadow-sm' : 'opacity-30'}
                                ${isToday ? 'bg-indigo-50 text-indigo-700 font-bold' : ''}
                            `}
                        >
                            <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600'}`}>{d.day}</span>

                            {/* Task Indicators */}
                            <div className="flex flex-wrap justify-center gap-0.5 mt-1 w-full">
                                {dayTasks.slice(0, 4).map((t: any) => (
                                    <div
                                        key={t.id}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: t.color || t.assignees[0]?.color || '#ccc' }}
                                    />
                                ))}
                                {dayTasks.length > 4 && <span className="text-[8px] leading-none">+</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
