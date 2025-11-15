
import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@repo/common-ui";
import { Calendar } from "@repo/common-ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/common-ui";
import { ScrollArea } from "@repo/common-ui";

interface DateTimePickerProps {
  date?: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {  
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate); 
    }
  };

  const handleTimeChange = (type: "hour" | "minute" | "ampm", value: string) => {
    if (date) {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(
          (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
        );
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value));
      } else if (type === "ampm") {
        const currentHours = newDate.getHours();
        newDate.setHours(
          value === "PM" ? (currentHours % 12) + 12 : currentHours % 12
        );
      }
      setDate(newDate);
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MM/dd/yyyy hh:mm aa") : <span>MM/DD/YYYY hh:mm aa</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex">
          {/* Calendar Section */}
          <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
          
          {/* Time Selection Section - Calendar UI Style */}
          <div className="border-l flex flex-row">
            {/* Hours */}
            <div className="p-3">
              <div className="text-sm font-medium text-center mb-2 text-muted-foreground">Hour</div>
              <ScrollArea className="h-64">
                <div className="grid grid-cols-1 space-y-1">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      className={cn(
                        "h-9 w-9 p-0 rounded-md font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-sm",
                        date && (date.getHours() % 12 === 0 ? 12 : date.getHours() % 12) === hour
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
                          : "bg-transparent"
                      )}
                      onClick={() => handleTimeChange("hour", hour.toString())}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Minutes */}
            <div className="p-3 border-l">
              <div className="text-sm font-medium text-center mb-2 text-muted-foreground">Minute</div>
              <ScrollArea className="h-64">
                <div className="grid grid-cols-1 space-y-1">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      className={cn(
                        "h-9 w-9 p-0 rounded-md font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-sm",
                        date && date.getMinutes() === minute
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
                          : "bg-transparent"
                      )}
                      onClick={() => handleTimeChange("minute", minute.toString())}
                    >
                      {minute.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* AM/PM */}
            <div className="p-3 border-l">
              <div className="text-sm font-medium text-center mb-2 text-muted-foreground">Period</div>
              <div className="flex flex-col space-y-1">
                {["AM", "PM"].map((ampm) => (
                  <button
                    key={ampm}
                    className={cn(
                      "h-9 w-10 p-0 rounded-md font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-sm",
                      date && ((ampm === "AM" && date.getHours() < 12) || (ampm === "PM" && date.getHours() >= 12))
                        ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
                        : "bg-transparent"
                    )}
                    onClick={() => handleTimeChange("ampm", ampm)}
                  >
                    {ampm}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}