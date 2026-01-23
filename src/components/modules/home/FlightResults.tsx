import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plane, ChevronDown, ChevronUp } from 'lucide-react';
import type { FlightOffer, FlightResultsProps } from '@/components/types';
import { Separator } from '@/components/ui/separator';

export function FlightResults({ flights = [], loading = false }: FlightResultsProps) {
  const [displayedFlights, setDisplayedFlights] = useState<FlightOffer[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const itemsPerLoad = 10;



useEffect(() => {
  const filteredFlights = flights; 
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setDisplayedFlights(filteredFlights);
  const initialCount = filteredFlights.length <= itemsPerLoad ? filteredFlights.length : itemsPerLoad;
  setVisibleCount(initialCount);
}, [flights]); 


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
      <Card className='rounded-md'>
        <CardContent className="py-48 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Searching flights…</p>
        </CardContent>
      </Card>
    );
  }

  if (!displayedFlights.length) {
    return (
      <Card className='rounded-md'>
        <CardContent className="py-48 text-center">
          <Plane className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 font-medium">No flights found</p>
          <p className="text-sm text-muted-foreground">Try different dates or routes or adjust filter</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-md min-h-114">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center p-5">
        <h2 className="text-2xl font-semibold dark:text-white uppercase">Available Flights</h2>
        <Badge variant="outline" className='bg-white dark:bg-gray-900'>
          Show {flightsToShow.length} of {displayedFlights.length} flights
        </Badge>
      </div>

      {/* Flight Cards */}
      <div className="">
        {flightsToShow.map((flight) => {
          const segments = flight.itineraries[0].segments;
          const first = segments[0];
          const last = segments[segments.length - 1];
          const isExpanded = expanded[flight.id];

          return (
            <Card key={flight.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-primary hover:shadow-md transition px-3 py-6 rounded-none border-y-primary">
              <CardContent>

                {/* Flight Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center">

                  {/* Airline */}
                  <div className="text-sm font-medium flex gap-2">
                    ✈ {first.carrierCode}
                    <p className="text-xs text-muted-foreground truncate">
                      Flight {segments.map(s => s.carrierCode).join(' → ')}
                    </p>
                  </div>


                  {/* Route */}
                  <div className="flex items-center gap-2 justify-between w-full">
                    <div className="text-center">
                      <p className="font-semibold">{formatTime(first.departure.at)}</p>
                      <p className="text-xs text-muted-foreground">{first.departure.iataCode}</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1">{formatDuration(first.duration)}</p>
                    </div>

                    <div className="text-center">
                      <p className="font-semibold">{formatTime(last.arrival.at)}</p>
                      <p className="text-xs text-muted-foreground">{last.arrival.iataCode}</p>
                    </div>
                  </div>

                  {/* Stops */}
                  <div className="text-sm text-muted-foreground text-center">
                    {segments.length === 1 ? 'Direct' : `${segments.length - 1} stop`}
                  </div>

                  <Separator className='md:hidden' />

                  {/* Price & Action */}
                  <div className="flex justify-between items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">${flight.price.total}</p>
                      <p className="text-xs text-muted-foreground">{flight.price.currency}</p>
                    </div>
                    <Button className="bg-primary hover:bg-green-600 min-w-20 text-sm py-1">Select</Button>
                  </div>
                </div>

                {/* Expand */}
                {segments.length > 1 && (
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, [flight.id]: !prev[flight.id] }))}
                    className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline mt-1"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isExpanded ? 'Hide segment' : 'View segment'}
                  </button>
                )}

                {/* Expanded Itinerary */}
                {isExpanded && (
                  <div className="border-t pt-2 mt-2 space-y-1 text-sm text-muted-foreground">
                    {segments.map((s, i) => (
                      <div key={i} className="flex flex-col justify-between gap-1">
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
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={() => setVisibleCount(prev => Math.min(prev + itemsPerLoad, displayedFlights.length))}
          >
            Show more flights
          </Button>
        </div>
      )}
    </div>
  );
}
