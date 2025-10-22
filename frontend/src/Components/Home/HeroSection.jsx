import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

const HeroSection = ({
  title = "Discover Unique Handcrafted Treasures",
  subtitle = "Connect directly with skilled artisans and bring their one-of-a-kind creations into your home.",
  onCtaClick = () => {},
  slides = [
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=1200&q=80",
      title: "Handcrafted Ceramics",
      artisan: "Sarah's Pottery",
    },
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=1200&q=80",
      title: "Artisan Jewelry",
      artisan: "Copper & Stone",
    },
    {
      id: "3",
      image:
        "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&q=80",
      title: "Handwoven Textiles",
      artisan: "Mountain Weavers",
    },
    {
      id: "4",
      image:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=80",
      title: "Wooden Home Decor",
      artisan: "Forest Crafts",
    },
  ],
}) => {
  return (
    <section className="w-full h-[400px] sm:h-[450px] md:h-[500px] relative overflow-hidden bg-gray-50">
      {/* Hero Carousel */}
      <div className="absolute inset-0 w-full h-full">
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full">
            {slides.map((slide) => (
              <CarouselItem key={slide.id} className="h-full">
                <div className="relative w-full h-full">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-contain object-center"
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 text-white">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{slide.title}</h3>
                    <p className="text-xs sm:text-sm opacity-90">by {slide.artisan}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 sm:left-4 z-10 w-8 h-8 sm:w-10 sm:h-10" />
          <CarouselNext className="right-2 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10" />
        </Carousel>
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[700px]">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            {title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            className="text-sm sm:text-base font-medium bg-[#a47c68] hover:bg-[#8c6957] text-white w-full sm:w-auto px-6 sm:px-8"
            asChild
          >
            <Link
              to="/products"
              onClick={onCtaClick}
              className="flex items-center justify-center !text-white"
            >
              Explore Products
              <ArrowRight className="ml-2 h-4 w-4 !text-white" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
