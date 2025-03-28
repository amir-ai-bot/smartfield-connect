
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fr } from 'date-fns/locale';

interface MobileFriendlyDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

const MobileFriendlyDatePicker = ({
  date,
  onDateChange,
  label,
  placeholder = "Choisir une date",
  disabled = false,
  error
}: MobileFriendlyDatePickerProps) => {
  // For native date input
  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onDateChange(new Date(value));
    } else {
      onDateChange(undefined);
    }
  };

  // Format date for native input (YYYY-MM-DD)
  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // Check if device is likely mobile
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    // Simple way to check if device is likely mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="font-medium text-sm">{label}</div>
      
      {isMobile ? (
        // Native date picker for mobile
        <Input
          type="date"
          value={formatDateForInput(date)}
          onChange={handleNativeChange}
          disabled={disabled}
          className={error ? "border-red-500" : ""}
        />
      ) : (
        // Calendar popover for desktop
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
                error && "border-red-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, 'PPP', { locale: fr })
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              initialFocus
              locale={fr}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      )}
      
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
    </div>
  );
};

export default MobileFriendlyDatePicker;
