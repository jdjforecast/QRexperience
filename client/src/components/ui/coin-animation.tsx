import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CoinAnimationProps {
  active: boolean;
  onComplete?: () => void;
  className?: string;
}

export default function CoinAnimation({ 
  active, 
  onComplete, 
  className 
}: CoinAnimationProps) {
  const [coins, setCoins] = useState<{ id: string; x: number; y: number; rotation: number; scale: number; delay: number }[]>([]);
  
  useEffect(() => {
    if (active) {
      // Crear 10 monedas con posiciones y animaciones aleatorias
      const newCoins = Array.from({ length: 10 }, (_, i) => ({
        id: `coin-${i}-${Date.now()}`,
        x: Math.random() * 300 - 150, // Posición X entre -150 y 150
        y: -Math.random() * 500 - 100, // Posición Y negativa para que caigan desde arriba
        rotation: Math.random() * 720 - 360, // Rotación entre -360 y 360 grados
        scale: 0.5 + Math.random() * 0.5, // Escala entre 0.5 y 1
        delay: Math.random() * 0.8, // Retraso aleatorio para cada moneda
      }));
      
      setCoins(newCoins);
      
      // Limpiar las monedas después de la animación
      const timeout = setTimeout(() => {
        setCoins([]);
        if (onComplete) onComplete();
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
    
    return undefined;
  }, [active, onComplete]);
  
  return (
    <AnimatePresence>
      {active && (
        <div className={cn("fixed inset-0 pointer-events-none z-50 overflow-hidden", className)}>
          {coins.map((coin) => (
            <motion.div
              key={coin.id}
              className="absolute left-1/2 top-0"
              initial={{ 
                x: coin.x, 
                y: coin.y, 
                rotate: 0,
                opacity: 0,
                scale: coin.scale
              }}
              animate={{ 
                x: coin.x + (Math.random() * 100 - 50),
                y: window.innerHeight + 100,
                rotate: coin.rotation,
                opacity: [0, 1, 1, 0],
                scale: coin.scale
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                type: "spring",
                duration: 2.5,
                delay: coin.delay,
                ease: "easeOut"
              }}
            >
              <div className="relative w-16 h-16">
                {/* Moneda con efecto de brillo */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-500 flex items-center justify-center border-4 border-yellow-500 transform rotate-3">
                    <span className="text-yellow-700 font-bold text-xl">$</span>
                  </div>
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/70 to-transparent opacity-70 w-1/2 h-1/2 top-1 left-1"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}