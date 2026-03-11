import { useNavigate } from "react-router-dom";

export function InfoScreen() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 items-center -mx-4 -mt-4 p-4 pb-24">
            {/* Header Sticky */}
            <header className="sticky top-0 w-full max-w-2xl bg-slate-50/90 backdrop-blur-md z-10 py-4 flex items-center mb-4 border-b border-slate-200">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex items-center justify-center shrink-0"
                    aria-label="Volver"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold ml-2 text-slate-800 tracking-tight">Cómo funciona</h1>
            </header>

            <main className="w-full max-w-2xl space-y-6">
                
                {/* Intro Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-3">
                    <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center animate-pulse">
                         <span className="text-4xl" role="img" aria-label="family">
                             👨‍👩‍👧‍👦
                         </span>
                    </div>
                    <h2 className="text-2xl font-black text-indigo-900 leading-tight">
                        Family Planner
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        Tu organizador familiar diseñado para mantener a todos en sintonía. Descubre todo lo que puedes hacer:
                    </p>
                </div>

                {/* Features List */}
                <div className="space-y-4">
                    
                    {/* Home / Hoy */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex gap-4 items-start hover:shadow-md transition-shadow">
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1 tracking-tight">Pantalla Principal (Hoy)</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Ve de un vistazo rápido lo que toca hacer <span className="font-semibold text-slate-700">hoy</span> y <span className="font-semibold text-slate-700">mañana</span>. También puedes ver los mensajes y notas del <strong>Muro Familiar</strong>, ideal para dejar recados a otros miembros de la casa.
                            </p>
                        </div>
                    </div>

                    {/* Agenda */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex gap-4 items-start hover:shadow-md transition-shadow">
                        <div className="bg-teal-50 text-teal-600 p-3 rounded-2xl shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 17.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1 tracking-tight">Lista de Agenda</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Un listado vertical y continuo con todas tus tareas futuras agrupadas por día. Usa el <strong>buscador superior</strong> para encontrar rápidamente cualquier evento o nota pasada o futura.
                            </p>
                        </div>
                    </div>

                    {/* Calendario Visual */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex gap-4 items-start hover:shadow-md transition-shadow">
                        <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl shrink-0">
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0h18M5.25 20.25h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1 tracking-tight">Calendario</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Toca para cambiar entre vistas de <strong>Semana</strong>, <strong>Mes</strong> o <strong>Agenda del Año</strong>. Pulsa sobre cualquier día en la vista mensual para saltar directamente a los detalles de esa semana.
                            </p>
                        </div>
                    </div>

                    {/* Compras */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex gap-4 items-start hover:shadow-md transition-shadow">
                        <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1 tracking-tight">Lista de la Compra</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Clasifica los productos por categorías (Supermercado, Farmacia, Ferretería...). Lo que marques como comprado no se borra, pasa al fondo para que lo tengas siempre accesible en el grupo de "Completados".
                            </p>
                        </div>
                    </div>

                    {/* Crear y Editar */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex gap-4 items-start hover:shadow-md transition-shadow">
                        <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                               <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1 tracking-tight">Eventos y Tareas (Botón Central)</h3>
                            <ul className="text-sm text-slate-500 leading-relaxed list-disc list-inside space-y-1">
                                <li><strong>Colores rápidos:</strong> Selecciona de quién es la tarea y la tarjeta tomará automáticamente su color.</li>
                                <li><strong>Notificaciones:</strong> Configura un recordatorio para recibir un "Push" en tu móvil (ej: 1 hora antes).</li>
                                <li><strong>Recurrencia:</strong> Puedes crear eventos que se repitan diariamente, cada cierto número de semanas, o en días concretos de la semana (ej: Lunes y Miércoles).</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
