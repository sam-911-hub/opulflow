"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SERVICE_PRICING } from "@/types";
import { convertUSDToLocal, formatCurrency } from "@/lib/currency";

export default function PricingCalculator() {
  const [currency, setCurrency] = useState<string>("USD");
  const [selectedServices, setSelectedServices] = useState<{[key: string]: number}>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  // Available currencies
  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "KES", name: "Kenyan Shilling" },
    { code: "UGX", name: "Ugandan Shilling" },
    { code: "TZS", name: "Tanzanian Shilling" },
    { code: "NGN", name: "Nigerian Naira" }
  ];

  // Update total price when selections change
  useEffect(() => {
    let total = 0;
    Object.entries(selectedServices).forEach(([service, quantity]) => {
      if (SERVICE_PRICING[service as keyof typeof SERVICE_PRICING]) {
        total += SERVICE_PRICING[service as keyof typeof SERVICE_PRICING].price * quantity;
      }
    });
    setTotalPrice(total);
  }, [selectedServices]);

  // Update exchange rate when currency changes
  useEffect(() => {
    if (currency !== "USD") {
      const rate = convertUSDToLocal(1, currency);
      setExchangeRate(rate);
    } else {
      setExchangeRate(1);
    }
  }, [currency]);

  const handleQuantityChange = (service: string, quantity: number) => {
    setSelectedServices(prev => ({
      ...prev,
      [service]: Math.max(0, quantity)
    }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Pricing Calculator</span>
          <select 
            value={currency}
            onChange={handleCurrencyChange}
            className="border rounded p-1 text-sm"
          >
            {currencies.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.name} ({curr.code})
              </option>
            ))}
          </select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(SERVICE_PRICING).map(([key, service]) => (
              <div key={key} className="flex items-center justify-between border p-3 rounded-md">
                <div>
                  <p className="font-medium">{service.description}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(service.price * exchangeRate, currency)}/{service.description.includes("Bundle") ? "bundle" : "credit"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleQuantityChange(key, (selectedServices[key] || 0) - 1)}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={selectedServices[key] || 0}
                    onChange={(e) => handleQuantityChange(key, parseInt(e.target.value) || 0)}
                    className="w-16 text-center"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleQuantityChange(key, (selectedServices[key] || 0) + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold">
                {formatCurrency(totalPrice * exchangeRate, currency)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Estimated cost based on your selections. Credits expire after 90 days.
            </p>
          </div>

          <Button className="w-full mt-4" disabled={totalPrice === 0}>
            Purchase Selected Credits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}