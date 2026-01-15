import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { fetchNotes, createNote, deleteNoteApi, updateNoteApi } from "../api/familyWallApi";

export interface Note {
    id: string;
    content: string;
    imageUrl?: string;
    color: string;
    authorId: string;
    createdAt: number;
    rotation: number;
}

interface FamilyWallContextValue {
    notes: Note[];
    isLoading: boolean;
    error: string | null;
    addNote: (content: string, authorId: string, color: string, imageUrl?: string) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    updateNote: (id: string, newContent: string) => Promise<void>;
}

const FamilyWallContext = createContext<FamilyWallContextValue | undefined>(undefined);

export function FamilyWallProvider({ children }: { children: ReactNode }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial fetch
    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        setIsLoading(true);
        try {
            const data = await fetchNotes();
            setNotes(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load notes");
        } finally {
            setIsLoading(false);
        }
    };

    const addNote = async (content: string, authorId: string, color: string, imageUrl?: string) => {
        const rotation = Math.random() * 6 - 3;
        try {
            const savedNote = await createNote({
                content,
                authorId,
                color,
                rotation,
                imageUrl
            });
            setNotes((prev) => [savedNote, ...prev]);
        } catch (err) {
            console.error(err);
            // Optionally handle error
        }
    };

    const deleteNote = async (id: string) => {
        // Optimistic update
        const previousNotes = notes;
        setNotes((prev) => prev.filter((n) => n.id !== id));

        try {
            await deleteNoteApi(id);
        } catch (err) {
            console.error(err);
            setNotes(previousNotes); // Revert
        }
    };

    const updateNote = async (id: string, newContent: string) => {
        const previousNotes = notes;
        setNotes((prev) =>
            prev.map((n) => (n.id === id ? { ...n, content: newContent } : n))
        );

        try {
            await updateNoteApi(id, newContent);
        } catch (err) {
            console.error(err);
            setNotes(previousNotes);
        }
    };

    return (
        <FamilyWallContext.Provider value={{ notes, isLoading, error, addNote, deleteNote, updateNote }}>
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
