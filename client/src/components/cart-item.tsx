import { useShopping, CartItem as CartItemType } from "@/contexts/ShoppingContext";
import { motion } from "framer-motion";

interface CartItemProps {
  product: CartItemType;
}

export default function CartItem({ product }: CartItemProps) {
  const { removeFromCart } = useShopping();
  
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <div className="flex">
        {/* Imagen del producto con efecto de hover */}
        <div className="relative w-24 h-24 overflow-hidden bg-gray-100 flex-shrink-0">
          <motion.img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Etiqueta de categoría */}
          <div className="absolute top-2 left-0">
            <div className="text-[10px] font-medium px-2 py-0.5 bg-primary/80 text-white rounded-r-full shadow-sm">
              {product.category}
            </div>
          </div>
        </div>
        
        {/* Información del producto */}
        <div className="flex-1 p-3 relative">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-800 leading-tight">{product.name}</h4>
            <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 mr-1 flex items-center justify-center">
                <span className="text-yellow-800 text-[6px] font-bold">$</span>
              </div>
              <span className="text-amber-600 font-semibold text-sm">
                {product.price}
              </span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {product.description || "Producto seleccionado"}
          </p>
          
          {/* Botón para eliminar */}
          <div className="flex justify-end mt-2">
            <motion.button 
              onClick={() => removeFromCart(product.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
