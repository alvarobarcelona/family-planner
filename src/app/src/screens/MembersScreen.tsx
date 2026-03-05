import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTaskStore } from "../store/useTaskStore";
import { createMember, deleteMember, updateMember, getMembers } from "../api/membersApi";
import { useModal } from "../context/ModalContext";
import { usePushNotifications } from "../hooks/usePushNotifications";

const MEMBER_COLORS = [
    "#f87171", // red
    "#fb923c", // orange
    "#facc15", // yellow
    "#a3e635", // lime
    "#22c55e", // green
    "#2dd4bf", // teal
    "#38bdf8", // sky
    "#60a5fa", // blue
    "#818cf8", // indigo
    "#c084fc", // purple
    "#f472b6", // pink
    "#fb7185", // rose
    "#94a3b8", // slate
];

export function MembersScreen() {
    const { refreshTasks } = useTaskStore(); // We might need to refresh context? Actually better to re-fetch members in local state or push to store
    // Ideally useTaskStore should hold the members. For now let's modify store later to fetch.
    // We will manage local list here for CRUD, and then trigger store refresh.

    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { confirm, alert } = useModal();
    const [isEditing, setIsEditing] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [color, setColor] = useState(MEMBER_COLORS[0]);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");

    const { familyMembers } = useTaskStore();
    const { permission, isSubscribed, subscribeToPush, unsubscribeFromPush, loading } = usePushNotifications();
    const [selectedNotificationMembers, setSelectedNotificationMembers] = useState<string[]>([]);

    // Initialize with all members selected by default or just one, up to preference. Let's start with empty so they choose.
    // Actually, let's default to "Mama" if available, or just empty.
    useEffect(() => {
        if (familyMembers.length > 0 && selectedNotificationMembers.length === 0) {
            // Optional: Default to selecting the first member? Or wait for user.
            // Let's not auto-select to force them to choose.
        }
    }, [familyMembers]);

    const toggleNotificationMember = (id: string) => {
        setSelectedNotificationMembers(prev =>
            prev.includes(id)
                ? prev.filter(m => m !== id)
                : [...prev, id]
        );
    };

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            const data = await getMembers();
            setMembers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            await createMember(name, color);
            setName("");
            setColor(MEMBER_COLORS[0]);
            loadMembers();
            refreshTasks();
            // In a real app we'd update global store too
        } catch (err) {
            alert("Error al crear miembro");
        }
    };

    const handleDelete = async (id: string, memberName: string) => {
        const ok = await confirm(`¿Eliminar a ${memberName}? (Sus tareas asignadas podrían quedar huérfanas)`);
        if (ok) {
            try {
                await deleteMember(id);
                loadMembers();
                refreshTasks();
            } catch (err: any) {
                alert(err.message || "Error al eliminar");
            }
        }
    };

    const startEdit = (m: any) => {
        setIsEditing(m.id);
        setEditName(m.name);
        setEditColor(m.color);
    };

    const handleUpdate = async (id: string) => {
        try {
            await updateMember(id, editName, editColor);
            setIsEditing(null);
            loadMembers();
            refreshTasks();
        } catch (err) {
            alert("Error al actualizar");
        }
    };

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pt-2">
                <Link to="/" className="text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">Gestionar Familia</h1>
            </div>

            <div className="text-[10px] text-gray-400 font-mono">
                Notificaciones: Subscribed={String(isSubscribed)}, Permission={permission}
            </div>

            {!isSubscribed && permission !== 'denied' && (
                <div className="mb-3 bg-indigo-50 border border-indigo-100 rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🔔</span>
                        <p className="text-xs text-indigo-800">
                            Activa notificaciones para uno o varios miembros:
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {familyMembers.map((m) => {
                            const isSelected = selectedNotificationMembers.includes(m.id);
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => toggleNotificationMember(m.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${isSelected
                                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: m.color }}
                                    />
                                    {m.name}
                                    {isSelected && <span>✓</span>}
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => subscribeToPush(selectedNotificationMembers)}
                            disabled={loading || selectedNotificationMembers.length === 0}
                            className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Activando...' : 'Activar Notificaciones'}
                        </button>
                    </div>
                </div>
            )}

            {isSubscribed && (
                <div className="mb-3 bg-green-50 border border-green-100 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">✅</span>
                        <p className="text-xs text-green-800">
                            Notificaciones activadas.
                        </p>
                    </div>
                    <button
                        onClick={() => unsubscribeFromPush()}
                        disabled={loading}
                        className="text-xs bg-white border border-green-200 text-green-700 px-3 py-1.5 rounded-full font-medium shadow-sm active:scale-95 transition-transform disabled:opacity-50 hover:bg-green-50"
                    >
                        {loading ? 'Desactivando...' : 'Desactivar'}
                    </button>
                </div>
            )}

            {/* Create Form */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <h2 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Añadir Miembro</h2>
                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre (ej. Mamá)"
                            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Añadir
                        </button>
                    </div>
                    {/* Color Picker */}
                    <div className="flex flex-wrap gap-2">
                        {MEMBER_COLORS.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-slate-600 scale-110' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-400">Cargando...</div>
                ) : members.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border-dashed border-2 border-slate-200">
                        No hay miembros. ¡Añade uno!
                    </div>
                ) : (
                    members.map(m => (
                        <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                            {isEditing === m.id ? (
                                <div className="flex-1 flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="flex-1 bg-slate-50 border rounded-lg px-3 py-2"
                                        />
                                        <button onClick={() => handleUpdate(m.id)} className="bg-green-500 text-white px-3 py-2 rounded-lg">💾</button>
                                        <button onClick={() => setIsEditing(null)} className="bg-slate-200 text-slate-600 px-3 py-2 rounded-lg">❌</button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {MEMBER_COLORS.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setEditColor(c)}
                                                className={`w-6 h-6 rounded-full border-2 ${editColor === c ? 'border-slate-600' : 'border-transparent'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                                        style={{ backgroundColor: m.color }}
                                    >
                                        {m.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800">{m.name}</h3>
                                        {m.id === 'familia' && <span className="text-xs text-slate-400">(Sistema)</span>}
                                    </div>
                                    <button onClick={() => startEdit(m)} className="p-2 text-slate-400 hover:text-blue-500">
                                        ✏️
                                    </button>
                                    <button onClick={() => handleDelete(m.id, m.name)} className="p-2 text-slate-400 hover:text-red-500">
                                        🗑️
                                    </button>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
