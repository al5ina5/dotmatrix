"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Hand, Smartphone } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { Modal } from "./Modal";

export default function LandingComponent() {
    const [isVisible, setIsVisible] = useState(true);
    const { showSettings, isRemoteConnected, peerId } = useUI();

    const timeout = 60000 * 2;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, timeout); // 60 seconds

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isRemoteConnected || showSettings) {
            setIsVisible(false);
        }
    }, [isRemoteConnected, showSettings]);

    return (
        <Modal
            isOpen={isVisible}
            maxWidth="max-w-md lg:max-w-2xl"
            pointerEvents="none"
            backdropClassName="p-6 pointer-events-none bg-transparent!"
        >
            <motion.div
                className="p-6 py-12 lg:p-12 text-white space-y-6 lg:space-y-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            >
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
                    <motion.img
                        src="/logoipsum-405.svg"
                        alt="DotMatrix"
                        className="w-24 lg:w-32 shrink-0"
                        initial={{ opacity: 0, x: -20, rotate: -5 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <motion.p
                        className="text-lg lg:text-3xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                    >
                        Welcome to most powerful LED ticker display on the web.
                    </motion.p>
                </div>

                <motion.div
                    className="flex flex-col lg:flex-row gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                >
                    <motion.div
                        className="w-full lg:aspect-square border border-white/20 bg-white/20 rounded-2xl flex lg:flex-col gap-4 lg:gap-6 items-center justify-center p-4 lg:p-6 lg:text-center"
                        initial={{ opacity: 0, x: -30, rotateY: -15 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Hand className="w-8 h-8 lg:w-16 lg:h-16 text-white" />
                        <p>Double tap to Configure</p>
                    </motion.div>
                    <motion.div
                        className="w-full lg:aspect-square border border-white/20 bg-white/20 rounded-2xl flex lg:flex-col gap-4 lg:gap-6 items-center justify-center p-4 lg:p-6 lg:text-center"
                        initial={{ opacity: 0, x: 30, rotateY: 15 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Smartphone className="w-8 h-8 lg:w-16 lg:h-16 text-white" />
                        <div className="space-y-1 text-sm">
                            <p className="text-base lg:text-2xl font-bold">{peerId || '--'}</p>
                            <p>Use remote code to connect</p>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
            <motion.div
                className="h-2 overflow-hidden"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                style={{ width: '100%' }}
            >
                <motion.div
                    className="h-full"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{
                        duration: timeout / 1000,
                        ease: "linear",
                    }}
                    style={{
                        originX: 0,
                        background: 'linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))',
                        boxShadow: '0 0 4px rgba(255, 255, 255, 0.5)',
                    }}
                />
            </motion.div>
        </Modal>
    );
}
