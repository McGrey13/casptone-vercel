import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Star, StarOff, Loader2, RefreshCw } from "lucide-react";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8080/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async (productId, currentStatus) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:8080/api/products/${productId}/toggle-featured`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }

      // Update the local state to reflect the change
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, is_featured: !currentStatus } 
          : product
      ));
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert('Failed to update featured status');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Featured Products</CardTitle>
            <CardDescription>
              Feature your best products to showcase them on the homepage
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No products found.
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {product.productImage ? (
                    <img 
                      src={product.productImage} 
                      alt={product.productName}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                      <div className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{product.productName}</div>
                    <div className="text-sm text-gray-500">
                      {product.category} • ${product.productPrice}
                    </div>
                  </div>
                </div>
                <Button
                  variant={product.is_featured ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFeatured(product.id, product.is_featured)}
                  disabled={isLoading}
                >
                  {product.is_featured ? (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Featured
                    </>
                  ) : (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      Feature
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
