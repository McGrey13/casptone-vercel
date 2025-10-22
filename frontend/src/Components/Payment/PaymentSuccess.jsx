import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Clock, Truck, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const paymentId = searchParams.get('payment_id') || 'N/A';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const orderSteps = [
    {
      id: 'to-pay',
      title: 'To Pay',
      description: 'Payment pending',
      icon: Clock,
      status: 'completed',
      color: 'bg-green-500'
    },
    {
      id: 'to-ship',
      title: 'To Ship',
      description: 'Order processing',
      icon: Package,
      status: 'current',
      color: 'bg-blue-500'
    },
    {
      id: 'to-receive',
      title: 'To Receive',
      description: 'Out for delivery',
      icon: Truck,
      status: 'pending',
      color: 'bg-yellow-500'
    },
    {
      id: 'completed',
      title: 'Completed',
      description: 'Order delivered',
      icon: CheckCircle2,
      status: 'pending',
      color: 'bg-green-600'
    },
    {
      id: 'return-refund',
      title: 'Return/Refund',
      description: 'If needed',
      icon: RotateCcw,
      status: 'pending',
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] to-[#e5ded7] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Success Header */}
        <Card className="border-[#a36b4f] shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-green-500" />
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-[#4b3832] mb-2">
              Payment Successful!
            </CardTitle>
            <p className="text-lg text-gray-600 mb-4">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            <Badge variant="outline" className="text-sm px-4 py-2 border-green-500 text-green-700">
              Payment ID: {paymentId}
            </Badge>
          </CardHeader>

          <CardContent className="p-8">
            {/* Order Status Steps */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#4b3832] mb-6 text-center">
                Order Status Tracking
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {orderSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'current';
                  const isPending = step.status === 'pending';

                  return (
                    <div
                      key={step.id}
                      className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'border-green-500 bg-green-50'
                          : isCurrent
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="text-center">
                        <div
                          className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                            isCompleted
                              ? 'bg-green-500'
                              : isCurrent
                              ? 'bg-blue-500'
                              : 'bg-gray-300'
                          }`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h4
                          className={`font-semibold text-sm ${
                            isCompleted || isCurrent ? 'text-[#4b3832]' : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                      </div>

                      {/* Connection Line */}
                      {index < orderSteps.length - 1 && (
                        <div
                          className={`hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 transform -translate-y-1/2 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/orders')}
                className="bg-[#a36b4f] hover:bg-[#8b5a47] text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Package className="h-5 w-5" />
                View My Orders
                <ArrowRight className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={() => navigate('/products')}
                variant="outline"
                className="border-[#a36b4f] text-[#a36b4f] hover:bg-[#a36b4f] hover:text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300"
              >
                Continue Shopping
              </Button>
            </div>

            {/* Auto-redirect Notice */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Redirecting to My Orders in{' '}
                <span className="font-semibold text-[#a36b4f]">{countdown}</span> seconds...
              </p>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-[#f8f5f2] rounded-lg border border-[#e5ded7]">
              <h4 className="font-semibold text-[#4b3832] mb-3">What happens next?</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You will receive an email confirmation shortly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Your order will be processed within 1-2 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You can track your order status in the My Orders section</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Contact support if you have any questions</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;

