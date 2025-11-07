import React from 'react';
import { cn } from '@/lib/utils';
import useOnboardingStore from '@/store/onboardingStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Motion from '@/components/ui/motion';
import OnboardingLayout from './OnboardingLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import api from '@/utils/api';

type CountryCode = {
  code: string;
  flag: string;
  country: string;
};

const COUNTRY_CODES: CountryCode[] = [
  { code: '+91', flag: '🇮🇳', country: 'India' },
];


const PhoneSection: React.FC = () => {
  const { setPhone } = useOnboardingStore();
  const [error, setError] = React.useState<string>('');
  const [selectedCountryCode, setSelectedCountryCode] = React.useState<CountryCode>(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [isValidating, setIsValidating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const validatePhoneNumber = (number: string) => {
    const digitsOnly = number.replace(/\D/g, '');
    
    if (digitsOnly.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (digitsOnly.length > 10) {
      setError('Mobile number should not exceed 10 digits');
      return false;
    }
    if (!/^[0-9+\-\s()]*$/.test(number)) {
      setError('Please enter only numbers');
      return false;
    }
    
    setError('');
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setPhone(selectedCountryCode.code + value);
    if (isValidating) {
      validatePhoneNumber(value);
    }
  };

  const handleCountryCodeChange = (value: string) => {
    const country = COUNTRY_CODES.find(c => c.code === value);
    if (country) {
      setSelectedCountryCode(country);
      setPhone(country.code + phoneNumber);
    }
  };

  const checkPhoneAvailability = async (phone: string) => {
    try {
      const { data } = await api.post('/m/check/phone', { phone });
      
      if (!data.success) {
        setError(data.message);
        return false;
      }
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to validate phone number. Please try again.');
      return false;
    }
  };

  const handleNext = async () => {
    setIsValidating(true);
    setIsLoading(true);
    
    try {
      if (!validatePhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      const isAvailable = await checkPhoneAvailability(selectedCountryCode.code + phoneNumber);
      if (!isAvailable) {
        throw new Error('Phone number validation failed');
      }

      // If we reach here, validation was successful
      return true;
    } catch (error) {
      // Error is already handled by setting the error state
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingLayout
      title="Enter your Phone Number"
      subtitle="We'll use this to send you important updates and notifications"
      nextDisabled={!phoneNumber || isLoading || (isValidating && !!error)}
      onNext={handleNext}
    >
      <Motion
        animation="fade-in"
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedCountryCode.code}
                    onValueChange={handleCountryCodeChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[100px] text-sm">
                      <SelectValue>
                        <span className="flex items-center gap-1">
                          <span>{selectedCountryCode.flag}</span>
                          <span>{selectedCountryCode.code}</span>
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="flex items-center gap-2 text-sm">
                            <span>{country.flag}</span>
                            <span>{country.code}</span>
                            <span className="text-muted-foreground">
                              {country.country}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="98x-xxxx-xxxx"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      disabled={isLoading}
                      className={cn(
                        "text-sm flex-1 placeholder:text-sm pr-8",
                        error && isValidating ? "border-destructive" : "border-border"
                      )}
                    />
                    {isLoading && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                {error && isValidating && (
                  <p className="text-xs text-destructive mt-1">{error}</p>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>• Enter your active phone number</p>
                <p>• We'll send a verification code to this number</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Motion>
    </OnboardingLayout>
  );
};

export default PhoneSection;