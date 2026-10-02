"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import styles from "./UIProvider.module.css";

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmDialogState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface UIContextType {
  toast: (message: string, type?: ToastType) => void;
  confirmAction: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmDialogState>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const confirmAction = useCallback((message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirmState({
      isOpen: true,
      message,
      onConfirm: () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        onConfirm();
      },
      onCancel: () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        if (onCancel) onCancel();
      },
    });
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success": return "✅";
      case "error": return "❌";
      case "warning": return "⚠️";
      default: return "✅";
    }
  };

  return (
    <UIContext.Provider value={{ toast, confirmAction }}>
      {children}

      {/* Toasts Container */}
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            <span className={styles.toastIcon}>{getIcon(t.type)}</span>
            <span className={styles.toastMessage}>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmState.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <span className={styles.modalIcon}>⚠️</span>
            <p className={styles.modalMessage}>{confirmState.message}</p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={confirmState.onCancel}>
                Cancelar
              </button>
              <button className={styles.btnConfirm} onClick={confirmState.onConfirm}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
