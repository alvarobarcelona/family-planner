import { useState } from "react";

interface Household {
    id: string;
    name: string;
}

export function AdminScreen() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [households, setHouseholds] = useState<Household[]>([]);
    const [newHouseholdName, setNewHouseholdName] = useState("");
    const [newHouseholdPassword, setNewHouseholdPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingPassword, setEditingPassword] = useState("");

    const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password) setIsAuthenticated(true);
        fetchHouseholds(password);
    };

    const fetchHouseholds = async (authPassword: string) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/households`, {
                headers: { "x-admin-password": authPassword },
            });
            if (res.ok) {
                const data = await res.json();
                setHouseholds(data);
                setError("");
            } else {
                setIsAuthenticated(false);
                setError("Password incorrecto");
            }
        } catch (err) {
            console.error(err);
            setError("Error de conexión");
        }
    };

    const createHousehold = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/households`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-password": password,
                },
                body: JSON.stringify({
                    name: newHouseholdName,
                    password: newHouseholdPassword,
                }),
            });

            if (res.ok) {
                setMessage("Familia creada correctamente");
                setNewHouseholdName("");
                setNewHouseholdPassword("");
                fetchHouseholds(password);
            } else {
                const data = await res.json();
                setError(data.message || "Error al crear familia");
            }
        } catch (err) {
            setError("Error al crear familia");
        }
    };

    const deleteHousehold = async (id: string) => {
        if (!confirm("¿Seguro que quieres borrar esta familia y TODOS sus datos?"))
            return;

        try {
            const res = await fetch(`${API_URL}/api/admin/households/${id}`, {
                method: "DELETE",
                headers: { "x-admin-password": password },
            });
            if (res.ok) {
                setMessage("Familia eliminada");
                fetchHouseholds(password);
            } else {
                const data = await res.json();
                console.error("Delete error:", data);
                // Muestra el detalle técnico si existe
                setError(
                    data.detail
                        ? `Error: ${data.message} (${data.detail})`
                        : data.message || "Error al borrar"
                );
            }
        } catch (err) {
            setError("Error al borrar (Conexión)");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <form
                    onSubmit={handleLogin}
                    className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm"
                >
                    <h1 className="text-2xl font-bold mb-4 text-center">Admin Access</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Admin Password"
                        className="w-full border p-2 rounded mb-4"
                    />
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-stone-800 text-white p-2 rounded hover:bg-stone-700"
                    >
                        Enter
                    </button>
                </form>
            </div>
        );
    }

    const updatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;

        try {
            const res = await fetch(
                `${API_URL}/api/admin/households/${editingId}/password`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "x-admin-password": password,
                    },
                    body: JSON.stringify({ password: editingPassword }),
                }
            );

            if (res.ok) {
                setMessage("Password actualizado correctamente");
                setEditingId(null);
                setEditingPassword("");
            } else {
                const data = await res.json();
                setError(data.message || "Error al actualizar password");
            }
        } catch (err) {
            setError("Error de conexión");
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-stone-800">
                        Admin Dashboard
                    </h1>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="text-stone-500 hover:text-stone-800"
                    >
                        Logout
                    </button>
                </div>

                {/* Create Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-xl font-semibold mb-4">Nueva Familia</h2>
                    <form onSubmit={createHousehold} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-stone-500 mb-1">
                                NOMBRE
                            </label>
                            <input
                                type="text"
                                value={newHouseholdName}
                                onChange={(e) => setNewHouseholdName(e.target.value)}
                                className="w-full border p-2 rounded"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-stone-500 mb-1">
                                CONTRASEÑA
                            </label>
                            <input
                                type="text"
                                value={newHouseholdPassword}
                                onChange={(e) => setNewHouseholdPassword(e.target.value)}
                                className="w-full border p-2 rounded"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                        >
                            Crear
                        </button>
                    </form>
                    {message && (
                        <p className="text-green-600 mt-4 text-sm bg-green-50 p-2 rounded border border-green-200">
                            {message}
                        </p>
                    )}
                    {error && (
                        <p className="text-red-600 mt-4 text-sm bg-red-50 p-2 rounded border border-red-200">
                            {error}
                        </p>
                    )}
                </div>

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-stone-100 text-stone-500 text-sm">
                            <tr>
                                <th className="p-4">NOMBRE</th>
                                <th className="p-4">ID</th>
                                <th className="p-4 text-right">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {households.map((h) => (
                                <tr key={h.id} className="hover:bg-stone-50">
                                    <td className="p-4 font-medium">{h.name}</td>
                                    <td className="p-4 text-stone-400 font-mono text-xs">
                                        {h.id}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingId(h.id);
                                                setEditingPassword("");
                                                setError("");
                                                setMessage("");
                                            }}
                                            className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                                        >
                                            Cambiar Pass
                                        </button>
                                        <button
                                            onClick={() => deleteHousehold(h.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {households.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-stone-400">
                                        No hay familias registradas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Password Modal */}
            {editingId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">Cambiar Contraseña</h3>
                        <p className="text-sm text-stone-500 mb-4">
                            Introduce la nueva contraseña para esta familia.
                        </p>
                        <form onSubmit={updatePassword}>
                            <input
                                type="text"
                                value={editingPassword}
                                onChange={(e) => setEditingPassword(e.target.value)}
                                className="w-full border p-2 rounded mb-4"
                                placeholder="Nueva contraseña"
                                required

                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
