import type { DateSelectorProps } from "../types";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { format } from "date-fns";
import { cn } from "@/lib/utils";



export function DateSelector({ label, date, onDateChange, disabled = false }: DateSelectorProps) {
    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {label}
            </Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('h-12 w-full justify-start text-left font-normal',!date && 'text-muted-foreground')} disabled={disabled} >
                        {date ? format(date, 'PPP') : 'Pick a date'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={date} onSelect={onDateChange} initialFocus disabled={(date) => date < new Date()} />
                </PopoverContent>
            </Popover>
        </div>
    );
}