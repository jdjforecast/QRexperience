import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@shared/schema";
import { ReactNode } from "react";
import { useLocation } from "wouter";

interface CategoryIcon {
  [key: string]: ReactNode;
}

const categoryIcons: CategoryIcon = {
  'Frutas y Verduras': <i className="fa-solid fa-apple-whole text-xl"></i>,
  'Lácteos': <i className="fa-solid fa-cheese text-xl"></i>,
  'Carnes': <i className="fa-solid fa-drumstick-bite text-xl"></i>,
  'Panadería': <i className="fa-solid fa-bread-slice text-xl"></i>,
  'Bebidas': <i className="fa-solid fa-bottle-water text-xl"></i>,
  'Snacks': <i className="fa-solid fa-cookie text-xl"></i>
};

interface ProductCategoryCardProps {
  category: Category;
}

export default function ProductCategoryCard({ category }: ProductCategoryCardProps) {
  const [location, setLocation] = useLocation();
  
  const handleCategoryClick = () => {
    // URL encoding the category for use in the URL
    const encodedCategory = encodeURIComponent(category);
    setLocation(`/products/category/${encodedCategory}`);
  };
  
  return (
    <Card 
      className="hover:shadow-md transition cursor-pointer"
      onClick={handleCategoryClick}
    >
      <CardContent className="p-4 text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3 mx-auto">
          {categoryIcons[category] || <i className="fa-solid fa-tag text-xl"></i>}
        </div>
        <h4 className="font-medium text-gray-800">{category}</h4>
      </CardContent>
    </Card>
  );
}
