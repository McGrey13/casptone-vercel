import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
// Places (categories)
const categories = [
  { id: "1", name: "Alaminos" },
  { id: "2", name: "Bay" },
  { id: "3", name: "Biñan" },
  { id: "4", name: "Calamba" },
  { id: "5", name: "Calauan" },
  { id: "6", name: "Cavinti" },
  { id: "7", name: "Famy" },
  { id: "8", name: "Los Baños" },
  { id: "9", name: "Luisiana" },
  { id: "10", name: "Lumban" },
  { id: "11", name: "Magdalena" },
  { id: "12", name: "Majayjay" },
  { id: "13", name: "Nagcarlan" },
  { id: "14", name: "Paete" },
  { id: "15", name: "Pagsanjan" },
  { id: "16", name: "Pakil" },
  { id: "17", name: "Pangil" },
  { id: "18", name: "San Pablo" },
  { id: "19", name: "Santa Cruz" },
  { id: "20", name: "Siniloan" },
  { id: "21", name: "Victoria" },
];

// Product categories - Updated with the full list from the user
const productCategories = [
  { id: "cat-1", name: "Woodcrafts" },
  { id: "cat-2", name: "Textiles" },
  { id: "cat-3", name: "Jewelry" },
  { id: "cat-4", name: "Paper Crafts" },
  { id: "cat-5", name: "Accessories" },
  { id: "cat-6", name: "Home Décor" },
  { id: "cat-7", name: "Hand-painted Art" },
  { id: "cat-8", name: "Footwear" },
  { id: "cat-9", name: "Wood Carving" },
  { id: "cat-10", name: "Pottery" },
  { id: "cat-11", name: "Abaca Weaving" },
  { id: "cat-12", name: "Rattan/Bamboo Crafts" },
  { id: "cat-13", name: "Coconut Crafts" },
  { id: "cat-14", name: "Waterlily Crafts" },
  { id: "cat-15", name: "Embroidery" },
  { id: "cat-16", name: "Basket Weaving" },
  { id: "cat-17", name: "Metal Crafts" },
  { id: "cat-18", name: "Musical Instruments" },
  { id: "cat-19", name: "Toys" },
  { id: "cat-20", name: "Figurines" },
  { id: "cat-21", name: "Upcycled Crafts" },
  { id: "cat-22", name: "Soap Making" },
  { id: "cat-23", name: "Candle Making" },
];

