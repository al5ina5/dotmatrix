"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { Portal } from "./Portal";

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    children: ReactNode;
    maxWidth?: string;
    className?: string;
    backdropClassName?: string;
    showBackdrop?: boolean;
    pointerEvents?: "auto" | "none";
}

export function Modal({
    isOpen,
    onClose,
    children,
    maxWidth = "max-w-xl",
    className = "",
    backdropClassName = "",
    showBackdrop = true,
    pointerEvents = "auto"
}: ModalProps) {
    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={`fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-black/80 ${backdropClassName}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        style={{ pointerEvents: pointerEvents === "none" ? "none" : "auto" }}
                    >
                        <motion.div
                            className={`rounded-2xl border border-white/20 shadow-2xl ${maxWidth} w-full bg-white/10 backdrop-blur-2xl text-white flex flex-col ${className}`}
                            initial={{
                                opacity: 0,
                                y: 50,
                                scale: 0.9,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: -30,
                                scale: 0.95,
                            }}
                            transition={{
                                duration: 0.6,
                                ease: [0.16, 1, 0.3, 1],
                                delay: 0.1
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onClose) {
                                    // Allow clicks inside modal to propagate normally
                                }
                            }}
                        >
                            {children}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Portal >
    );
}

