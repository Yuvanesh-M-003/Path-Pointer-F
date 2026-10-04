import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Card } from "./Card";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-md"
          >
            <Card className="rounded-b-none bg-navy-850 sm:rounded-b-xl">
              <div className="flex items-start justify-between gap-4 p-5 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-white">{title}</h2>
                  {description && <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              {children && <div className="px-5 pb-2">{children}</div>}
              {footer && <div className="flex flex-col-reverse gap-2 p-5 pt-4 sm:flex-row sm:justify-end">{footer}</div>}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
