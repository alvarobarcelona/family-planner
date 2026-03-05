import { useState } from "react";
import { useShoppingStore } from "../store/useShoppingStore";
import { useModal } from "../context/ModalContext";
import { PullToRefresh } from "../components/PullToRefresh";

const CATEGORIES = [
    { id: "all", label: "Todos", icon: "🛒" },
    { id: "fruitsVegetables", label: "Frutas y Verduras", icon: "🍎" },
    { id: "meat", label: "Carnes", icon: "🥩" },
    { id: "fish", label: "Pescado", icon: "🐟" },
    { id: "milk", label: "Lácteos y Huevos", icon: "🥚" },
    { id: "bread", label: "Pan y Repostería", icon: "🥐" },
    { id: "pasta/rice", label: "Pasta y Arroz", icon: "🍝" },
    { id: "snacks", label: "Snacks", icon: "🍪" },
    { id: "drinks", label: "Bebidas", icon: "🥤" },
    { id: "sweets", label: "Dulces", icon: "🍬" },
    { id: "frozen", label: "Congelados", icon: "🧊" },
    { id: "cleaning", label: "Limpieza", icon: "🧹" },
    { id: "hygiene", label: "Higiene Personal", icon: "🧴" },
    { id: "pets", label: "Mascotas", icon: "�" },
    { id: "pharmacy", label: "Parafarmacia", icon: "💊" },
    { id: "other", label: "Otros", icon: "📦" },
];

export function ShoppingListScreen() {
    return (
        <>
            <ShoppingListScreenContent />
        </>
    );
}

