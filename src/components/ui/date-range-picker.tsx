"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { useEffect, useState } from "react";

interface CalendarDateRangePickerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
}

export function CalendarDateRangePicker({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  className,
}: CalendarDateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(
    startDate && endDate ? { from: startDate, to: endDate } : undefined,
  );

  useEffect(() => {
    if (date?.from) setStartDate(date.from);
    else setStartDate(null);

    if (date?.to) setEndDate(date.to);
    else setEndDate(null);
  }, [date, setStartDate, setEndDate]);

  const selectDate = (range: DateRange) => {
    setDate(range); // actualiza el rango completo
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left text-xs font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date && date.from && date.to && (
              <>
                {`${format(date.from, "LLL dd, y")} - ${format(
                  date.to,
                  "LLL dd, y",
                )}`}
              </>
            )}
            {date && date.from && !date.to && (
              <>{format(date.from, "LLL dd, y")}</>
            )}
            {!date && <span>Escoje Fecha</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={date}
            onSelect={selectDate}
            numberOfMonths={2}
            required={true}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
