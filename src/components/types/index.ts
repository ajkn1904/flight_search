/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Location {
  id: string;
  iataCode: string;
  name: string;
  address: {
    cityName: string;
    countryName: string;
    cityCode?: string;
    countryCode: string;
  };
  type: string;
  subType: string;
}

export interface SelectedLocation {
  cityCode: string;
  cityName: string;
  countryCode: string;
  displayName: string;
}

export interface LocationSelectorProps {
    label: string;
    value: SelectedLocation | null;
    search: string;
    onSearchChange: (value: string) => void;
    locations: Location[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (location: Location) => void;
}

export interface DateSelectorProps {
    label: string;
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    disabled?: boolean;
}

export type Passengers = {
  adults: number;
  children: number;
  infants: number;
};

export interface FlightOffer {
  id: string;
  price: { total: string; currency: string };
  itineraries: Array<{ segments: Array<{ departure: { iataCode: string; at: string }; arrival: { iataCode: string; at: string }; carrierCode: string; duration: string }> }>;
}

export interface FlightResultsProps {
  flights?: FlightOffer[];
  loading?: boolean;
}

export interface PriceDataPoint {
  date: string;
  price: number;
  cheapest: number;
  average: number;
}

export interface PriceGraphProps {
  flights?: any[];
  filters?: {
    maxPrice?: number;
    minPrice?: number;
    airlines?: string[];
    stops?: number[];
  };
}


export interface FlightFiltersProps {
  filters: {
    minPrice: number;
    maxPrice: number;
    airlines: string[];
    stops: number[];
    sortByPrice: '' | 'lowest' | 'highest';
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  uniqueAirlines: string[];
}

export interface ExtendedDateSelectorProps extends DateSelectorProps {
  minDate?: Date; 
}

