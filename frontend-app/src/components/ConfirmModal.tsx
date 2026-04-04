import React, { useEffect } from "react";
import { AlertCircle, AlertTriangle, AlertOctagon, X } from "lucide-react";

export type ModalVariant = "info" | "warning" | "danger";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const IconComponent = 
    variant === "info" ? AlertCircle :
    variant === "warning" ? AlertTriangle :
    AlertOctagon;

  const colors = {
    info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    warning: "text-[#ffcc00] bg-[#ffcc00]/10 border-[#ffcc00]/20",
    danger: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const btnColors = {
    info: "bg-blue-500 hover:bg-blue-600 text-white",
    warning: "bg-[#ffcc00] hover:bg-[#ffd633] text-black",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#0a0a0c] border border-white/[0.1] rounded-2xl p-6 shadow-2xl scale-100 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full border flex items-center justify-center mb-4 ${colors[variant]}`}>
            <IconComponent size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-medium text-zinc-300 bg-white/[0.05] hover:bg-white/[0.08] transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${btnColors[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
