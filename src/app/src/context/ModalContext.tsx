import { createContext, useContext, useState, useCallback, ReactNode, useRef } from "react";
import { Modal } from "../components/Modal";

interface ModalOptions {
    title?: string;
    confirmText?: string;
    cancelText?: string;
}

interface ModalContextValue {
    alert: (message: string, options?: ModalOptions) => Promise<void>;
    confirm: (message: string, options?: ModalOptions) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<{
        message: string;
        title?: string;
        type: "alert" | "confirm";
        confirmText?: string;
        cancelText?: string;
    } | null>(null);

    // We store the resolve function of the current promise
    const resolveRef = useRef<((value: any) => void) | null>(null);

    const close = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => {
            setContent(null); // Clear content after animation would finish
            if (resolveRef.current) {
                // If it was just closed without button click (e.g. background click), assume cancel/false? 
                // Better policy: background click = cancel for confirm, ok for alert.
                resolveRef.current(false);
                resolveRef.current = null;
            }
        }, 200);
    }, []);

    const handleConfirm = () => {
        if (resolveRef.current) {
            resolveRef.current(true);
            resolveRef.current = null;
        }
        close();
    };

    const handleCancel = () => {
        if (resolveRef.current) {
            resolveRef.current(false);
            resolveRef.current = null;
        }
        close();
    };

    const alert = useCallback((message: string, options?: ModalOptions) => {
        return new Promise<void>((resolve) => {
            setContent({
                message,
                title: options?.title || "Aviso",
                type: "alert",
                confirmText: options?.confirmText || "Entendido"
            });
            setIsOpen(true);
            resolveRef.current = () => resolve();
        });
    }, []);

    const confirm = useCallback((message: string, options?: ModalOptions) => {
        return new Promise<boolean>((resolve) => {
            setContent({
                message,
                title: options?.title || "Confirmar",
                type: "confirm",
                confirmText: options?.confirmText || "Aceptar",
                cancelText: options?.cancelText || "Cancelar"
            });
            setIsOpen(true);
            resolveRef.current = resolve;
        });
    }, []);

    return (
        <ModalContext.Provider value={{ alert, confirm }}>
            {children}

            {content && (
                <Modal
                    isOpen={isOpen}
                    onClose={() => {
                        // Background click behavior
                        if (content.type === 'alert') handleConfirm(); // Same as OK
                        else handleCancel(); // Same as Cancel
                    }}
                    title={content.title}
                    footer={
                        <>
                            {content.type === "confirm" && (
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    {content.cancelText}
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                            >
                                {content.confirmText}
                            </button>
                        </>
                    }
                >
                    <p className="text-base text-slate-600 leading-relaxed">{content.message}</p>
                </Modal>
            )}
        </ModalContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useModal() {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("useModal must be used within ModalProvider");
    return ctx;
}
