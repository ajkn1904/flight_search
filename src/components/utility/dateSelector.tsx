import type { ExtendedDateSelectorProps } from "../types";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { format } from "date-fns";
import { cn } from "@/lib/utils";


export function DateSelector({ label, date, onDateChange, disabled = false, minDate }: ExtendedDateSelectorProps) {
    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {label}
            </Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('h-12 w-full justify-between items-center text-left font-normal',!date && 'text-muted-foreground')} disabled={disabled} > {date ? format(date, 'PPP') : 'Pick a date'}<Calendar className="h-4 w-4" />
                    </Button>
                    
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={date} onSelect={onDateChange} initialFocus disabled={(d: Date) => { const today = new Date(); today.setHours(0, 0, 0, 0); if (d < today) return true; if (minDate && d < minDate) return true; return false; }}/>
                </PopoverContent>
            </Popover>
        </div>
    );
}