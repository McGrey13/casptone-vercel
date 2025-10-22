import React, { useState } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

const RulesGuidelines = ({ onNext, onBack, onAgree, agreed = false }) => {
  const [isAgreed, setIsAgreed] = useState(agreed);
  const [showError, setShowError] = useState(false);

  const handleNext = () => {
    if (isAgreed) {
      onAgree(true);
      onNext();
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const handleCheckboxChange = (checked) => {
    setIsAgreed(checked);
    onAgree(checked);
    if (checked) setShowError(false);
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Rules & Guidelines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 rounded-md border p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Craft Connect Marketplace Rules
            </h3>

            {/* Rules Sections */}
            <section className="space-y-2">
              <h4 className="font-medium">1. Product Authenticity</h4>
              <p>
                All products must be authentic native handicrafts.
                Misrepresentation of products as handmade or native when they
                are not is strictly prohibited and will result in immediate
                removal from the platform.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-medium">2. Quality Standards</h4>
              <p>
                Products must meet our quality standards. Items that are
                damaged, poorly made, or do not match their descriptions will be
                removed. Repeated quality issues may result in store suspension.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-medium">3. Cultural Respect</h4>
              <p>
                Sellers must demonstrate respect for the cultural significance
                of native handicrafts. Inappropriate cultural appropriation or
                misrepresentation will not be tolerated.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-medium">4. Accurate Descriptions</h4>
              <p>
                All product listings must include accurate descriptions,
                dimensions, materials used, and clear photographs. Misleading
                information is grounds for listing removal.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-medium">5. Pricing Transparency</h4>
              <p>
                All prices must be clearly displayed with no hidden fees.
                Shipping costs must be transparent and reasonable.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-medium">6. Timely Shipping</h4>
              <p>
                Sellers must ship products within the timeframe specified in
                their listings. Consistent shipping delays may result in
                penalties or suspension.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-medium">7. Customer Service</h4>
              <p>
                Sellers must respond to customer inquiries within 48 hours and
                resolve issues in a professional and timely manner.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-medium">8. Return Policy</h4>
              <p>
                Sellers must have a clear return policy that complies with Craft
                Connect's minimum standards for customer protection.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-medium">9. Intellectual Property</h4>
              <p>
                Sellers must respect intellectual property rights and only sell
                products they have the right to sell. Copyright or trademark
                infringement will result in immediate action.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-medium">10. Platform Fees</h4>
              <p>
                Sellers agree to pay the standard platform fee of 10% on each
                sale, which covers payment processing, marketing, and platform
                maintenance.
              </p>
            </section>
          </div>
        </ScrollArea>

        {/* Checkbox Agreement */}
        <div className="mt-6 flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={isAgreed}
            onCheckedChange={(checked) =>
              handleCheckboxChange(checked === true)
            }
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            I have read and agree to the Craft Connect Marketplace Rules and
            Guidelines
          </label>
        </div>

        {/* Error Alert */}
        {showError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must agree to the rules and guidelines to continue.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {/* Navigation Buttons */}
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} variant="outline" className="bg-white text-black">Next</Button>
      </CardFooter>
    </Card>
  );
};

export default RulesGuidelines;
