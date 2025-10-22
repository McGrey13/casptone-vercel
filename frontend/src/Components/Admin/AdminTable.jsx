import React, { useState } from "react";
import {
  Eye,
  Trash2,
  MoreHorizontal,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const mockAdmins = [
  {
    id: "ADM-1001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@craftconnect.com",
    address: "123 Main St, Calamba, Laguna",
    gender: "male",
    phoneNumber: "+63 912 345 6789",
    role: "Super Admin",
    isOnline: true,
    lastActive: "2023-06-15T10:30:00",
  },
  {
    id: "ADM-1002",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@craftconnect.com",
    address: "456 Oak Ave, San Pedro, Laguna",
    gender: "female",
    phoneNumber: "+63 923 456 7890",
    role: "Product Manager",
    isOnline: false,
    lastActive: "2023-06-14T15:45:00",
  },
  {
    id: "ADM-1003",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@craftconnect.com",
    address: "789 Pine St, Los Baños, Laguna",
    gender: "male",
    phoneNumber: "+63 934 567 8901",
    role: "Content Manager",
    isOnline: true,
    lastActive: "2023-06-15T09:15:00",
  },
  {
    id: "ADM-1004",
    firstName: "Emily",
    lastName: "Williams",
    email: "emily.williams@craftconnect.com",
    address: "321 Cedar Rd, Sta. Rosa, Laguna",
    gender: "female",
    phoneNumber: "+63 945 678 9012",
    role: "Customer Support",
    isOnline: false,
    lastActive: "2023-06-13T16:20:00",
  },
  {
    id: "ADM-1005",
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@craftconnect.com",
    address: "654 Maple Dr, Biñan, Laguna",
    gender: "male",
    phoneNumber: "+63 956 789 0123",
    role: "Technical Support",
    isOnline: true,
    lastActive: "2023-06-15T11:05:00",
  },
];

const AdminTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [admins, setAdmins] = useState(mockAdmins);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    gender: "male",
    phoneNumber: "",
    role: "",
  });

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setAdmins(mockAdmins);
    } else {
      const filtered = mockAdmins.filter(
        (admin) =>
          admin.firstName.toLowerCase().includes(query) ||
          admin.lastName.toLowerCase().includes(query) ||
          admin.email.toLowerCase().includes(query) ||
          admin.address.toLowerCase().includes(query) ||
          admin.role.toLowerCase().includes(query)
      );
      setAdmins(filtered);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenderChange = (value) => {
    setNewAdmin((prev) => ({
      ...prev,
      gender: value,
    }));
  };

  const handleAddAdmin = (e) => {
    e.preventDefault();

    const newAdminEntry = {
      id: `ADM-${1000 + mockAdmins.length + 1}`,
      ...newAdmin,
      isOnline: false,
      lastActive: new Date().toISOString(),
    };

    setAdmins((prev) => [...prev, newAdminEntry]);
    setIsAddAdminOpen(false);
    setNewAdmin({
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      gender: "male",
      phoneNumber: "",
      role: "",
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new admin account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAdmin}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={newAdmin.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={newAdmin.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newAdmin.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={newAdmin.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={newAdmin.gender}
                    onValueChange={handleGenderChange}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={newAdmin.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    name="role"
                    value={newAdmin.role}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Admin</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search admins..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </div>
        </div>

        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {admin.firstName} {admin.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{admin.id}</div>
                  </div>
                </TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell
                  className="max-w-[200px] truncate"
                  title={admin.address}
                >
                  {admin.address}
                </TableCell>
                <TableCell className="capitalize">{admin.gender}</TableCell>
                <TableCell>{admin.phoneNumber}</TableCell>
                <TableCell>{admin.role}</TableCell>
                <TableCell>
                  {admin.isOnline ? (
                    <Badge className="bg-green-500">Online</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      Offline
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(admin.lastActive).toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href = `/admin/users/admins/${admin.id}`)
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {admins.length} of {mockAdmins.length} admins
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminTable;
