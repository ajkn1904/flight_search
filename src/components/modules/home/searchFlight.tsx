/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Users, Loader2, Plane, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getAirportSuggestions, searchFlights } from '@/lib/amadeus';
import type { Location, Passengers, SelectedLocation } from '@/components/types';
import { Badge } from '@/components/ui/badge';
import { LocationSelector } from '@/components/utility/locationSelector';
import { DateSelector } from '@/components/utility/dateSelector';
import { FlightResults } from './FlightResults';

export function SearchFlight() {
    const INITIAL_PASSENGERS: Passengers = {
        adults: 1,
        children: 0,
        infants: 0,
    };

    const [from, setFrom] = useState<SelectedLocation | null>(null);
    const [to, setTo] = useState<SelectedLocation | null>(null);
    const [departureDate, setDepartureDate] = useState<Date>();
    const [returnDate, setReturnDate] = useState<Date>();
    const [tripType, setTripType] = useState<'round' | 'one-way'>('round');
    const [passengers, setPassengers] = useState<Passengers>(INITIAL_PASSENGERS);
    const [travelClass, setTravelClass] = useState<string>('ECONOMY');
    const [fromSearch, setFromSearch] = useState('');
    const [toSearch, setToSearch] = useState('');
    const [fromLocations, setFromLocations] = useState<Location[]>([]);
    const [toLocations, setToLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [fromOpen, setFromOpen] = useState(false);
    const [toOpen, setToOpen] = useState(false);
    const [flightData, setFlightData] = useState<any[]>([]);

    const FLIGHT_CLASSES = [
        { value: 'ECONOMY', label: 'Economy' },
        { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
        { value: 'BUSINESS', label: 'Business' },
        { value: 'FIRST', label: 'First Class' },
    ];

    const POPULAR_FLIGHTS = [
        { from: 'NYC', to: 'LAX', label: 'New York → Los Angeles' },
        { from: 'LON', to: 'PAR', label: 'London → Paris' },
        { from: 'DXB', to: 'TYO', label: 'Dubai → Tokyo' },
        { from: 'LAX', to: 'MIA', label: 'Los Angeles → Miami' },
    ];

    useEffect(() => {
        const searchLocations = async (query: string, setResults: (locations: Location[]) => void) => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            try {
                const data = await getAirportSuggestions(query);
                const filtered = data.filter(
                    (l: Location) => l.subType === 'CITY' || l.subType === 'AIRPORT'
                );
                setResults(filtered);
            } catch {
                setResults([]);
            }
        };

        const fromTimer = setTimeout(() => {
            searchLocations(fromSearch, setFromLocations);
        }, 300);

        const toTimer = setTimeout(() => {
            searchLocations(toSearch, setToLocations);
        }, 300);

        return () => {
            clearTimeout(fromTimer);
            clearTimeout(toTimer);
        };
    }, [fromSearch, toSearch]);


const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!from || !to || !departureDate) {
    alert('Please fill in all required fields');
    return;
  }

  setLoading(true);

  try {
    const res = await searchFlights({
      originLocationCode: from.cityCode,
      destinationLocationCode: to.cityCode,
      departureDate: format(departureDate, 'yyyy-MM-dd'),
      returnDate: returnDate ? format(returnDate, 'yyyy-MM-dd') : undefined,
      adults: passengers.adults,
      children: passengers.children || undefined,
      infants: passengers.infants || undefined,
      travelClass,
      currencyCode: 'USD',
      max: 50 
    });

    const flights = res?.data || [];
    console.log('Search results:', flights); 
    setFlightData(flights);
  } catch {
    alert('Search failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

    const createSelectedLocation = (location: Location): SelectedLocation => {
        const cityCode =
            location.address.cityCode || location.iataCode;

        return {
            cityCode,
            cityName: location.address.cityName,
            countryCode: location.address.countryCode,
            displayName: `${location.address.cityName}, ${location.address.countryName} (${cityCode})`
        };
    };

    const updatePassengerCount = (type: keyof Passengers, delta: number) => {
        setPassengers(prev => ({
            ...prev,
            [type]: Math.max(type === 'adults' ? 1 : 0, prev[type] + delta)
        }));
    };

    const getTotalPassengers = () =>
        passengers.adults + passengers.children + passengers.infants;

    return (
        <>
            <Card className="w-full">
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            {/* trip Type */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <ArrowRightLeft className="h-4 w-4" />Trip Type
                                </Label>
                                <div className="flex gap-2">
                                    <Button type="button" variant={tripType === 'round' ? 'default' : 'outline'} className={cn('flex-1', tripType === 'round' && 'bg-primary hover:bg-green-600')} onClick={() => setTripType('round')} >
                                        Round Trip
                                    </Button>
                                    <Button type="button" variant={tripType === 'one-way' ? 'default' : 'outline'} className={cn('flex-1', tripType === 'one-way' && 'bg-primary hover:bg-green-600')} onClick={() => setTripType('one-way')}>
                                        One Way
                                    </Button>
                                </div>
                            </div>

                            {/* passengers */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />Passengers
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-9 w-full justify-start gap-2">
                                            <Users className="h-4 w-4" />
                                            <span>{getTotalPassengers()} Passenger(s)</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="space-y-4">
                                            {[{ key: 'adults' as const, label: 'Adults', description: 'Age 12+' }, { key: 'children' as const, label: 'Children', description: 'Age 2-11' }, { key: 'infants' as const, label: 'Infants', description: 'Under 2' }].map(({ key, label, description }) => (
                                                <div key={key} className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{label}</p>
                                                        <p className="text-sm text-muted-foreground">{description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Button type="button" variant="outline" size="icon" onClick={() => updatePassengerCount(key, -1)} >-</Button>
                                                        <span className="w-8 text-center">{passengers[key]}</span>
                                                        <Button type="button" variant="outline" size="icon" onClick={() => updatePassengerCount(key, 1)}>+</Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Class type */}
                            <div className="flex-1 space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Plane className="h-4 w-4" />Class *
                                </Label>
                                <Select value={travelClass} onValueChange={setTravelClass}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FLIGHT_CLASSES.map((flightClass) => (
                                            <SelectItem key={flightClass.value} value={flightClass.value}>
                                                {flightClass.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* location & date */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <LocationSelector label="From *" value={from} search={fromSearch} onSearchChange={setFromSearch} locations={fromLocations} open={fromOpen} onOpenChange={setFromOpen} onSelect={(location) => { setFrom(createSelectedLocation(location)); setFromOpen(false); }} />

                            <LocationSelector label="To *" value={to} search={toSearch} onSearchChange={setToSearch} locations={toLocations} open={toOpen} onOpenChange={setToOpen} onSelect={(location) => { setTo(createSelectedLocation(location)); setToOpen(false); }} />

                            <DateSelector label="Departure *" date={departureDate} onDateChange={setDepartureDate} />

                            <DateSelector label="Return" date={returnDate} onDateChange={setReturnDate} disabled={tripType === 'one-way'} />
                        </div>

                        {/* search */}
                        <Button type="submit" className="h-12 w-full bg-primary hover:bg-green-600 md:w-auto" size="lg" disabled={loading || !from || !to || !departureDate}
                        > {loading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />Searching...</>
                        ) : (
                            <>Search Flights</>
                        )}
                        </Button>



                        {/* popular */}
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Popular flights:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {POPULAR_FLIGHTS.map((route) => (
                                    <Badge
                                        key={`${route.from}-${route.to}`}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-muted"
                                        onClick={() => {

                                            setFrom({
                                                cityCode: route.from, cityName: route.from === 'DAC' ? 'Dhaka' : 'City', countryCode: route.from === 'DAC' ? 'BD' : 'US',
                                                displayName: route.label.split('→')[0].trim()
                                            });
                                            setTo({
                                                cityCode: route.to,
                                                cityName: route.to === 'DXB' ? 'Dubai' : 'City',
                                                countryCode: route.to === 'DXB' ? 'AE' : 'US',
                                                displayName: route.label.split('→')[1].trim()
                                            });
                                        }}
                                    >
                                        {route.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            {flightData.length > 0 && (
                <FlightResults flights={flightData} loading={loading} />
            )}
        </>
    );
}