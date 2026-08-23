import { useState, useRef } from "react";
import { useFamilyWallStore } from "../store/useFamilyWallStore";
import { useTaskStore } from "../store/useTaskStore"; // To get family members
import { useModal } from "../context/ModalContext";

const NOTE_COLORS = [
    { bg: "bg-yellow-200", border: "border-yellow-300" },
    { bg: "bg-blue-200", border: "border-blue-300" },
    { bg: "bg-green-200", border: "border-green-300" },
    { bg: "bg-pink-200", border: "border-pink-300" },
    { bg: "bg-purple-200", border: "border-purple-300" },
];

export function FamilyWall() {
    const { notes, addNote, deleteNote, isLoading } = useFamilyWallStore();
    const { familyMembers } = useTaskStore(); // Reuse existing members
    const { confirm, alert } = useModal();

    const [isAdding, setIsAdding] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState("");
    const [selectedColorIdx, setSelectedColorIdx] = useState(0);
    const [selectedAuthorId, setSelectedAuthorId] = useState(familyMembers[0]?.id || 'familia');
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Logic to determine a "valid" current user could be added here, 
    // currently defaults to selection or first member.

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNoteContent.trim() && !attachedImage) return;

        setIsSubmitting(true);
        try {
            await addNote(newNoteContent, selectedAuthorId, NOTE_COLORS[selectedColorIdx].bg, attachedImage || undefined);
            setNewNoteContent("");
            setAttachedImage(null);
            setIsAdding(false);

            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            console.error("Error saving note:", err);
            await alert("Hubo un problema al guardar la nota. Intenta reducir el tamaño de la imagen o prueba de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await confirm("¿Quitar esta nota?", { confirmText: "Quitar" });
        if (ok) deleteNote(id);
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple validation
        if (!file.type.startsWith('image/')) {
            await alert("Por favor selecciona una imagen válida");
            return;
        }

        // Resize image client-side to save space
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Get base64 (compressed jpeg)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setAttachedImage(dataUrl);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-3 px-1">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    📌 Tablón Familiar:
                </h2>


                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="group relative overflow-hidden flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white active:scale-95 transition-transform duration-150"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
                            animation: 'buttonPulse 2.5s ease-in-out infinite',
                        }}
                    >
                        {/* Shimmer always running */}
                        <span
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)',
                                backgroundSize: '250% 100%',
                                animation: 'shimmer 2s linear infinite',
                            }}
                        />
                        {/* Plus icon with bounce */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5 animate-bounce"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span className="relative">Nota</span>
                    </button>
                )}
            </div>
           {/*  <div className="flex justify-between items-center mb-3 px-1">
                <p>{familyMembers.map(m => m.name).join(', ')}</p>
            </div> */}

            {/* Add Note Form */}
            {isAdding && (
                <form onSubmit={handleAdd} className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm mb-4 animate-in slide-in-from-top-2">
                    <textarea
                        rows={3}
                        placeholder="Escribe algo..."
                        className={`w-full p-3 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none ${NOTE_COLORS[selectedColorIdx].bg}`}
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                    />

                    {attachedImage && (
                        <div className="relative mb-3 inline-block">
                            <img src={attachedImage} alt="Preview" className="h-20 rounded-lg border border-slate-200 shadow-sm" />
                            <button
                                type="button"
                                onClick={() => { setAttachedImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center gap-2 flex-wrap">
                        <div className="flex gap-2 items-center">
                            {/* Color Picker */}
                            <div className="flex gap-1">
                                {NOTE_COLORS.map((c, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedColorIdx(idx)}
                                        className={`w-6 h-6 rounded-full border-2 ${c.bg} ${selectedColorIdx === idx ? 'border-slate-500 scale-110' : 'border-transparent hover:scale-105'} transition-all`}
                                    />
                                ))}
                            </div>

                            <div className="w-px h-6 bg-gray-200 mx-1"></div>

                            {/* Camera Button */}
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment" // Prefer rear camera on mobile
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-slate-400 hover:text-indigo-600 p-1 rounded-full hover:bg-slate-50 transition-colors"
                                title="Añadir foto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                </svg>
                            </button>

                            <div className="w-px h-6 bg-gray-200 mx-1"></div>

                            {/* Author Picker */}
                            <select
                                value={selectedAuthorId}
                                onChange={(e) => setSelectedAuthorId(e.target.value)}
                                className="text-xs bg-slate-50 border-none rounded-md py-1 pr-7 pl-2 text-slate-600 focus:ring-0 cursor-pointer"
                            >
                                {familyMembers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={() => { setIsAdding(false); setAttachedImage(null); }}
                            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={(!newNoteContent.trim() && !attachedImage) || isSubmitting}
                            className="text-xs bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? 'Guardando...' : 'Pegar Nota'}
                        </button>
                    </div>
                </form>
            )}

            {/* Notes Grid */}
            {isLoading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : notes.length === 0 ? (
                <div
                    onClick={() => setIsAdding(true)}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm cursor-pointer hover:border-indigo-200 hover:text-indigo-400 transition-colors"
                >
                    El tablón está vacío. ¡Deja la primera nota! 📝
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className={`relative group p-3 rounded-lg shadow-sm min-h-[100px] flex flex-col transition-all hover:scale-[1.02] hover:shadow-md ${note.color} ${note.color === 'bg-yellow-200' ? 'text-yellow-900' : 'text-slate-800'}`}
                            style={{ transform: `rotate(${note.rotation}deg)` }}
                        >
                            {/* Pin Effect */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }}>
                                <svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        {/* Sphere gradient - gives 3D ball effect */}
                                        <radialGradient id="pinHead" cx="38%" cy="35%" r="60%">
                                            <stop offset="0%" stopColor="#ff8a80" />
                                            <stop offset="40%" stopColor="#e53935" />
                                            <stop offset="100%" stopColor="#7f0000" />
                                        </radialGradient>
                                        {/* Needle gradient */}
                                        <linearGradient id="pinNeedle" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#9e9e9e" />
                                            <stop offset="50%" stopColor="#eeeeee" />
                                            <stop offset="100%" stopColor="#757575" />
                                        </linearGradient>
                                    </defs>
                                    {/* Needle / tallo */}
                                    <rect x="9.2" y="13" width="1.6" height="13" rx="0.8" fill="url(#pinNeedle)" opacity="0.9" />
                                    {/* Pin head sphere */}
                                    <circle cx="10" cy="10" r="8.5" fill="url(#pinHead)" />
                                    {/* Shine highlight */}
                                    <ellipse cx="7.5" cy="7" rx="2.8" ry="1.8" fill="white" opacity="0.35" transform="rotate(-20 7.5 7)" />
                                </svg>
                            </div>

                            {note.imageUrl && (
                                <div className="mb-2 -mx-1 mt-1 rounded-md overflow-hidden bg-black/5 shadow-inner">
                                    <img src={note.imageUrl} alt="Attached" className="w-full h-auto object-cover max-h-32" />
                                </div>
                            )}

                            <p className="text-sm font-handwriting leading-snug whitespace-pre-line flex-1">
                                {note.content}
                            </p>

                            <div className="mt-2 flex justify-between items-end opacity-60 text-[10px] font-medium uppercase tracking-wide">
                                <span>
                                    {familyMembers.find(m => m.id === note.authorId)?.name || 'Anónimo'}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                                    className=" p-1 text-red"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
