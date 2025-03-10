import { useShopping } from "@/contexts/ShoppingContext";
import { cn } from "@/lib/utils";

interface CoinBadgeProps {
  coins: number;
}

export default function CoinBadge({ coins }: CoinBadgeProps) {
  const { coinAnimation } = useShopping();
  
  return (
    <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
      <i className="fa-solid fa-coins text-amber-500 mr-1.5"></i>
      <span 
        className={cn(
          "font-semibold",
          coinAnimation && "animate-pulse"
        )}
      >
        {coins}
      </span>
    </div>
  );
}
