/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { Users, Loader2, Plane, ArrowRightLeft, BarChart2, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getAirportSuggestions, searchFlights } from '@/lib/amadeus';
import type { Location, Passengers, SelectedLocation } from '@/components/types';
import { LocationSelector } from '@/components/utility/locationSelector';
import { DateSelector } from '@/components/utility/dateSelector';
import { FlightResults } from './FlightResults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriceGraph } from './PriceGraph';
import { FlightFilters } from './FlightFilter';



const FLIGHT_CLASSES = [
    { value: 'ECONOMY', label: 'Economy' },
    { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'FIRST', label: 'First Class' },
];

const POPULAR_FLIGHTS = [
    { from: 'NYC', to: 'LAX', label: 'NEW YORK → LOS ANGELES' },
    { from: 'LON', to: 'PAR', label: 'LONDON → PARIS' },
    { from: 'DXB', to: 'TYO', label: 'DUBAI → TOKYO' },
    { from: 'LAX', to: 'MIA', label: 'LOS ANGELES → MIAMI' },
];

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
    const [passengers, setPassengers] = useState(INITIAL_PASSENGERS);
    const [travelClass, setTravelClass] = useState('ECONOMY');
    const [fromSearch, setFromSearch] = useState('');
    const [toSearch, setToSearch] = useState('');
    const [fromLocations, setFromLocations] = useState<Location[]>([]);
    const [toLocations, setToLocations] = useState<Location[]>([]);
    const [fromOpen, setFromOpen] = useState(false);
    const [toOpen, setToOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isSearchDisabled = loading || !from || !to || !departureDate;
    const [flightData, setFlightData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        minPrice: 0,
        maxPrice: 5000,
        airlines: [] as string[],
        stops: [] as number[],
        sortByPrice: '' as '' | 'lowest' | 'highest',
    });


    const uniqueAirlines = useMemo(() => {
        const set = new Set<string>();
        flightData.forEach(f =>
            f.itineraries?.[0]?.segments?.forEach((s: any) => {
                if (s.carrierCode) set.add(s.carrierCode);
            })
        );
        return Array.from(set).sort();
    }, [flightData]);

    const filteredFlights = useMemo(() => {
        const f = flightData.filter(f => {
            const price = Number(f.price?.total);
            if (price < filters.minPrice || price > filters.maxPrice) return false;

            if (filters.airlines.length) {
                const carriers = f.itineraries[0].segments.map(
                    (s: any) => s.carrierCode
                );
                if (!carriers.some((c: string) => filters.airlines.includes(c))) return false;
            }
            if (filters.stops.length) {
                const stops = f.itineraries[0].segments.length - 1;
                if (!filters.stops.includes(stops)) return false;
            }
            return true;
        });

        // sort by price if selected
        if (filters.sortByPrice === 'lowest') f.sort((a, b) => Number(a.price.total) - Number(b.price.total));
        if (filters.sortByPrice === 'highest') f.sort((a, b) => Number(b.price.total) - Number(a.price.total));

        return f;
    }, [flightData, filters]);



    useEffect(() => {
        const search = async (q: string, setter: (v: Location[]) => void) => {
            if (q.length < 2) return setter([]);
            try {
                const res = await getAirportSuggestions(q);
                setter(res.filter((l: any) => l.subType === 'CITY' || l.subType === 'AIRPORT'));
            } catch {
                setter([]);
            }
        };

        const t1 = setTimeout(() => search(fromSearch, setFromLocations), 300);
        const t2 = setTimeout(() => search(toSearch, setToLocations), 300);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [fromSearch, toSearch]);



    const updatePassenger = (k: keyof Passengers, d: number) =>
        setPassengers(p => ({
            ...p,
            [k]: Math.max(k === 'adults' ? 1 : 0, p[k] + d),
        }));

    const totalPassengers =
        passengers.adults + passengers.children + passengers.infants;


    const createSelectedLocation = (l: Location): SelectedLocation => {
        const code = l.address.cityCode || l.iataCode;
        return {
            cityCode: code,
            cityName: l.address.cityName,
            countryCode: l.address.countryCode,
            displayName: `${l.address.cityName} (${code})`,
        };
    };


    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!from || !to || !departureDate) {
            setError('Please select origin, destination, and departure date.');
            return;
        }

        setLoading(true);
        setFlightData([]);
        setFilters({ minPrice: 0, maxPrice: 5000, airlines: [], stops: [], sortByPrice: 'lowest' });

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
                max: 250,
            });

            setFlightData(res?.data || []);
        } catch (err: any) {
            setError(
                err?.response?.data?.errors?.[0]?.detail ||
                err.message ||
                'Search failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };



    return (
        <>
            <Card>
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-6">

                        {/* initial type/class */}
                        <div className="flex flex-col md:flex-row gap-4 my-0">
                            <div className="space-y-2">
                                <Label className="flex gap-2 items-center">
                                    <ArrowRightLeft className="h-4 w-4" /> Trip Type
                                </Label>
                                <div className="flex gap-2">
                                    {['round', 'one-way'].map(t => (
                                        <Button key={t} type="button" variant={tripType === t ? 'default' : 'outline'} className={`w-24 ${cn(tripType === t && 'bg-primary')}`} onClick={() => setTripType(t as any)} >
                                            {t === 'round' ? 'Round Trip' : 'One Way'}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex gap-2 items-center">
                                    <Users className="h-4 w-4" /> Passengers
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline">
                                            {totalPassengers} Passenger(s)
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-72 space-y-4">
                                        {(['adults', 'children', 'infants'] as const).map(k => (
                                            <div key={k} className="flex justify-between items-center" >
                                                <span className="capitalize">{k}</span>
                                                <div className="flex gap-2">
                                                    <Button size="icon" variant="outline" onClick={() => updatePassenger(k, -1)}> - </Button>
                                                    <span>{passengers[k]}</span>
                                                    <Button size="icon" variant="outline" onClick={() => updatePassenger(k, 1)}> + </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2 flex-1">
                                <Label className="flex gap-2 items-center">
                                    <Plane className="h-4 w-4" /> Class
                                </Label>
                                <Select value={travelClass} onValueChange={setTravelClass}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FLIGHT_CLASSES.map(c => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* locations & dates */}
                        <div className="grid md:grid-cols-4 gap-4 my-3">
                            <LocationSelector
                                label="From *"
                                value={from}
                                search={fromSearch}
                                onSearchChange={setFromSearch}
                                locations={fromLocations}
                                open={fromOpen}
                                onOpenChange={setFromOpen}
                                onSelect={l => {
                                    setFrom(createSelectedLocation(l));
                                    setFromOpen(false);
                                }}
                            />

                            <LocationSelector
                                label="To *"
                                value={to}
                                search={toSearch}
                                onSearchChange={setToSearch}
                                locations={toLocations}
                                open={toOpen}
                                onOpenChange={setToOpen}
                                onSelect={l => {
                                    setTo(createSelectedLocation(l));
                                    setToOpen(false);
                                }}
                            />

                            <DateSelector
                                label="Departure *"
                                date={departureDate}
                                onDateChange={setDepartureDate}
                            />

                            <DateSelector
                                label="Return"
                                date={returnDate}
                                onDateChange={setReturnDate}
                                disabled={tripType === 'one-way'}
                                minDate={departureDate}
                            />
                        </div>

                        <Button type="submit" className="bg-primary hover:bg-green-600 my-2" disabled={isSearchDisabled} >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            )}
                            Search Flights
                        </Button>



                        <div className="text-destructive h-1">
                            {error && (
                                <>{error}</>
                            )}
                        </div>


                        {/* popular trip */}

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                Popular routes
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {POPULAR_FLIGHTS.map(r => (
                                    <Badge key={r.label} variant="outline" className="cursor-pointer hover:bg-muted"
                                        onClick={() => { setFrom({ cityCode: r.from, cityName: r.from, countryCode: 'US', displayName: r.label.split('→')[0].trim() }); setTo({ cityCode: r.to, cityName: r.to, countryCode: 'US', displayName: r.label.split('→')[1].trim() }) }}
                                    >
                                        {r.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                    </form>
                </CardContent>
            </Card>



            {flightData && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* filters */}
                    <aside className="lg:col-span-3">
                        <FlightFilters
                            filters={filters}
                            setFilters={setFilters}
                            uniqueAirlines={uniqueAirlines}
                        />
                    </aside>

                    <main className="lg:col-span-9 lg:h-[calc(100vh-10px)] lg:overflow-hidden flex flex-col">
                        <div className="sticky top-0 bg-muted z-10 p-2 rounded-md">
                            <Tabs defaultValue="list" className="w-full">
                                <TabsList className="w-full">
                                    <TabsTrigger value="list" className="flex items-center gap-2 flex-1">
                                        <List className="h-4 w-4" /> Flight Results
                                    </TabsTrigger>
                                    <TabsTrigger value="graph" className="flex items-center gap-2 flex-1">
                                        <BarChart2 className="h-4 w-4" /> Price Graph
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="graph" className="mt-4">
                                    <div>
                                        <PriceGraph flights={flightData} filters={filters} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="list" className="mt-4">
                                    <div className="h-[calc(100vh-90px)] overflow-auto">
                                        <FlightResults flights={filteredFlights} loading={loading} />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </main>

                </div>
            )}
        </>
    );
}
