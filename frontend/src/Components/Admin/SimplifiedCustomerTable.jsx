import React, { useState } from "react";
import { Eye, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableHeader, TableBody, TableHead, TableCell, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

const mockCustomers = [
  {
    id: "CUST-1001",
    firstName: "Maria",
    lastName: "Rodriguez",
    email: "maria.rodriguez@example.com",
    phone: "+63 912 345 6789",
    address: "123 Main St, Calamba, Laguna, 4027",
    gender: "female",
    status: "active",
  },
  {
    id: "CUST-1002",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    phone: "+63 923 456 7890",
    address: "456 Oak Ave, San Pedro, Laguna, 4023",
    gender: "male",
    status: "active",
  },
  {
    id: "CUST-1003",
    firstName: "Emily",
    lastName: "Johnson",
    email: "emily.johnson@example.com",
    phone: "+63 934 567 8901",
    address: "789 Pine St, Los Baños, Laguna, 4030",
    gender: "female",
    status: "active",
  },
  {
    id: "CUST-1004",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@example.com",
    phone: "+63 945 678 9012",
    address: "321 Cedar Rd, Sta. Rosa, Laguna, 4026",
    gender: "male",
    status: "inactive",
  },
  {
    id: "CUST-1005",
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@example.com",
    phone: "+63 956 789 0123",
    address: "654 Maple Dr, Biñan, Laguna, 4024",
    gender: "female",
    status: "active",
  },
];

const SimplifiedCustomerTable = ({ onViewCustomer }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState(mockCustomers);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setCustomers(mockCustomers);
    } else {
      const filtered = mockCustomers.filter(
        (customer) =>
          customer.firstName.toLowerCase().includes(query) ||
          customer.lastName.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          customer.id.toLowerCase().includes(query)
      );
      setCustomers(filtered);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customer Management</h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{customer.id}</div>
                  </div>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell
                  className="max-w-[200px] truncate"
                  title={customer.address}
                >
                  {customer.address}
                </TableCell>
                <TableCell className="capitalize">{customer.gender}</TableCell>
                <TableCell>
                  {customer.status === "active" ? (
                    <Badge className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCustomer(customer.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">
        Showing {customers.length} of {mockCustomers.length} customers
      </div>
    </div>
  );
};

export default SimplifiedCustomerTable;
