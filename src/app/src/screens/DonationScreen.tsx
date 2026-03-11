import { useState } from "react";
import { buildUrl } from "../api/tasksApi";

interface DonationScreenProps {
  onDismiss: () => void;
}

export function DonationScreen({ onDismiss }: DonationScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDismiss = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(buildUrl("/api/household/donation-prompt"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Error setting donation prompt status:", err);
    } finally {
      setIsLoading(false);
      onDismiss();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl relative overflow-hidden animate-slideUp">
        {/* Background Decorative Element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-60"></div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center animate-bounce duration-1000 shadow-inner">
             <span className="text-4xl" role="img" aria-label="gift">
               🎁
             </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              ¡Hola Familia! 👋
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Family Planner se mantiene gracias a vuestro apoyo. Una pequeña contribución nos ayuda a mantener viva la aplicación, pagar los servidores y seguir mejorando.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 w-full p-4 rounded-2xl flex flex-col items-center gap-2">
             <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Apoya con un Bizum
             </span>
             <div className="flex items-center gap-2">
               <span className="text-3xl font-black text-slate-800 tracking-wider">
                 630 437 634
               </span>
             </div>
             <p className="text-xs text-indigo-600 font-medium">
               Solo <span className="font-bold">5€</span> por familia al mes ❤️
             </p>
          </div>

          <button
            onClick={handleDismiss}
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-medium py-3.5 px-4 rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Siguiente mes / Ya lo hice"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
