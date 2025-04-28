"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "./loading-spinner";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [dots, setDots] = useState(".");

  // Efek untuk loading timer (diperpanjang ke 4 detik)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000); // Dari 2500ms jadi 4000ms

    return () => clearTimeout(timer);
  }, []);

  // Efek untuk animasi titik-titik
  useEffect(() => {
    const dotsTimer = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : "."));
    }, 500);

    return () => clearInterval(dotsTimer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-gradient-to-br from-[#0d1117] to-[#1a1f2e] flex flex-col items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Gambar dengan efek glow */}
            <motion.img
              src="/logo.png"
              alt="Galxe Logo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-36 h-36 mb-4 rounded-xl shadow-lg animate-pulse-glow"
            />
            {/* Spinner dan Progress Bar */}
            <div className="relative">
              <LoadingSpinner size="lg" color="blue" /> {/* Ukuran spinner diperbesar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }} // Sesuaikan dengan durasi loading
                className="absolute bottom-[-8px] left-0 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-5"
              />
            </div>
            {/* Teks Loading dengan animasi titik-titik */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
            >
              Loading<span className="inline-block animate-bounce-dots">{dots}</span>
            </motion.h2>
            {/* Teks Memuat halaman */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-3 text-sm text-gray-300"
            >
              Memuat halaman...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}