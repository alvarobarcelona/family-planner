import { createContext, useContext, useState, useCallback, ReactNode, useRef } from "react";
import { Modal } from "../components/Modal";

interface ModalOptions {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'primary' | 'danger';
}

interface ModalContextValue {
    alert: (message: string, options?: ModalOptions) => Promise<void>;
    confirm: (message: string, options?: ModalOptions) => Promise<boolean | null>;
    /** Non-blocking message that disappears on its own. */
    toast: (message: string) => void;
}

const TOAST_DURATION_MS = 2500;

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<{
        message: string;
        title?: string;
        type: "alert" | "confirm";
        confirmText?: string;
        cancelText?: string;
        confirmVariant?: 'primary' | 'danger';
    } | null>(null);

    // We store the resolve function of the current promise
    const resolveRef = useRef<((value: any) => void) | null>(null);

    const close = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => {
            setContent(null); // Clear content after animation would finish
            if (resolveRef.current) {
                // If it was just closed without button click (e.g. background click), assume dismiss/null
                resolveRef.current(null);
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

    const handleDismiss = () => {
        if (resolveRef.current) {
            resolveRef.current(null);
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
                confirmText: options?.confirmText || "Entendido",
                confirmVariant: options?.confirmVariant
            });
            setIsOpen(true);
            resolveRef.current = () => resolve();
        });
    }, []);

    const confirm = useCallback((message: string, options?: ModalOptions) => {
        return new Promise<boolean | null>((resolve) => {
            setContent({
                message,
                title: options?.title || "Confirmar",
                type: "confirm",
                confirmText: options?.confirmText || "Aceptar",
                cancelText: options?.cancelText || "Cancelar",
                confirmVariant: options?.confirmVariant
            });
            setIsOpen(true);
            resolveRef.current = resolve;
        });
    }, []);

    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastVisible, setToastVisible] = useState(false);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const toast = useCallback((message: string) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToastMessage(message);
        setToastVisible(true);
        toastTimerRef.current = setTimeout(() => setToastVisible(false), TOAST_DURATION_MS);
    }, []);

    return (
        <ModalContext.Provider value={{ alert, confirm, toast }}>
            {children}

            {toastMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    onClick={() => setToastVisible(false)}
                    className={`fixed left-1/2 -translate-x-1/2 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-[60] max-w-[90%] px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-lg transition-all duration-300 ${toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
                >
                    {toastMessage}
                </div>
            )}

            {content && (
                <Modal
                    isOpen={isOpen}
                    onClose={() => {
                        // Background click behavior
                        if (content.type === 'alert') handleConfirm(); // Same as OK
                        else handleDismiss(); // Dismiss (null)
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
                                className={`px-4 py-2 font-medium rounded-xl transition-colors shadow-sm ${content.confirmVariant === 'danger'
                                        ? "bg-red-600 text-white hover:bg-red-700 shadow-red-200"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                                    }`}
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
