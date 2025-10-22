import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  ShoppingBag,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

// Reusable Stat Card Component
const StatCard = ({ title, value, description, icon, trend, trendValue }) => (
  <Card className="transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="mt-2 flex items-center text-xs">
        {trend === "up" ? (
          <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
        ) : trend === "down" ? (
          <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
        ) : null}
        <span
          className={
            trend === "up"
              ? "text-green-500"
              : trend === "down"
              ? "text-red-500"
              : ""
          }
        >
          {trendValue}
        </span>
      </div>
    </CardContent>
  </Card>
);

// Helper for status badge styles
const getStatusStyle = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Processing":
      return "bg-blue-100 text-blue-800";
    case "Shipped":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Dashboard = () => {
  const now = new Date();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, Admin User! Here's what's happening today.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {now.toLocaleDateString()} {now.toLocaleTimeString()}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value="$24,780"
          description="Total revenue this month"
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          trend="up"
          trendValue="12% from last month"
        />
        <StatCard
          title="New Customers"
          value="843"
          description="New customers this month"
          icon={<Users className="h-4 w-4 text-primary" />}
          trend="up"
          trendValue="8% from last month"
        />
        <StatCard
          title="Active Artisans"
          value="56"
          description="Artisans with active listings"
          icon={<Users className="h-4 w-4 text-primary" />}
          trend="up"
          trendValue="3% from last month"
        />
        <StatCard
          title="Products Sold"
          value="1,234"
          description="Products sold this month"
          icon={<ShoppingBag className="h-4 w-4 text-primary" />}
          trend="down"
          trendValue="2% from last month"
        />
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest 5 orders placed on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "ORD-7652",
                  customer: "Maria Rodriguez",
                  date: "2023-06-15",
                  amount: "$129.99",
                  status: "Completed",
                },
                {
                  id: "ORD-7651",
                  customer: "John Smith",
                  date: "2023-06-14",
                  amount: "$85.50",
                  status: "Processing",
                },
                {
                  id: "ORD-7650",
                  customer: "Emily Johnson",
                  date: "2023-06-14",
                  amount: "$210.75",
                  status: "Shipped",
                },
                {
                  id: "ORD-7649",
                  customer: "Michael Brown",
                  date: "2023-06-13",
                  amount: "$45.00",
                  status: "Completed",
                },
                {
                  id: "ORD-7648",
                  customer: "Sarah Wilson",
                  date: "2023-06-12",
                  amount: "$178.25",
                  status: "Completed",
                },
              ].map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-2 pt-2"
                >
                  <div>
                    <div className="font-medium">{order.id}</div>
                    <div className="text-sm text-gray-500">
                      {order.customer}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{order.amount}</div>
                    <div className="text-sm text-gray-500">{order.date}</div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Rated Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Rated Products</CardTitle>
            <CardDescription>
              Highest rated products this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "PRD-1234",
                  name: "Handcrafted Ceramic Mug",
                  artisan: "Sarah's Pottery",
                  rating: 4.9,
                  sales: 78,
                },
                {
                  id: "PRD-2345",
                  name: "Woven Basket Set",
                  artisan: "Weaving Wonders",
                  rating: 4.8,
                  sales: 65,
                },
                {
                  id: "PRD-3456",
                  name: "Hand-Poured Soy Candle",
                  artisan: "Glow Artisan",
                  rating: 4.8,
                  sales: 92,
                },
                {
                  id: "PRD-4567",
                  name: "Macrame Wall Hanging",
                  artisan: "Knot & Fiber",
                  rating: 4.7,
                  sales: 54,
                },
                {
                  id: "PRD-5678",
                  name: "Hand-Carved Wooden Bowl",
                  artisan: "Forest Crafts",
                  rating: 4.7,
                  sales: 47,
                },
              ].map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border-b pb-2 pt-2"
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.artisan}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="font-medium">{product.rating}</span>
                    <span className="text-sm text-gray-500 ml-3">
                      {product.sales} sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
