/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { Users, Loader2, Plane, ArrowRightLeft, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getAirportSuggestions, searchFlights } from '@/lib/amadeus';
import type { Location, Passengers, SelectedLocation } from '@/components/types';
import { LocationSelector } from '@/components/utility/locationSelector';
import { DateSelector } from '@/components/utility/dateSelector';
import { FlightResults } from './FlightResults';



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
    const [flightData, setFlightData] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        minPrice: 0,
        maxPrice: 5000,
        airlines: [] as string[],
        stops: [] as number[],
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
        return flightData.filter(f => {
            const price = Number(f.price?.total);
            if (price < filters.minPrice || price > filters.maxPrice) return false;

            if (filters.airlines.length) {
                const carriers = f.itineraries[0].segments.map(
                    (s: any) => s.carrierCode
                );
                if (!carriers.some((c: string) => filters.airlines.includes(c)))
                    return false;
            }
            if (filters.stops.length) {
                const stops = f.itineraries[0].segments.length - 1;
                if (!filters.stops.includes(stops)) return false;
            }
            return true;
        });
    }, [flightData, filters]);


    useEffect(() => {
        const search = async (q: string, setter: (v: Location[]) => void) => {
            if (q.length < 2) return setter([]);
            try {
                const res = await getAirportSuggestions(q);
                setter(
                    res.filter(
                        (l: Location) =>
                            l.subType === 'CITY' || l.subType === 'AIRPORT'
                    )
                );
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
        if (!from || !to || !departureDate) {
            alert('Please fill required fields');
            return;
        }

        setLoading(true);
        setFlightData([]);
        setFilters({ minPrice: 0, maxPrice: 5000, airlines: [], stops: [] });

        try {
            const res = await searchFlights({
                originLocationCode: from.cityCode,
                destinationLocationCode: to.cityCode,
                departureDate: format(departureDate, 'yyyy-MM-dd'),
                returnDate: returnDate
                    ? format(returnDate, 'yyyy-MM-dd')
                    : undefined,
                adults: passengers.adults,
                children: passengers.children || undefined,
                infants: passengers.infants || undefined,
                travelClass,
                currencyCode: 'USD',
                max: 250,
            });

            setFlightData(res?.data || []);
        } catch (err: any) {
            alert(
                err?.response?.data?.errors?.[0]?.detail ||
                err.message ||
                'Search failed'
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
                        <div className="flex flex-col md:flex-row gap-4">
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
                        <div className="grid md:grid-cols-4 gap-4">
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
                            />
                        </div>

                        <Button type="submit" className="bg-primary hover:bg-green-600" disabled={loading} >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Search Flights
                        </Button>


                        {/* popular trip */}
                        {flightData.length === 0 && (
                            <div className="space-y-2">
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
                        )}
                    </form>
                </CardContent>
            </Card>



            {flightData && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* filters */}
                    <aside className="lg:col-span-3">
                        <Card className="sticky top-24 rounded-md p-0">
                            <CardContent className="space-y-4 p-4">
                                <h3 className="flex gap-2 font-semibold">
                                    <Filter className="h-4 w-4" /> Filters
                                </h3>


                                <div className='w-full'>
                                    <Label className='mb-3'>Price</Label>
                                    <Slider min={0} max={5000} step={50} value={[filters.minPrice, filters.maxPrice]} onValueChange={v =>
                                        setFilters(p => ({ ...p, minPrice: v[0], maxPrice: v[1] }))} />
                                </div>
                                <div>
                                    <Label className='my-2'>Stops</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {[0, 1, 2].map(s => (
                                            <Button className='p-2' key={s} size="sm" variant={filters.stops.includes(s) ? 'default' : 'outline'} onClick={() => setFilters(p => ({ ...p, stops: p.stops.includes(s) ? p.stops.filter(x => x !== s) : [...p.stops, s] }))}>
                                                {s === 0 ? 'Direct' : `${s} Stop`}
                                            </Button>
                                        ))}
                                    </div>
                                </div>



                                {uniqueAirlines.length > 0 && (
                                    <div>
                                        <Label>Airlines</Label>
                                        <div className="mt-3 flex flex-wrap gap-3">
                                            {uniqueAirlines.map(a => (
                                                <div key={a} className="flex justify-between gap-2 items-center">
                                                    <Checkbox checked={filters.airlines.includes(a)} onCheckedChange={c => setFilters(p => ({ ...p, airlines: c ? [...p.airlines, a] : p.airlines.filter(x => x !== a) }))} />
                                                    <span className="text-sm">{a}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    </aside>

                    {/* results */}
                    <main className="lg:col-span-9">
                        <FlightResults flights={filteredFlights} loading={loading} />
                    </main>
                </div>
            )}
        </>
    );
}
