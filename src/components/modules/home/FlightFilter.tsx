/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { FlightFiltersProps } from '@/components/types';



export const FlightFilters: React.FC<FlightFiltersProps> = ({ filters, setFilters, uniqueAirlines }) => {
    return (
        <Card className="sticky top-24 rounded-md p-0">
            <CardContent className="space-y-4 p-4">
                <h3 className="flex gap-2 font-semibold">
                    <Filter className="h-4 w-4" /> Filters
                </h3>

                {/* price */}
                <div className='w-full'>
                    <Label className='mb-3'>Price</Label>
                    <Slider min={0} max={5000} step={50} value={[filters.minPrice, filters.maxPrice]} onValueChange={v => setFilters((p: any) => ({ ...p, minPrice: v[0], maxPrice: v[1] }))}
                    />
                    <div className="flex justify-between text-sm mt-1">
                        <span>${filters.minPrice}</span>
                        <span>${filters.maxPrice}</span>
                    </div>
                </div>

                {/* stops & sort */}
                <div className='flex lg:flex-col gap-2 justify-between'>
                    <div>
                        <Label className='my-2'>Stops</Label>
                        <div className="flex flex-wrap gap-2">
                            {[0, 1, 2].map(s => (
                                <Button className='p-2' key={s} size="sm" variant={filters.stops.includes(s) ? 'default' : 'outline'} onClick={() => setFilters((p: any) => ({ ...p, stops: p.stops.includes(s) ? p.stops.filter((x: number) => x !== s) : [...p.stops, s] }))}>
                                    {s === 0 ? 'Direct' : `${s} Stop`}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className='my-2'>Sort by Price</Label>
                        <div className="flex gap-2">
                            <Button size="sm" variant={filters.sortByPrice === 'lowest' ? 'default' : 'outline'} onClick={() => setFilters((p: any) => ({ ...p, sortByPrice: 'lowest' }))}>
                                Lowest
                            </Button>
                            <Button size="sm" variant={filters.sortByPrice === 'highest' ? 'default' : 'outline'} onClick={() => setFilters((p: any) => ({ ...p, sortByPrice: 'highest' }))}
                            >
                                Highest
                            </Button>
                        </div>
                    </div>
                </div>

                {/* airlines */}
                {uniqueAirlines.length > 0 && (
                    <div>
                        <Label>Airlines</Label>
                        <div className="mt-3 flex flex-wrap gap-3">
                            {uniqueAirlines.map(a => (
                                <div key={a} className="flex justify-between gap-2 items-center">
                                    <Checkbox checked={filters.airlines.includes(a)}
                                        onCheckedChange={c => setFilters((p: any) => ({ ...p, airlines: c ? [...p.airlines, a] : p.airlines.filter((x: string) => x !== a) }))} />
                                    <span className="text-sm">{a}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
