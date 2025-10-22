/* eslint-disable no-unused-vars */
import React from "react";
import { ArrowLeft, Mail, Phone, MapPin, User } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

const SimplifiedCustomerDetail = ({ id = "CUST-1001", onBack = () => {} }) => {
  const customer = {
    id: "CUST-1001",
    firstName: "Maria",
    lastName: "Rodriguez",
    email: "maria.rodriguez@example.com",
    phone: "+63 912 345 6789",
    address: "123 Main St, Calamba, Laguna, 4027",
    gender: "female",
    status: "active",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Customer Details</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Customer Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-gray-600">
                {customer.firstName.charAt(0)}
                {customer.lastName.charAt(0)}
              </span>
            </div>
            <h2 className="text-xl font-semibold">
              {customer.firstName} {customer.lastName}
            </h2>
            <p className="text-gray-500">{customer.id}</p>
            <div className="mt-2">
              {customer.status === "active" ? (
                <Badge className="bg-green-500">Active</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">
                  Inactive
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-4 mt-4">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{customer.email}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p>{customer.address}</p>
              </div>
            </div>
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="capitalize">{customer.gender}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedCustomerDetail;