function ShoppingListScreenContent() {
    const { items, favorites, addItem: storeAddItem, updateItem, deleteItem, deleteFavorite: storeDeleteFavorite, deleteCompletedItems, isLoading, refresh } = useShoppingStore();
    const { confirm, alert } = useModal();

    const [inputValue, setInputValue] = useState("");
    const [notesValue, setNotesValue] = useState("");
    const [quantityValue, setQuantityValue] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("other");
    const [filter, setFilter] = useState("all");
    const [showFiltersDialog, setShowFiltersDialog] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const [animatingItemId, setAnimatingItemId] = useState<number | null>(null);
    const [showGlobalCheck, setShowGlobalCheck] = useState(false);
    const [isSmartSort, setIsSmartSort] = useState(false);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        try {
            await storeAddItem(inputValue, selectedCategory, quantityValue, notesValue.trim() || undefined);
            setInputValue("");
            setNotesValue("");
            setQuantityValue(1);
        } catch (err) {
            await alert("Error al añadir producto");
        }
    };

    const incrementQuantity = () => setQuantityValue(prev => prev + 1);
    const decrementQuantity = () => setQuantityValue(prev => Math.max(1, prev - 1));

    const toggleComplete = (id: number, current: boolean) => {
        updateItem(id, { completed: !current });
    };

    const handleDeleteItem = async (id: number) => {
        const ok = await confirm("¿Borrar elemento?", { title: "Confirmar borrado", confirmText: "Borrar" });
        if (ok) {
            deleteItem(id);
        }
    };

    const handleDeleteCompleted = async () => {
        const ok = await confirm("¿Borrar todos los elementos comprados?", { title: "Limpiar lista", confirmText: "Borrar todos" });
        if (ok) {
            await deleteCompletedItems();
        }
    };

    const filteredItems = items.filter((item) => {
        if (filter === "all") return true;
        return item.category === filter;
    });

    const activeItems = filteredItems.filter((i) => !i.completed);
    const completedItems = filteredItems.filter((i) => i.completed);
    const CountItems = activeItems.length;

    // Frequent suggestion logic: Sort favorites by usage, take top 10, exclude items already in list
    const activeItemNames = new Set(items.filter(i => !i.completed).map(i => i.name.toLowerCase()));
    const suggestedFavorites = favorites
        .filter(f => !activeItemNames.has(f.name.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

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
        <>
            <PullToRefresh onRefresh={refresh}>
                <div className="flex flex-col min-h-full">

                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Lista de la Compra</h1>
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
                    <form onSubmit={handleAddSubmit} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 relative">
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="¿Qué necesitas?"
                                className="w-full bg-slate-50 border-none font-size: small; rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            <div className="flex items-center bg-slate-50 rounded-xl px-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={decrementQuantity}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 transition-colors shadow-sm active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
                                </button>
                                <span className="w-7 text-center font-bold text-slate-700">{quantityValue}</span>
                                <button
                                    type="button"
                                    onClick={incrementQuantity}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 transition-colors shadow-sm active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                </button>
                            </div>
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

                        <div className="mb-3 px-1">
                            <input
                                type="text"
                                value={notesValue}
                                onChange={(e) => setNotesValue(e.target.value)}
                                placeholder="Añadir nota (opcional, ej. Desnatada marca Pascual)"
                                className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-300 text-sm text-slate-600 px-2 py-1 outline-none transition-colors placeholder:text-slate-400"
                            />
                        </div>

                        {/* Auto-suggest dropdown relative to input */}
                        {inputValue.trim().length > 1 && (
                            <div className="w-full bg-white rounded-xl shadow-md border border-indigo-100 mb-4 overflow-hidden divide-y divide-slate-50">
                                {(() => {
                                    const suggestions = favorites
                                        .filter(f => !activeItemNames.has(f.name.toLowerCase()))
                                        .filter(f => f.name.toLowerCase().includes(inputValue.toLowerCase()))
                                        .slice(0, 4);

                                    if (suggestions.length === 0) return null;

                                    return suggestions.map(fav => (
                                        <button
                                            key={fav.id}
                                            type="button"
                                            onClick={() => {
                                                setInputValue(fav.name);
                                                setSelectedCategory(fav.category || "other");
                                                setQuantityValue(fav.last_quantity || 1);
                                                // auto submit is optional, right now it just populates the input
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{CATEGORIES.find(c => c.id === fav.category)?.icon || "📦"}</span>
                                                <span className="text-slate-700 font-medium group-hover:text-indigo-700">{fav.name}</span>
                                            </div>
                                            <span className="text-xs text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                Rellenar
                                            </span>
                                        </button>
                                    ));
                                })()}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 pb-1">
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

                    {/* Filters Row */}
                    <div className="flex items-center gap-2 mb-4 pb-2">
                        <button
                            onClick={() => setShowFiltersDialog(!showFiltersDialog)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${filter !== 'all' || showFiltersDialog ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                            </svg>
                            {filter === 'all' ? 'Filtrar por categoría' : CATEGORIES.find(c => c.id === filter)?.label}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 transition-transform ${showFiltersDialog ? 'rotate-180' : ''}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                        {filter !== 'all' && (
                            <button
                                onClick={() => setFilter('all')}
                                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>

                    {/* Filter Options */}
                    {showFiltersDialog && (
                        <div className="flex flex-wrap gap-2 pb-4 mb-2 animate-fade-in-down">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setFilter(cat.id);
                                        setShowFiltersDialog(false); // Close on select mostly requested by users for rapid UX
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === cat.id
                                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
                                        }`}
                                >
                                    <span className="mr-1.5">{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Lists */}

                    <div className="space-y-6 pb-24">

                        {/* Active Items */}
                        {activeItems.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <div className="text-slate-900 font-semibold text-lg uppercase">Comprar: {CountItems} articulos</div>
                                    <button
                                        onClick={() => setIsSmartSort(!isSmartSort)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${isSmartSort ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                        </svg>
                                        Agrupar Pasillos
                                    </button>
                                </div>

                                {(() => {
                                    let displayGroups: { categoryId: string; items: typeof activeItems }[] = [];

                                    if (isSmartSort) {
                                        const grouped = activeItems.reduce((acc, item) => {
                                            if (!acc[item.category]) acc[item.category] = [];
                                            acc[item.category].push(item);
                                            return acc;
                                        }, {} as Record<string, typeof activeItems>);

                                        displayGroups = Object.entries(grouped).map(([categoryId, items]) => ({ categoryId, items }));
                                    } else {
                                        displayGroups = [{ categoryId: 'none', items: activeItems }];
                                    }

                                    return displayGroups.map((group) => (
                                        <div key={group.categoryId} className="space-y-2">
                                            {isSmartSort && group.items.length > 0 && (
                                                <div className="flex items-center gap-2 mb-2 mt-4 pl-1">
                                                    <span className="text-xl">{CATEGORIES.find(c => c.id === group.categoryId)?.icon}</span>
                                                    <h3 className="font-semibold text-sm text-slate-700">{CATEGORIES.find(c => c.id === group.categoryId)?.label}</h3>
                                                    <div className="flex-1 h-px bg-slate-100 ml-2"></div>
                                                </div>
                                            )}

                                            {group.items.map((item) => {
                                                const isAnimating = animatingItemId === item.id;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`group bg-white p-2.5 rounded-xl border flex items-center gap-3 transition-colors duration-300
                                                    ${isAnimating ? "border-indigo-400 shadow-md animate-pop opacity-80" : "border-slate-100 shadow-sm hover:shadow-md"}`}
                                                    >
                                                        <div className="relative shrink-0">
                                                            <button
                                                                onClick={() => {
                                                                    if (isAnimating) return;
                                                                    setAnimatingItemId(item.id);
                                                                    setShowGlobalCheck(true);
                                                                    setTimeout(() => {
                                                                        toggleComplete(item.id, item.completed);
                                                                        setAnimatingItemId(null);
                                                                        setShowGlobalCheck(false);
                                                                    }, 850);
                                                                }}
                                                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all bg-white z-10 relative
                                                            ${isAnimating ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400"}
                                                        `}
                                                            >
                                                                <div className={`w-3 h-3 rounded-full bg-indigo-600 transition-transform ${isAnimating ? "scale-100" : "scale-0"}`} />
                                                            </button>
                                                            {isAnimating && (
                                                                <div className="absolute inset-0 rounded-full animate-burst bg-indigo-400 pointer-events-none mt-0.5" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-slate-800 font-medium truncate block">
                                                                <span className={isAnimating ? "animate-strikethrough text-slate-400 transition-colors duration-300" : ""}>{item.name}</span>
                                                            </span>
                                                            <div className="flex flex-col gap-0.5">
                                                                {!isSmartSort && <span className="text-xs text-slate-400 truncate block">{CATEGORIES.find(c => c.id === item.category)?.label}</span>}
                                                                {item.notes && <span className="text-xs text-indigo-500 italic truncate block w-full">💭 {item.notes}</span>}
                                                            </div>
                                                        </div>

                                                        {/* Quantity Editor InSitu */}
                                                        <div className="flex items-center bg-slate-50/80 rounded-lg p-0.5 border border-slate-100 shrink-0">
                                                            <button
                                                                onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                                                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
                                                            </button>
                                                            <span className="w-6 text-center text-sm font-semibold text-indigo-900">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                                                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                                            </button>
                                                        </div>

                                                        <button
                                                            onClick={() => handleDeleteItem(item.id)}
                                                            className="text-slate-300 hover:text-red-500 p-2 transition-colors shrink-0"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ));
                                })()}
                            </div>
                        ) : (
                            completedItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                                        <span className="text-4xl animate-cart-bounce inline-block">🛒</span>
                                    </div>
                                    <p className="text-slate-500 font-medium">Tu lista está vacía</p>
                                    <p className="text-slate-400 text-sm mt-1">¡Añade productos o selecciona de tus frecuentes!</p>
                                </div>
                            ) : filter !== 'all' ? (
                                <div className="py-8 text-center opacity-60 bg-white rounded-xl border border-slate-100 border-dashed">
                                    <p className="text-slate-400 text-sm">No hay productos pendientes en la categoría seleccionada.</p>
                                </div>
                            ) : null
                        )}

                        {/* Completed Items */}
                        {completedItems.length > 0 && (
                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-3 px-1">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Comprado</h3>
                                    <button
                                        onClick={handleDeleteCompleted}
                                        className="text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                        Borrar todos
                                    </button>
                                </div>
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
            </PullToRefresh>

            {/* Global Success Checkmark Animation overlay */}
            {
                showGlobalCheck && (
                    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
                        <div className="bg-emerald-500 text-white rounded-full p-6 shadow-[0_10px_40px_rgba(16,185,129,0.4)] animate-global-check">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-16 h-16">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                    </div>
                )
            }
        </>
    );
}
