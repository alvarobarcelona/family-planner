import { useState } from "react";
import { login } from "../api/tasksApi";

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login(name, password);

            onLoginSuccess();
        } catch (err) {
            setError("Contraseña incorrecta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-stone-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-stone-800 mb-2">Bienvenido/a</h1>
                    <p className="text-stone-500">Introduce la contraseña familiar</p>
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
                        <p className="text-sm text-stone-500">
                            By Alvaro Barcelona Peralta • <a href="/admin" className="hover:text-stone-800 transition-colors">Admin</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
