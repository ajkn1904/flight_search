import { MapPin, Search } from "lucide-react";
import type { LocationSelectorProps } from "../types";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

export function LocationSelector({label, value, search, onSearchChange,locations, open,onOpenChange, onSelect}: LocationSelectorProps) {
    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {label}
            </Label>
            <Popover open={open} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="h-12 w-full justify-between">
                        <span className="truncate">
                            {value?.displayName || 'Select location...'}
                        </span>
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder="Search cities or airports..."
                            value={search}
                            onValueChange={onSearchChange}
                        />
                        <CommandList>
                            <CommandEmpty>{search ? 'Loading...' : 'No location found.'}</CommandEmpty>
                            <CommandGroup>
                                {locations.map((location) => {
                                    const cityCode = location.subType === 'CITY'
                                        ? (location.address.cityCode || location.iataCode)
                                        : (location.address.cityCode || location.iataCode);

                                    return (
                                        <CommandItem
                                            key={`${location.id}-${location.subType}`}
                                            value={location.address.cityName}
                                            onSelect={() => onSelect(location)}
                                        >
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {location.address.cityName}, {location.address.countryName}
                                                    </span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {cityCode}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm text-muted-foreground">{location.name}</span>
                                                    <Badge variant="outline" className="text-xs capitalize">
                                                        {location.subType.toLowerCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}