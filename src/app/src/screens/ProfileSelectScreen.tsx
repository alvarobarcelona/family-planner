import { useState, useEffect } from "react";
import { useTaskStore } from "../store/useTaskStore";

interface ProfileSelectScreenProps {
  onSelected: () => void;
}

export function ProfileSelectScreen({ onSelected }: ProfileSelectScreenProps) {
  const { familyMembers, selectMember, isLoading: storeIsLoading, refreshTasks } = useTaskStore();
  const [isSelecting, setIsSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Trigger a load if we mount and have no members yet
  useEffect(() => {
    if (familyMembers.length === 0 && !storeIsLoading) {
      refreshTasks();
    }
  }, [familyMembers.length, storeIsLoading, refreshTasks]);

  const handleSelect = async (memberId: string) => {
    setIsSelecting(memberId);
    setError(null);
    try {
      await selectMember(memberId);
      onSelected();
    } catch (err) {
      console.error("Error seleccionando perfil:", err);
      setError("No se ha podido seleccionar el perfil. Inténtalo de nuevo.");
      setIsSelecting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6">
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm text-center space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">¿Quién eres?</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Selecciona tu perfil para ver tus tareas privadas y personales.
          </p>
        </div>

        {/* Member cards */}
        <div className="grid grid-cols-2 gap-3">
          {storeIsLoading && familyMembers.length === 0 ? (
            <div className="col-span-2 flex justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : familyMembers.length === 0 ? (
            <div className="col-span-2 text-slate-400 py-4 text-sm flex flex-col items-center gap-2">
              <p>No se han encontrado perfiles de familia.</p>
              <p className="text-xs">Pulsa en "Continuar sin seleccionar perfil" y ve a <strong>Ajustes &gt; Miembros</strong> para crearlos.</p>
            </div>
          ) : (
            familyMembers.map((member) => {
              const isLoading = isSelecting === member.id;
              const initial = member.name.charAt(0).toUpperCase();

              return (
                <button
                  key={member.id}
                  id={`profile-select-${member.id}`}
                  onClick={() => handleSelect(member.id)}
                  disabled={isSelecting !== null}
                  className={`
                    group relative flex flex-col items-center gap-3 p-5 rounded-2xl border
                    transition-all duration-300
                    ${isLoading
                      ? "border-white/40 bg-white/10 scale-95"
                      : "border-white/10 bg-white/5 hover:bg-white/15 hover:border-white/30 hover:scale-105 active:scale-95"
                    }
                    backdrop-blur-sm shadow-xl
                    disabled:opacity-60 disabled:cursor-not-allowed
                  `}
                >
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: member.color || "#6366f1" }}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : initial}
                  </div>

                  {/* Name */}
                  <span className="text-sm font-semibold text-white/90 text-center leading-tight">
                    {member.name}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Skip option */}
        <button
          id="profile-select-skip"
          onClick={onSelected}
          disabled={isSelecting !== null}
          className="text-xs text-slate-500 hover:text-slate-400 transition-colors py-2 disabled:opacity-50"
        >
          Continuar sin seleccionar perfil →
        </button>
      </div>
    </div>
  );
}
