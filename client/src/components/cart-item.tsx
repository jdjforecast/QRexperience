import { useShopping, CartItem as CartItemType } from "@/contexts/ShoppingContext";

interface CartItemProps {
  product: CartItemType;
}

export default function CartItem({ product }: CartItemProps) {
  const { removeFromCart } = useShopping();
  
  return (
    <div className="flex gap-4 bg-gray-50 p-3 rounded-lg">
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-20 h-20 object-cover rounded"
      />
      
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="font-medium text-gray-800">{product.name}</h4>
          <span className="flex items-center text-amber-500 font-medium">
            <i className="fa-solid fa-coins mr-1.5 text-xs"></i>
            {product.price}
          </span>
        </div>
        
        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full mt-1 inline-block">
          {product.category}
        </span>
        
        <div className="flex justify-between items-center mt-2">
          <button 
            onClick={() => removeFromCart(product.id)}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <i className="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