// Products with placeId and categoryId - Updated to match the new categories
const products = [
  // Products from Alaminos
  {
    id: "prod-1",
    title: "Hand-Woven Basket",
    categoryId: "cat-16", // Basket Weaving
    placeId: "1", // Alaminos
    price: 15.00,
    image: "https://placehold.co/400x400/1e88e5/ffffff?text=Alaminos+Basket",
  },
  {
    id: "prod-2",
    title: "Ceramic Planter",
    categoryId: "cat-10", // Pottery
    placeId: "1", // Alaminos
    price: 35.50,
    image: "https://placehold.co/400x400/9ccc65/000000?text=Alaminos+Ceramic",
  },
  // Products from Bay
  {
    id: "prod-3",
    title: "Bamboo Wind Chime",
    categoryId: "cat-12", // Rattan/Bamboo Crafts
    placeId: "2", // Bay
    price: 20.00,
    image: "https://placehold.co/400x400/ffb300/000000?text=Bay+Wind+Chime",
  },
  {
    id: "prod-4",
    title: "Hand-painted Gourd Art",
    categoryId: "cat-7", // Hand-painted Art
    placeId: "2", // Bay
    price: 28.75,
    image: "https://placehold.co/400x400/d81b60/ffffff?text=Bay+Gourd",
  },
  // Products from Biñan
  {
    id: "prod-5",
    title: "Hand-Sewn Barong Tagalog",
    categoryId: "cat-15", // Embroidery
    placeId: "3", // Biñan
    price: 150.00,
    image: "https://placehold.co/400x400/8e24aa/ffffff?text=Biñan+Barong",
  },
  {
    id: "prod-6",
    title: "Traditional Slippers (Bakya)",
    categoryId: "cat-8", // Footwear
    placeId: "3", // Biñan
    price: 22.50,
    image: "https://placehold.co/400x400/00897b/ffffff?text=Biñan+Bakya",
  },
  // Products from Calamba
  {
    id: "prod-7",
    title: "Miniature Rizal Shrine Model",
    categoryId: "cat-9", // Wood Carving
    placeId: "4", // Calamba
    price: 45.00,
    image: "https://placehold.co/400x400/42a5f5/ffffff?text=Calamba+Rizal",
  },
  {
    id: "prod-8",
    title: "Ceramic Taal Lake-Inspired Mug",
    categoryId: "cat-10", // Pottery
    placeId: "4", // Calamba
    price: 24.99,
    image: "https://placehold.co/400x400/66bb6a/ffffff?text=Calamba+Mug",
  },
  // Products from Calauan
  {
    id: "prod-9",
    title: "Pineapple Fiber Wallet",
    categoryId: "cat-2", // Textiles
    placeId: "5", // Calauan
    price: 30.00,
    image: "https://placehold.co/400x400/ffeb3b/000000?text=Calauan+Wallet",
  },
  {
    id: "prod-10",
    title: "Wood-Carved Pineapple",
    categoryId: "cat-9", // Wood Carving
    placeId: "5", // Calauan
    price: 18.00,
    image: "https://placehold.co/400x400/ff5722/ffffff?text=Calauan+Pineapple",
  },
  // Products from Cavinti
  {
    id: "prod-11",
    title: "Woven Abaca Placemat",
    categoryId: "cat-11", // Abaca Weaving
    placeId: "6", // Cavinti
    price: 12.00,
    image: "https://placehold.co/400x400/5c6bc0/ffffff?text=Cavinti+Placemat",
  },
  {
    id: "prod-12",
    title: "Bamboo Tea Box",
    categoryId: "cat-12", // Rattan/Bamboo Crafts
    placeId: "6", // Cavinti
    price: 25.00,
    image: "https://placehold.co/400x400/ab47bc/ffffff?text=Cavinti+Tea+Box",
  },
  // Products from Famy
  {
    id: "prod-13",
    title: "Hand-painted Landscape Canvas",
    categoryId: "cat-7", // Hand-painted Art
    placeId: "7", // Famy
    price: 75.00,
    image: "https://placehold.co/400x400/4db6ac/ffffff?text=Famy+Painting",
  },
  {
    id: "prod-14",
    title: "Ceramic Famy River Plate",
    categoryId: "cat-10", // Pottery
    placeId: "7", // Famy
    price: 32.50,
    image: "https://placehold.co/400x400/8d6e63/ffffff?text=Famy+Plate",
  },
  // Products from Los Baños
  {
    id: "prod-15",
    title: "Los Baños T-Shirt",
    categoryId: "cat-2", // Textiles
    placeId: "8", // Los Baños
    price: 18.00,
    image: "https://placehold.co/400x400/ffca28/000000?text=Los+Baños+Shirt",
  },
  {
    id: "prod-16",
    title: "Handmade Scented Candle",
    categoryId: "cat-23", // Candle Making
    placeId: "8", // Los Baños
    price: 15.75,
    image: "https://placehold.co/400x400/ffa000/000000?text=Los+Baños+Candle",
  },
  // Products from Luisiana
  {
    id: "prod-17",
    title: "Hand-braided Buri Hat",
    categoryId: "cat-16", // Basket Weaving
    placeId: "9", // Luisiana
    price: 20.00,
    image: "https://placehold.co/400x400/b71c1c/ffffff?text=Luisiana+Hat",
  },
  {
    id: "prod-18",
    title: "Coconut Shell Lamp",
    categoryId: "cat-13", // Coconut Crafts
    placeId: "9", // Luisiana
    price: 40.00,
    image: "https://placehold.co/400x400/c2185b/ffffff?text=Luisiana+Lamp",
  },
  // Products from Lumban
  {
    id: "prod-19",
    title: "Embroidered Table Runner",
    categoryId: "cat-15", // Embroidery
    placeId: "10", // Lumban
    price: 55.00,
    image: "https://placehold.co/400x400/6a1b9a/ffffff?text=Lumban+Embroidery",
  },
  {
    id: "prod-20",
    title: "Lace Fan (Abaniko)",
    categoryId: "cat-15", // Embroidery
    placeId: "10", // Lumban
    price: 30.00,
    image: "https://placehold.co/400x400/388e3c/ffffff?text=Lumban+Fan",
  },
  // Products from Magdalena
  {
    id: "prod-21",
    title: "Handmade Necklace",
    categoryId: "cat-3", // Jewelry
    placeId: "11", // Magdalena
    price: 45.00,
    image: "https://placehold.co/400x400/00acc1/ffffff?text=Magdalena+Necklace",
  },
  {
    id: "prod-22",
    title: "Leather Wallet",
    categoryId: "cat-5", // Accessories
    placeId: "11", // Magdalena
    price: 60.00,
    image: "https://placehold.co/400x400/1e88e5/ffffff?text=Magdalena+Wallet",
  },
  // Products from Majayjay
  {
    id: "prod-23",
    title: "Water Hyacinth Bag",
    categoryId: "cat-14", // Waterlily Crafts
    placeId: "12", // Majayjay
    price: 50.00,
    image: "https://placehold.co/400x400/ffb300/000000?text=Majayjay+Bag",
  },
  {
    id: "prod-24",
    title: "Wood-Carved Santo",
    categoryId: "cat-9", // Wood Carving
    placeId: "12", // Majayjay
    price: 120.00,
    image: "https://placehold.co/400x400/d81b60/ffffff?text=Majayjay+Santo",
  },
  // Products from Nagcarlan
  {
    id: "prod-25",
    title: "Ceramic Burial Jar",
    categoryId: "cat-10", // Pottery
    placeId: "13", // Nagcarlan
    price: 85.00,
    image: "https://placehold.co/400x400/8e24aa/ffffff?text=Nagcarlan+Jar",
  },
  {
    id: "prod-26",
    title: "Woven Mat (Banig)",
    categoryId: "cat-16", // Basket Weaving
    placeId: "13", // Nagcarlan
    price: 35.00,
    image: "https://placehold.co/400x400/00897b/ffffff?text=Nagcarlan+Banig",
  },
  // Products from Paete
  {
    id: "prod-27",
    title: "Wooden Carved Horse",
    categoryId: "cat-9", // Wood Carving
    placeId: "14", // Paete
    price: 75.00,
    image: "https://placehold.co/400x400/42a5f5/ffffff?text=Paete+Carving",
  },
  {
    id: "prod-28",
    title: "Hand-Painted Paper Fan",
    categoryId: "cat-4", // Paper Crafts
    placeId: "14", // Paete
    price: 15.00,
    image: "https://placehold.co/400x400/66bb6a/ffffff?text=Paete+Fan",
  },
  // Products from Pagsanjan
  {
    id: "prod-29",
    title: "Pagsanjan Rapids Souvenir Shirt",
    categoryId: "cat-2", // Textiles
    placeId: "15", // Pagsanjan
    price: 20.00,
    image: "https://placehold.co/400x400/ffeb3b/000000?text=Pagsanjan+Shirt",
  },
  {
    id: "prod-30",
    title: "Bamboo Flute",
    categoryId: "cat-18", // Musical Instruments
    placeId: "15", // Pagsanjan
    price: 12.50,
    image: "https://placehold.co/400x400/ff5722/ffffff?text=Pagsanjan+Flute",
  },
  // Products from Pakil
  {
    id: "prod-31",
    title: "Hand-Carved Wooden Figure",
    categoryId: "cat-9", // Wood Carving
    placeId: "16", // Pakil
    price: 80.00,
    image: "https://placehold.co/400x400/5c6bc0/ffffff?text=Pakil+Figure",
  },
  {
    id: "prod-32",
    title: "Paper Parol",
    categoryId: "cat-4", // Paper Crafts
    placeId: "16", // Pakil
    price: 18.00,
    image: "https://placehold.co/400x400/ab47bc/ffffff?text=Pakil+Parol",
  },
  // Products from Pangil
  {
    id: "prod-33",
    title: "Woven Abaca Slippers",
    categoryId: "cat-8", // Footwear
    placeId: "17", // Pangil
    price: 25.00,
    image: "https://placehold.co/400x400/4db6ac/ffffff?text=Pangil+Slippers",
  },
  {
    id: "prod-34",
    title: "Hand-made Clay Pot",
    categoryId: "cat-10", // Pottery
    placeId: "17", // Pangil
    price: 35.00,
    image: "https://placehold.co/400x400/8d6e63/ffffff?text=Pangil+Pot",
  },
  // Products from San Pablo
  {
    id: "prod-35",
    title: "Coconut Shell Bowl",
    categoryId: "cat-13", // Coconut Crafts
    placeId: "18", // San Pablo
    price: 20.00,
    image: "https://placehold.co/400x400/ffca28/000000?text=San+Pablo+Bowl",
  },
  {
    id: "prod-36",
    title: "Hand-loomed Textile",
    categoryId: "cat-2", // Textiles
    placeId: "18", // San Pablo
    price: 45.00,
    image: "https://placehold.co/400x400/ffa000/000000?text=San+Pablo+Textile",
  },
  // Products from Santa Cruz
  {
    id: "prod-37",
    title: "Batik Cloth",
    categoryId: "cat-2", // Textiles
    placeId: "19", // Santa Cruz
    price: 30.00,
    image: "https://placehold.co/400x400/b71c1c/ffffff?text=Santa+Cruz+Batik",
  },
  {
    id: "prod-38",
    title: "Bamboo Flute",
    categoryId: "cat-18", // Musical Instruments
    placeId: "19", // Santa Cruz
    price: 12.50,
    image: "https://placehold.co/400x400/c2185b/ffffff?text=Santa+Cruz+Flute",
  },
  // Products from Siniloan
  {
    id: "prod-39",
    title: "Wooden Jewelry Box",
    categoryId: "cat-9", // Wood Carving
    placeId: "20", // Siniloan
    price: 50.00,
    image: "https://placehold.co/400x400/6a1b9a/ffffff?text=Siniloan+Jewelry+Box",
  },
  {
    id: "prod-40",
    title: "Hand-painted Landscape Canvas",
    categoryId: "cat-7", // Hand-painted Art
    placeId: "20", // Siniloan
    price: 75.00,
    image: "https://placehold.co/400x400/388e3c/ffffff?text=Siniloan+Painting",
  },
  // Products from Victoria
  {
    id: "prod-41",
    title: "Duck-themed Ceramic",
    categoryId: "cat-10", // Pottery
    placeId: "21", // Victoria
    price: 25.00,
    image: "https://placehold.co/400x400/00acc1/ffffff?text=Victoria+Ceramic",
  },
  {
    id: "prod-42",
    title: "Woven Abaca Table Runner",
    categoryId: "cat-11", // Abaca Weaving
    placeId: "21", // Victoria
    price: 30.00,
    image: "https://placehold.co/400x400/1e88e5/ffffff?text=Victoria+Table+Runner",
  },
];


const CategoryProducts = () => {
  const { id } = useParams();

  const category = categories.find((cat) => cat.id === id);
  const filteredProducts = products.filter((prod) => prod.placeId === id);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg font-semibold text-red-600 mb-4">Category not found.</p>
        <Link to="/" className="text-[#a4785a] underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <Link
          to="/"
          className="inline-block mb-8 text-[#a4785a] hover:text-[#7a5c44] transition-colors font-semibold"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-center">{category.name} Products</h1>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-600 text-lg italic">
            No products available for {category.name}.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const productCategory = productCategories.find((c) => c.id === product.categoryId);

              return (
                <Card
                  key={product.id}
                  className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <CardContent className="p-5">
                    <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
                    <p className="text-gray-600 mb-1">Category: {productCategory?.name || "N/A"}</p>
                    <p className="text-gray-600 mb-3">Place: {category.name}</p>
                    <p className="text-lg font-bold text-[#a4785a]">₱{product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
