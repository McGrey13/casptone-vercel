import React, { useEffect, useState } from "react";
import api from "../../api";
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
  autoAdvanceMs = 12000,
  fetchEvents = true,
}) => {
  const [emblaApi, setEmblaApi] = useState(null);
  const [eventSlides, setEventSlides] = useState([]);

  const ensureAbsoluteUrl = (url) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    // If it's a storage path, prefix with backend base (without /api)
    const backend = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/?api\/?$/, '');
    if (backend) {
      if (url.startsWith('/storage/') || url.startsWith('storage/')) {
        return `${backend}${url.startsWith('/') ? '' : '/'}${url}`;
      }
      return `${backend}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url;
  };

  useEffect(() => {
    if (!emblaApi || !autoAdvanceMs) return;
    const id = setInterval(() => {
      emblaApi.scrollNext();
    }, autoAdvanceMs);
    return () => clearInterval(id);
  }, [emblaApi, autoAdvanceMs]);

  // Fetch workshops & events for hero when enabled
  useEffect(() => {
    if (!fetchEvents) return;
    const load = async () => {
      try {
        const res = await api.get('/work-and-events/public');
        const payload = res?.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.work_and_events)
          ? payload.work_and_events
          : [];
        const normalized = list.map((e, idx) => ({
          id: e.id || e.works_and_events_id || `ev-${idx}`,
          image: ensureAbsoluteUrl(e.cover_image || e.image_url || e.image) || "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=1200&q=80",
          title: e.title || e.name || 'Workshop / Event',
          subtitle: `${e.date ? new Date(e.date).toLocaleDateString() : ''}${e.location ? ` • ${e.location}` : ''}`,
        }));
        if (normalized.length > 0) {
          setEventSlides(normalized);
        } else {
          // Debug helper for development
          // console.warn('HeroSection: No events returned from API', payload);
        }
      } catch (_) {
        // silently fallback to default slides
      }
    };
    load();
  }, [fetchEvents]);
  return (
    <section className="w-full h-[400px] sm:h-[450px] md:h-[500px] relative overflow-hidden bg-gray-50">
      {/* Hero Carousel */}
      <div className="absolute inset-0 w-full h-full">
        <Carousel className="w-full h-full" setApi={setEmblaApi} opts={{ loop: true }}>
          <CarouselContent className="h-full">
            {(eventSlides.length ? eventSlides : slides).map((slide) => (
              <CarouselItem key={slide.id} className="h-full">
                <div className="relative w-full h-full">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 text-white">
                    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-lg inline-block max-w-[90%]">
                      <h3 className="text-lg sm:text-2xl font-bold leading-snug">{slide.title}</h3>
                      {slide.subtitle && (
                        <p className="text-xs sm:text-sm opacity-90 mt-1">{slide.subtitle}</p>
                      )}
                    </div>
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
