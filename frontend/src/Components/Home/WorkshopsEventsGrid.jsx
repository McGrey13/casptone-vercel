import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import api from "../../api";

const WorkshopsEventsGrid = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/work-and-events/public');
        const payload = response?.data;
        
        // Handle different response structures
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.work_and_events)
          ? payload.work_and_events
          : [];
        
        // Filter only upcoming events (excluding cancelled and completed)
        const upcomingWorkshops = list.filter(w => 
          w.status === 'upcoming' || 
          w.status === 'in-progress' || 
          w.status === 'ongoing'
        );
        setWorkshops(upcomingWorkshops.slice(0, 6)); // Limit to 6 for homepage
      } catch (err) {
        console.error("Error fetching workshops:", err);
        setError(err.message);
        setWorkshops([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkshops();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="w-full bg-[#fefefe] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a4785a] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || workshops.length === 0) {
    return null; // Don't show section if no workshops
  }

  return (
    <div className="w-full bg-gradient-to-b from-[#fefefe] to-[#f5f0eb] py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#5c3d28] mb-3">
            Upcoming Workshops & Events
          </h2>
          <p className="text-base md:text-lg text-[#7b5a3b] max-w-2xl mx-auto">
            Join our community workshops and learn from talented artisans
          </p>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <Link
              to={workshop.link || '#'}
              target={workshop.link ? '_blank' : '_self'}
              rel="noopener noreferrer"
              key={workshop.works_and_events_id || workshop.id}
              className="block transition-transform hover:scale-105"
            >
              <Card className="overflow-hidden h-full border-2 border-[#d5bfae] shadow-md hover:shadow-xl transition-all duration-300">
                <div 
                  className="relative h-48 overflow-hidden bg-gray-100"
                  style={{ 
                    backgroundImage: `url(${workshop.image_url || workshop.image || '/placeholder-workshop.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute top-2 right-2">
                    <span className="bg-[#a4785a] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      {workshop.status === 'upcoming' ? 'Upcoming' : 'In Progress'}
                    </span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg text-[#5c3d28] mb-3 line-clamp-2">
                    {workshop.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#7b5a3b]">
                      <Calendar className="w-4 h-4 text-[#a4785a]" />
                      <span>{formatDate(workshop.date)}</span>
                    </div>
                    {workshop.time && (
                      <div className="flex items-center gap-2 text-sm text-[#7b5a3b]">
                        <Clock className="w-4 h-4 text-[#a4785a]" />
                        <span>{workshop.time}</span>
                      </div>
                    )}
                    {workshop.location && (
                      <div className="flex items-center gap-2 text-sm text-[#7b5a3b]">
                        <MapPin className="w-4 h-4 text-[#a4785a]" />
                        <span className="line-clamp-1">{workshop.location}</span>
                      </div>
                    )}
                    {workshop.participants && (
                      <div className="flex items-center gap-2 text-sm text-[#7b5a3b]">
                        <Users className="w-4 h-4 text-[#a4785a]" />
                        <span>{workshop.participants} spots available</span>
                      </div>
                    )}
                  </div>

                  {workshop.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {workshop.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-[#a4785a] font-medium">
                    <span>Learn More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkshopsEventsGrid;

