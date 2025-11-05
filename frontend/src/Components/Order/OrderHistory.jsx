import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        setError('You must be logged in to view your order history.');
        setLoading(false);
        return;
      }

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://craftconnect-laravel-backend-2.onrender.com/api';
        const response = await fetch(`${backendUrl}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders.');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">Total: ₱{order.products.reduce((sum, p) => sum + parseFloat(p.pivot.total_amount), 0).toFixed(2)}</p>
                  <p className={`text-sm font-medium ${order.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                    Status: {order.status}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Items:</h3>
                <div className="space-y-4">
                  {order.products.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-2 rounded bg-gray-50">
                      <div className="flex items-center">
                        <img src={product.productImage} alt={product.productName} className="w-16 h-16 object-cover rounded mr-4" />
                        <div>
                          <p className="font-semibold">{product.productName}</p>
                          <p className="text-sm text-gray-600">Sold by: {product.seller.user.userName}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Write a Review</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
