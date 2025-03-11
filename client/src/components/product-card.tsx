import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/contexts/ShoppingContext";
import { truncateText } from "@/lib/utils";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [location, setLocation] = useLocation();
  
  const handleViewDetails = () => {
    onViewDetails(product);
    setLocation(`/product/${product.id}`);
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full h-40 object-cover"
      />
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
            {product.category}
          </span>
          <span className="flex items-center text-amber-500 font-medium">
            <i className="fa-solid fa-coins mr-1.5 text-xs"></i>
            {product.price}
          </span>
        </div>
        <h4 className="font-semibold text-gray-800 mb-1">{product.name}</h4>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {truncateText(product.description, 80)}
        </p>
        
        <div className="flex mb-3">
          {product.stock <= 0 ? (
            <Badge variant="destructive" className="text-xs">Sin stock</Badge>
          ) : product.stock <= 5 ? (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
              Últimas {product.stock} unidades
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">
              En stock
            </Badge>
          )}
        </div>
        
        <Button 
          variant="secondary"
          onClick={handleViewDetails}
          className={`w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 text-sm transition ${
            product.stock <= 0 ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          Ver detalles
        </Button>
      </CardContent>
    </Card>
  );
}
