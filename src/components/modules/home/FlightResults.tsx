'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plane, ChevronDown, ChevronUp } from 'lucide-react';

interface FlightOffer {
  id: string;
  price: { total: string; currency: string };
  itineraries: Array<{ segments: Array<{ departure: { iataCode: string; at: string }; arrival: { iataCode: string; at: string }; carrierCode: string; duration: string }> }>;
}

interface FlightResultsProps {
  flights?: FlightOffer[];
  loading?: boolean;
}

export function FlightResults({ flights = [], loading = false }: FlightResultsProps) {
  const [displayedFlights, setDisplayedFlights] = useState<FlightOffer[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(0); // Start with 0
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const itemsPerLoad = 10;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayedFlights(flights);

    const initialCount = flights.length <= itemsPerLoad ? flights.length : itemsPerLoad;
    setVisibleCount(initialCount);
  }, [flights]);

  const flightsToShow = displayedFlights.slice(0, visibleCount);
  const hasMoreFlights = visibleCount < displayedFlights.length;

  const formatDuration = (d: string) => {
    const m = d.match(/PT(\d+H)?(\d+M)?/);
    return `${m?.[1]?.replace('H', '') || 0}h ${m?.[2]?.replace('M', '') || 0}m`;
  };

  const formatTime = (t: string) =>
    new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Searching flights…</p>
        </CardContent>
      </Card>
    );
  }

  if (!displayedFlights.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Plane className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 font-medium">No flights found</p>
          <p className="text-sm text-muted-foreground">Try different dates or routes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Available Flights</h2>
        <Badge variant="outline">{flightsToShow.length} / {displayedFlights.length}</Badge>
      </div>

      <div className="space-y-3">
        {flightsToShow.map((flight) => {
          const segments = flight.itineraries[0].segments;
          const first = segments[0];
          const last = segments[segments.length - 1];
          const isExpanded = expanded[flight.id];

          return (
            <Card key={flight.id} className="hover:shadow-md transition">
              <CardContent className="p-4 space-y-3">

                {/* Top Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">

                  {/* Airline */}
                  <div className="text-sm font-medium">
                    ✈ {first.carrierCode}
                    <p className="text-xs text-muted-foreground">
                      Flight {segments.map(s => s.carrierCode).join(' → ')}
                    </p>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold">{formatTime(first.departure.at)}</p>
                      <p className="text-xs text-muted-foreground">{first.departure.iataCode}</p>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-col items-center">
                      <Clock className="h-4 w-4" />
                      {formatDuration(first.duration)}
                    </div>
                    <div>
                      <p className="font-semibold">{formatTime(last.arrival.at)}</p>
                      <p className="text-xs text-muted-foreground">{last.arrival.iataCode}</p>
                    </div>
                  </div>

                  {/* Stops */}
                  <div className="text-sm text-muted-foreground text-center">
                    {segments.length === 1 ? 'Direct' : `${segments.length - 1} stop`}
                  </div>

                  {/* Price */}
                  <div className="flex justify-between md:justify-end items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">${flight.price.total}</p>
                      <p className="text-xs text-muted-foreground">{flight.price.currency}</p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">Select</Button>
                  </div>
                </div>

                {/* Expand */}
                {segments.length > 1 && (
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, [flight.id]: !prev[flight.id] }))}
                    className="flex items-center gap-2 text-sm text-green-600 hover:underline"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isExpanded ? 'Hide itinerary' : 'View itinerary'}
                  </button>
                )}

                {/* Expanded Itinerary */}
                {isExpanded && (
                  <div className="border-t pt-3 space-y-2 text-sm">
                    {segments.map((s, i) => (
                      <div key={i} className="flex justify-between text-muted-foreground">
                        <span>{s.departure.iataCode} → {s.arrival.iataCode}</span>
                        <span>{formatTime(s.departure.at)} – {formatTime(s.arrival.at)} • {formatDuration(s.duration)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hasMoreFlights && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => setVisibleCount(prev => Math.min(prev + itemsPerLoad, displayedFlights.length))}>
            Show more flights
          </Button>
        </div>
      )}
    </div>
  );
}
