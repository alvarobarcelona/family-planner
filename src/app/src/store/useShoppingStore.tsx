import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import * as api from "../api/shoppingApi";

interface ShoppingContextValue {
    items: api.ShoppingItem[];
    favorites: api.FavoriteItem[];
    isLoading: boolean;
    error: string | null;
    addItem: (name: string, category: string, quantity?: number) => Promise<void>;
    updateItem: (id: number, payload: api.UpdateItemDto) => Promise<void>;
    deleteItem: (id: number) => Promise<void>;
    deleteFavorite: (id: number) => Promise<void>;
    refresh: () => Promise<void>;
}

const ShoppingContext = createContext<ShoppingContextValue | undefined>(undefined);

export function ShoppingProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<api.ShoppingItem[]>([]);
    const [favorites, setFavorites] = useState<api.FavoriteItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [fetchedItems, fetchedFavorites] = await Promise.all([
                api.getShoppingItems(),
                api.getFavorites(),
            ]);
            setItems(fetchedItems);
            setFavorites(fetchedFavorites);
        } catch (err) {
            console.error(err);
            setError("Error cargando la lista de la compra");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const addItem = async (name: string, category: string, quantity = 1) => {
        try {
            const newItem = await api.addShoppingItem({ name, category, quantity });
            setItems((prev) => [newItem, ...prev]);
            // Refresh favorites as usage count might have changed or new favorite added
            const updatedFavorites = await api.getFavorites();
            setFavorites(updatedFavorites);
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const updateItem = async (id: number, payload: api.UpdateItemDto) => {
        try {
            const updated = await api.updateShoppingItem(id, payload);
            setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deleteItem = async (id: number) => {
        try {
            await api.deleteShoppingItem(id);
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deleteFavorite = async (id: number) => {
        try {
            await api.deleteFavorite(id);
            setFavorites((prev) => prev.filter((fav) => fav.id !== id));
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return (
        <ShoppingContext.Provider
            value={{
                items,
                favorites,
                isLoading,
                error,
                addItem,
                updateItem,
                deleteItem,
                deleteFavorite,
                refresh: loadData,
            }}
        >
            {children}
        </ShoppingContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useShoppingStore(): ShoppingContextValue {
    const ctx = useContext(ShoppingContext);
    if (!ctx) throw new Error("useShoppingStore must be used within ShoppingProvider");
    return ctx;
}
