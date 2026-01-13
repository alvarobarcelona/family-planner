import { useState } from "react";
import { useShoppingStore } from "../store/useShoppingStore";
import { useModal } from "../context/ModalContext";

const CATEGORIES = [
    { id: "all", label: "Todos", icon: "🛒" },
    { id: "fruitsVegetables", label: "Frutas y Verduras", icon: "🍎" },
    { id: "meat", label: "Carnes", icon: "🥩" },
    { id: "milk", label: "Lácteos", icon: "🥛" },
    { id: "drinks", label: "Bebidas", icon: "🥤" },
    { id: "sweets", label: "Dulces", icon: "🍬" },
    { id: "cleaning", label: "Limpieza", icon: "🧹" },
    { id: "other", label: "Otros", icon: "📦" },
];

export function ShoppingListScreen() {
    const { items, favorites, addItem: storeAddItem, updateItem, deleteItem, deleteFavorite: storeDeleteFavorite, isLoading } = useShoppingStore();
    const { confirm, alert } = useModal();

    const [inputValue, setInputValue] = useState("");
    const [quantityValue, setQuantityValue] = useState("1");
    const [selectedCategory, setSelectedCategory] = useState("other");
    const [filter, setFilter] = useState("all");
    const [showFavorites, setShowFavorites] = useState(false);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        try {
            await storeAddItem(inputValue, selectedCategory, parseInt(quantityValue) || 1);
            setInputValue("");
            setQuantityValue("1");
        } catch (err) {
            await alert("Error al añadir producto");
        }
    };

    const toggleComplete = (id: number, current: boolean) => {
        updateItem(id, { completed: !current });
    };

    const handleDeleteItem = async (id: number) => {
        const ok = await confirm("¿Borrar elemento?", { title: "Confirmar borrado", confirmText: "Borrar" });
        if (ok) {
            deleteItem(id);
        }
    };

    const filteredItems = items.filter((item) => {
        if (filter === "all") return true;
        return item.category === filter;
    });

    const activeItems = filteredItems.filter((i) => !i.completed);
    const completedItems = filteredItems.filter((i) => i.completed);

    // Frequent suggestion logic: Sort favorites by usage, take top 10, exclude items already in list
    const activeItemNames = new Set(items.filter(i => !i.completed).map(i => i.name.toLowerCase()));
    const suggestedFavorites = favorites
        .filter(f => !activeItemNames.has(f.name.toLowerCase()))
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 15);

    // Share functionality
    const handleShare = async () => {
        const activeItemsToShare = items.filter(i => !i.completed);
        if (activeItemsToShare.length === 0) {
            await alert("No hay productos pendientes para compartir");
            return;
        }

        const textList = "🛒 Lista de la Compra:\n\n" + activeItemsToShare
            .map(item => `- ${item.name}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`)
            .join("\n");

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Lista de la Compra',
                    text: textList,
                });
            } else {
                await navigator.clipboard.writeText(textList);
                await alert("¡Lista copiada al portapapeles!");
            }
        } catch (error) {
            console.error("Error compartiendo:", error);
        }
    };

    const handleDeleteFavorite = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (await confirm("¿Eliminar de favoritos?", { confirmText: "Eliminar" })) {
            storeDeleteFavorite(id);
        }
    };

    if (isLoading && items.length === 0) {
        return <div className="p-4 text-center text-slate-500">Cargando lista...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[#fdfbf7]">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Lista de la Compra</h1>
                    <p className="text-slate-500">Organizador de la compra inteligente</p>
                </div>

                {activeItems.length > 0 && (
                    <button
                        onClick={handleShare}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                        title="Compartir lista pendiente"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Add Item Form */}
            <form onSubmit={handleAddSubmit} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 sticky top-0 z-10">
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="¿Qué necesitas?"
                        className="w-50 bg-slate-50 border-none font-size: small; rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <input
                        type="number"
                        min="1"
                        value={quantityValue}
                        onChange={(e) => setQuantityValue(e.target.value)}
                        placeholder="Cant."
                        className="w-15 bg-slate-50 border-none rounded-xl px-3 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="bg-indigo-600 text-white rounded-xl px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-rows-2 grid-flow-col gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${selectedCategory === cat.id
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </form>

            {/* Quick Actions / Suggestions Toggle */}
            {suggestedFavorites.length > 0 && (
                <div className="mb-4">
                    <button
                        onClick={() => setShowFavorites(!showFavorites)}
                        className="flex items-center gap-2 text-indigo-600 font-medium text-sm hover:text-indigo-800 transition-colors"
                    >
                        <span className="bg-indigo-100 p-1 rounded-full">
                            {showFavorites ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            )}

                        </span>
                        <span>Sugerencias Frecuentes ({suggestedFavorites.length})</span>
                    </button>

                    {showFavorites && (
                        <div className="mt-3 flex flex-wrap gap-2 p-3 bg-indigo-50/50 rounded-xl animate-in slide-in-from-top-2 border border-indigo-100">
                            {suggestedFavorites.map(fav => (
                                <div
                                    key={fav.id}
                                    className="group flex items-center bg-white hover:bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm transition-all active:scale-95 overflow-hidden"
                                >
                                    <button
                                        onClick={() => storeAddItem(fav.name, fav.category, fav.last_quantity || 1)}
                                        className="px-3 py-1.5 text-slate-700 text-sm flex items-center gap-1 hover:text-indigo-700"
                                    >
                                        <span>➕</span>
                                        {fav.name} {(fav.last_quantity || 1) > 1 && <span className="text-indigo-600 bg-indigo-50 rounded-md px-1.5 py-0.5 text-xs font-bold ml-1">x{fav.last_quantity}</span>}
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteFavorite(fav.id, e)}
                                        className="pr-2 pl-1 py-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 h-full border-l border-transparent hover:border-red-100 transition-colors"
                                        title="Eliminar de favoritos"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {/* Filters */}
            <div className="grid grid-rows-2 grid-flow-col gap-2 overflow-x-auto pb-4 no-scrollbar mb-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === cat.id
                            ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                            : "bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        <span className="mr-1.5">{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Lists */}
            <div className="flex-1 overflow-y-auto space-y-6 pb-24">

                {/* Active Items */}
                {activeItems.length > 0 ? (
                    <div className="space-y-3">
                        <div className="text-slate-900 font-semibold text-lg uppercase">Comprar:</div>
                        {activeItems.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 transition-all hover:shadow-md"
                            >
                                <button
                                    onClick={() => toggleComplete(item.id, item.completed)}
                                    className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-transparent hover:border-indigo-500 transition-colors"
                                >
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 scale-0 transition-transform" />
                                </button>

                                <div className="flex-1">

                                    <span className="text-slate-800 font-medium">{item.name} {item.quantity > 1 && <span className="text-indigo-600 bg-indigo-50 rounded-md px-1.5 py-0.5 text-xs font-bold ml-1">x{item.quantity}</span>}</span>
                                    <span className="text-xs text-slate-400 block">{CATEGORIES.find(c => c.id === item.category)?.label}</span>
                                </div>

                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-slate-300 hover:text-red-500 p-2 transition-colors "
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    filter === 'all' && completedItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                <span className="text-4xl">🛒</span>
                            </div>
                            <p className="text-slate-500 font-medium">Tu lista está vacía</p>
                            <p className="text-slate-400 text-sm mt-1">¡Añade productos o selecciona de tus frecuentes!</p>
                        </div>
                    )
                )}

                {/* Completed Items */}
                {completedItems.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">Comprado</h3>
                        <div className="space-y-2 opacity-60">
                            {completedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-slate-50 p-3 rounded-xl border border-transparent flex items-center gap-3"
                                >
                                    <button
                                        onClick={() => toggleComplete(item.id, item.completed)}
                                        className="w-6 h-6 rounded-full border-2 border-indigo-200 bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </button>

                                    <span className="flex-1 text-slate-500 line-through decoration-slate-400 decoration-2">{item.name} {item.quantity > 1 && <span className="text-slate-400 text-xs ml-1">(x{item.quantity})</span>}</span>

                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
