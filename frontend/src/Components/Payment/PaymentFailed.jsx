import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowRight, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const paymentId = searchParams.get('payment_id') || 'N/A';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/products');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] to-[#e5ded7] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Failed Header */}
        <Card className="border-red-300 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <XCircle className="h-20 w-20 text-red-500" />
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-[#4b3832] mb-2">
              Payment Failed
            </CardTitle>
            <p className="text-lg text-gray-600 mb-4">
              We're sorry, but your payment could not be processed at this time.
            </p>
            <Badge variant="outline" className="text-sm px-4 py-2 border-red-500 text-red-700">
              Payment ID: {paymentId}
            </Badge>
          </CardHeader>

          <CardContent className="p-8">
            {/* Error Details */}
            <div className="mb-8 p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                What went wrong?
              </h3>
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Insufficient funds in your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Card details may be incorrect or expired</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Network connection issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Payment gateway temporarily unavailable</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/checkout')}
                className="bg-[#a36b4f] hover:bg-[#8b5a47] text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
                <ArrowRight className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={() => navigate('/products')}
                variant="outline"
                className="border-[#a36b4f] text-[#a36b4f] hover:bg-[#a36b4f] hover:text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <Home className="h-5 w-5" />
                Continue Shopping
              </Button>
            </div>

            {/* Auto-redirect Notice */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Redirecting to products page in{' '}
                <span className="font-semibold text-[#a36b4f]">{countdown}</span> seconds...
              </p>
            </div>

            {/* Help Section */}
            <div className="mt-8 p-6 bg-[#f8f5f2] rounded-lg border border-[#e5ded7]">
              <h4 className="font-semibold text-[#4b3832] mb-3">Need help?</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Check your payment method details and try again</p>
                <p>• Contact your bank if the issue persists</p>
                <p>• Reach out to our support team for assistance</p>
                <p>• Your cart items have been saved for your convenience</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFailed;

