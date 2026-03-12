import { useState, useEffect } from "react";

interface InstallGuideScreenProps {
    onContinue: () => void;
}

export function InstallGuideScreen({ onContinue }: InstallGuideScreenProps) {
    const [os, setOs] = useState<"ios" | "android" | "other">("other");

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setOs("ios");
        } else if (/android/.test(userAgent)) {
            setOs("android");
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden animate-fadeIn">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

            <div className="bg-white max-w-sm w-full rounded-3xl p-8 shadow-xl border border-slate-100 relative z-10 flex flex-col items-center text-center">
                
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center mb-6 shadow-sm border border-indigo-100/50">
                     <span className="text-4xl" role="img" aria-label="app">
                         📱
                     </span>
                </div>

                <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                    Mejor como App
                </h1>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Instala Family Planner en tu dispositivo para tener acceso rápido, notificaciones y una experiencia a pantalla completa.
                </p>

                {/* Instructions based on OS */}
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">
                        Cómo instalarla
                    </h2>

                    {os === "ios" && (
                        <ol className="text-sm text-slate-600 space-y-4">
                            <li className="flex gap-3 items-center">
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center shrink-0 text-xs">1</div>
                                <span>Toca el botón de los 3 puntos, seguidamente <strong className="text-indigo-600 inline-flex items-center mx-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Compartir</strong> en Safari.</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center shrink-0 text-xs">2</div>
                                <span>Selecciona <strong>"Añadir a la pantalla de inicio"</strong> <span className="text-lg">⊕</span>.</span>
                            </li>
                        </ol>
                    )}

                    {os === "android" && (
                        <ol className="text-sm text-slate-600 space-y-4">
                            <li className="flex gap-3 items-center">
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center shrink-0 text-xs">1</div>
                                <span>Toca el menú <strong className="text-indigo-600 inline-flex items-center mx-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg></strong> en Chrome.</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center shrink-0 text-xs">2</div>
                                <span>Selecciona <strong>"Instalar aplicación"</strong> o "Añadir a la pantalla principal".</span>
                            </li>
                        </ol>
                    )}

                    {os === "other" && (
                        <p className="text-sm text-slate-600 text-center">
                            Busca la opción <strong>"Instalar"</strong> o <strong>"Añadir a la pantalla de inicio"</strong> en el menú de tu navegador habitual.
                        </p>
                    )}
                </div>

                <button
                    onClick={onContinue}
                    className="w-full bg-slate-900 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all"
                >
                    Ya la he instalado / Iniciar Sesión
                </button>
            </div>
        </div>
    );
}
