/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Filter, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { FlightFiltersProps } from '@/components/types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const FlightFilters: React.FC<FlightFiltersProps> = ({ filters, setFilters, uniqueAirlines }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* mobile filter */}
            <div className="lg:hidden bg-muted rounded-md">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full justify-start gap-2"><Filter className="h-4 w-4" />Filters</Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-75 sm:w-100">

                        <div className="mt-6 space-y-6">
                            <FilterContent
                                filters={filters}
                                setFilters={setFilters}
                                uniqueAirlines={uniqueAirlines}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* desktop filters */}
            <Card className="hidden lg:block sticky top-24 rounded-md p-0">
                <CardContent className="space-y-4 p-4">
                    <FilterContent
                        filters={filters}
                        setFilters={setFilters}
                        uniqueAirlines={uniqueAirlines}
                    />
                </CardContent>
            </Card>
        </>
    );
};

const FilterContent: React.FC<{
    filters: FlightFiltersProps['filters'];
    setFilters: FlightFiltersProps['setFilters'];
    uniqueAirlines: string[];
    onClose?: () => void;
}> = ({ filters, setFilters, uniqueAirlines, onClose }) => {
    const [expandedSections, setExpandedSections] = useState({
        price: true,
        stops: true,
        airlines: true,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <div className='p-2 lg:p-0'>
            <h3 className="flex items-center justify-between font-semibold text-lg">
                <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filters
                </span>
                {onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0"
                    > <X className="h-4 w-4" /> </Button>
                )}
            </h3>

            {/* price */}
            <div className="border rounded-lg p-3 mb-2">
                <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full">
                    <Label className="text-base font-medium cursor-pointer">Price Range</Label>
                    {expandedSections.price ? (<ChevronUp className="h-4 w-4" />) : (<ChevronDown className="h-4 w-4" />)}
                </button>
                {expandedSections.price && (
                    <div className="mt-2 space-y-3">
                        <Slider min={0} max={5000} step={50} value={[filters.minPrice, filters.maxPrice]} onValueChange={v => setFilters((p: any) => ({ ...p, minPrice: v[0], maxPrice: v[1] }))} />
                        <div className="flex justify-between text-sm mt-1">
                            <span>${filters.minPrice}</span>
                            <span>${filters.maxPrice}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* stops & sort */}
            <div className="grid grid-cols-1 gap-2">
                <div className="border rounded-lg p-3">
                    <button onClick={() => toggleSection('stops')} className="flex items-center justify-between w-full mb-2" >
                        <Label className="text-base font-medium cursor-pointer">Stops & Sort</Label>
                        {expandedSections.stops ? (<ChevronUp className="h-4 w-4" />) : (<ChevronDown className="h-4 w-4" />)}
                    </button>

                    {expandedSections.stops && (
                        <>
                            <div className="mb-2">
                                <Label className="text-sm text-muted-foreground mb-2 block">Stops</Label>
                                <div className="flex flex-wrap gap-2">
                                    {[0, 1, 2].map(s => (
                                        <Button className="p-2" key={s} size="sm" variant={filters.stops.includes(s) ? 'default' : 'outline'} onClick={() => setFilters((p: any) => ({ ...p, stops: p.stops.includes(s) ? p.stops.filter((x: number) => x !== s) : [...p.stops, s] }))}>
                                            {s === 0 ? 'Direct' : `${s} Stop`}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm text-muted-foreground mb-2 block">Sort by Price</Label>
                                <div className="flex gap-2">
                                    <Button size="sm" variant={filters.sortByPrice === 'lowest' ? 'default' : 'outline'} onClick={() => setFilters((p: any) => ({ ...p, sortByPrice: 'lowest' }))} className="flex-1" >
                                        Lowest
                                    </Button>
                                    <Button size="sm" variant={filters.sortByPrice === 'highest' ? 'default' : 'outline'} onClick={() => setFilters((p: any) => ({ ...p, sortByPrice: 'highest' }))} className="flex-1" >
                                        Highest
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* airlines */}
                {uniqueAirlines.length > 0 && (
                    <div className="border rounded-lg my p-3">
                        <button onClick={() => toggleSection('airlines')} className="flex items-center justify-between w-full mb-2" >
                            <Label className="text-base font-medium cursor-pointer">
                                Airlines ({uniqueAirlines.length})
                            </Label>
                            {expandedSections.airlines ? (<ChevronUp className="h-4 w-4" />) : (<ChevronDown className="h-4 w-4" />)}
                        </button>

                        {expandedSections.airlines && (
                            <div className="mt-2 space-y-2 max-h-45 overflow-y-auto pr-2">
                                {uniqueAirlines.map(a => (
                                    <div key={a} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={filters.airlines.includes(a)} onCheckedChange={c => setFilters((p: any) => ({ ...p, airlines: c ? [...p.airlines, a] : p.airlines.filter((x: string) => x !== a) }))} id={`airline-${a}`} />
                                            <label htmlFor={`airline-${a}`} className="text-sm cursor-pointer select-none"> {a} </label>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* clear filter */}
            {/* {(filters.airlines.length > 0 || filters.stops.length > 0 || filters.minPrice > 0 || filters.maxPrice < 5000) && ( */}
            <Button variant="outline" className="w-full mt-2" onClick={() => setFilters({ minPrice: 0, maxPrice: 5000, airlines: [], stops: [], sortByPrice: 'lowest' })}> Clear Filters</Button>
            {/* )} */}
        </div>
    );
};