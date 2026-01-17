import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50 text-red-900">
                    <h1 className="text-2xl font-bold mb-4">Algo ha salido mal</h1>
                    <p className="mb-2 font-semibold">Error:</p>
                    <pre className="bg-white p-4 rounded shadow text-xs overflow-auto w-full max-w-md border border-red-200">
                        {this.state.error?.toString()}
                    </pre>
                    {this.state.errorInfo && (
                        <details className="mt-4 w-full max-w-md">
                            <summary className="cursor-pointer mb-2 text-sm text-red-700">Ver Stack Trace</summary>
                            <pre className="bg-white p-2 rounded text-[10px] overflow-auto border border-red-100 h-32">
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = "/";
                        }}
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow-lg"
                    >
                        Borrar datos y Recargar
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
