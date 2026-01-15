import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";

export interface Note {
    id: string;
    content: string;
    imageUrl?: string; // Base64 string for the image
    color: string; // Tailwind bg class or hex
    authorId: string; // 'mama', 'papa', etc.
    createdAt: number;
    rotation: number; // Random rotation between -3 and 3 degrees for realism
}

interface FamilyWallContextValue {
    notes: Note[];
    addNote: (content: string, authorId: string, color: string, imageUrl?: string) => void;
    deleteNote: (id: string) => void;
    updateNote: (id: string, newContent: string) => void;
}

const FamilyWallContext = createContext<FamilyWallContextValue | undefined>(undefined);

const STORAGE_KEY = "family-wall-notes";

export function FamilyWallProvider({ children }: { children: ReactNode }) {
    const [notes, setNotes] = useState<Note[]>(() => {
        // Lazy initial state
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error("Failed to parse family wall notes", e);
        }
        // Default welcome note
        return [
            {
                id: 'welcome-note',
                content: '¡Bienvenidos al Muro Familiar! 📌 Aquí podéis dejar notas rápidas.',
                color: 'bg-yellow-200',
                authorId: 'familia',
                createdAt: Date.now(),
                rotation: -2
            }
        ];
    });

    // Persist to localStorage whenever notes change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }, [notes]);

    const addNote = (content: string, authorId: string, color: string, imageUrl?: string) => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            content,
            imageUrl,
            authorId,
            color,
            createdAt: Date.now(),
            rotation: Math.random() * 6 - 3, // Random between -3 and 3
        };
        setNotes((prev) => [newNote, ...prev]);
    };

    const deleteNote = (id: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
    };

    const updateNote = (id: string, newContent: string) => {
        setNotes((prev) =>
            prev.map((n) => (n.id === id ? { ...n, content: newContent } : n))
        );
    };

    return (
        <FamilyWallContext.Provider value={{ notes, addNote, deleteNote, updateNote }}>
            {children}
        </FamilyWallContext.Provider>
    );
}

export function useFamilyWallStore() {
    const ctx = useContext(FamilyWallContext);
    if (!ctx) {
        throw new Error("useFamilyWallStore must be used within a FamilyWallProvider");
    }
    return ctx;
}
