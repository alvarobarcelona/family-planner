import { useState } from "react";
import { login } from "../api/tasksApi";
import { useNavigate } from "react-router-dom";

interface LoginScreenProps {
    onLoginSuccess?: () => void;

}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login(name, password);

            onLoginSuccess?.();
            navigate("/");
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-stone-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-stone-800 mb-2">Bienvenidos a <br /><span className="text-indigo-600">Family Planner</span></h1>
                    <p className="text-stone-500">Introduce tus credenciales para iniciar sesión</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre de Familia"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg mb-4"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                    >
                        {loading ? "Verificando..." : "Entrar"}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-stone-500">Maneja tus tareas, notas y lista de la compra en un solo lugar para toda la familia</p>
                        <p className="text-sm text-green-500">
                            By Alvaro Barcelona Peralta • <a href="/admin" className="hover:text-stone-800 transition-colors">Admin</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
