import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-slate-200 font-mono">
          <div className="bg-slate-800 border border-red-500/50 p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-red-400 mb-2 font-display">SYSTEM CRITICAL FAILURE</h1>
            <p className="text-slate-400 mb-6 text-sm">
              An unexpected error occurred in the simulation protocols.
            </p>
            <div className="bg-black/50 p-4 rounded text-left text-xs text-red-300 font-mono mb-6 overflow-auto max-h-32 border border-slate-700">
                {this.state.error?.message || "Unknown Error"}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded transition-colors shadow-lg"
            >
              <RefreshCw className="w-4 h-4" /> REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}