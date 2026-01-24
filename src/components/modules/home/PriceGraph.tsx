/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { PriceDataPoint, PriceGraphProps } from '@/components/types';
import { Separator } from '@/components/ui/separator';

export function PriceGraph({ flights = [], filters = {} }: PriceGraphProps) {

  const filteredFlights = flights.filter(flight => {
    if (!flight || !flight.price || !flight.itineraries?.[0]?.segments) return false;

    const price = parseFloat(flight.price.total);
    if (filters.minPrice && price < filters.minPrice) return false;
    if (filters.maxPrice && price > filters.maxPrice) return false;

    if (filters.airlines && filters.airlines.length > 0) {
      const flightAirlines = flight.itineraries[0].segments.map((s: any) => s.carrierCode);
      if (!flightAirlines.some((airline: any) => filters.airlines!.includes(airline))) return false;
    }

    if (filters.stops && filters.stops.length > 0) {
      const stopsCount = flight.itineraries[0].segments.length - 1;
      if (!filters.stops.includes(stopsCount)) return false;
    }

    return true;
  });

  const generatePriceData = (): PriceDataPoint[] => {
    if (!filteredFlights.length) {
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: 0,
          cheapest: 0,
          average: 0,
        };
      });
    }

    const prices = filteredFlights.map(flight => parseFloat(flight.price.total));
    const minPrice = Math.min(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const currentPrice = avgPrice;

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));

      const dayPosition = i;
      const baseVariation = (dayPosition - 3) * 0.03;
      const dayOfWeek = date.getDay();
      const weekendVariation = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.05 : -0.02;
      const randomVariation = Math.random() * 0.08 - 0.04;
      const totalVariation = baseVariation + weekendVariation + randomVariation;

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: currentPrice * (1 + totalVariation),
        cheapest: minPrice * (1 + totalVariation * 0.7),
        average: avgPrice * (1 + totalVariation * 0.85),
      };
    });
  };

  const priceData = generatePriceData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card text-card-foreground p-3 border border-border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="flex items-center gap-2" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span>
              <span>${entry.value.toFixed(2)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const currentPrice = priceData.length > 0 ? priceData[priceData.length - 1].price : 0;
  const previousPrice = priceData.length > 1 ? priceData[priceData.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;

  const actualPrices = filteredFlights.map(flight => parseFloat(flight.price.total));
  const actualMinPrice = actualPrices.length ? Math.min(...actualPrices) : 0;
  const actualAvgPrice = actualPrices.length ? actualPrices.reduce((a, b) => a + b, 0) / actualPrices.length : 0;
  const actualMaxPrice = actualPrices.length ? Math.max(...actualPrices) : 0;

  return (
    <Card className="w-full rounded-md my-3 md:my-11.5 lg:my-12">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            Price Trends
            {priceChange > 0 ? (
              <TrendingUp className="h-5 w-5 text-red-600" />
            ) : priceChange < 0 ? (
              <TrendingDown className="h-5 w-5 text-green-600" />
            ) : null}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {filteredFlights.length > 0
              ? `Based on ${filteredFlights.length} available flights`
              : flights.length > 0
                ? 'No flights match current filters'
                : 'Search for flights to see price trends'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-62.5 sm:h-75 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                minTickGap={20}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                width={40}
              />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ background: 'var(--card)', color: 'var(--card-foreground)' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)' }} />

              <Area
                type="monotone"
                dataKey="cheapest"
                stroke="var(--color-chart-2)"
                fill="url(#colorChart2)"
                fillOpacity={0.6}
                strokeWidth={2}
                name="Lowest"
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="average"
                stroke="var(--color-chart-4)"
                fill="url(#colorChart4)"
                fillOpacity={0.5}
                strokeWidth={2}
                name="Average"
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="var(--color-chart-5)"
                fill="url(#colorChart3)"
                fillOpacity={0.4}
                strokeWidth={2}
                name="Current"
                dot={false}
                activeDot={{ r: 4 }}
              />

              <defs>
                <linearGradient id="colorChart1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorChart2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-4)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="var(--color-chart-4)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorChart3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-5)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-chart-5)" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>

        </div>

        <Separator className='my-3' />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-0">
            <div className="text-xs sm:text-sm text-muted-foreground">Current</div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              ${currentPrice.toFixed(2)}
            </div>
            <div className={`text-xs sm:text-sm ${priceChange > 0 ? 'text-green-700' : priceChange < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              {priceChange > 0 ? '↑' : priceChange < 0 ? '↓' : '→'} ${Math.abs(priceChange).toFixed(2)}
            </div>
          </div>
          <div className="p-0">
            <div className="text-xs sm:text-sm text-muted-foreground">Average</div>
            <div className="text-xl sm:text-2xl font-bold">
              ${actualAvgPrice.toFixed(2)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              of {filteredFlights.length} flights
            </div>
          </div>
          <div className="p-0">
            <div className="text-xs sm:text-sm text-muted-foreground">Lowest</div>
            <div className="text-xl sm:text-2xl font-bold text-primary">
              ${actualMinPrice.toFixed(2)}
            </div>
          </div>
          <div className="p-0">
            <div className="text-xs sm:text-sm text-muted-foreground">Highest</div>
            <div className="text-xl sm:text-2xl font-bold text-green-700">
              ${actualMaxPrice.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
