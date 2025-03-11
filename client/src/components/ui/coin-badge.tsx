import { useState, useEffect } from "react";
import { useShopping } from "@/contexts/ShoppingContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CoinBadgeProps {
  coins: number;
}

export default function CoinBadge({ coins }: CoinBadgeProps) {
  const { coinAnimation } = useShopping();
  const [prevCoins, setPrevCoins] = useState(coins);
  const [isIncreased, setIsIncreased] = useState(false);
  
  useEffect(() => {
    if (coins > prevCoins) {
      setIsIncreased(true);
      // Resetear la animación después de un tiempo
      const timer = setTimeout(() => setIsIncreased(false), 2000);
      return () => clearTimeout(timer);
    }
    setPrevCoins(coins);
  }, [coins, prevCoins]);
  
  return (
    <div className="relative">
      <motion.div 
        className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1.5 rounded-full border border-amber-200 shadow-sm"
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, isIncreased ? 1.1 : 1, 1],
          transition: { duration: 0.5 }
        }}
      >
        {/* Ícono de moneda animado */}
        <div className="relative w-5 h-5">
          <div className={cn(
            "absolute inset-0 flex items-center justify-center",
            isIncreased && "animate-coin-bounce"
          )}>
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-inner flex items-center justify-center">
              <span className="text-yellow-800 font-bold text-[10px]">$</span>
            </div>
            
            {/* Brillo de la moneda */}
            <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-white/70 opacity-80"></div>
          </div>
        </div>
        
        {/* Valor de monedas */}
        <span className={cn(
          "font-semibold text-amber-800",
          coinAnimation && "animate-pulse",
          isIncreased && "text-green-600"
        )}>
          {coins}
          
          {/* Indicador de incremento */}
          {isIncreased && (
            <span className="ml-1 text-xs text-green-500 font-normal">
              +{coins - prevCoins}
            </span>
          )}
        </span>
      </motion.div>
      
      {/* Efecto de brillo al incrementar */}
      {isIncreased && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent animate-shine"></div>
        </div>
      )}
    </div>
  );
}
