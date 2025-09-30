/**
 * @module features/theme-picker
 * @description Color picker component for theme customization
 */

import { useState } from 'react';
import { Pipette } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { cn } from '@/shared/lib/utils';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setInputValue(newColor);
    onChange(newColor);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate hex color format
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {/* Color preview and picker */}
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={handleColorChange}
            className="h-10 w-10 cursor-pointer rounded-md border border-border"
          />
          <Pipette className="pointer-events-none absolute right-1 top-1 h-4 w-4 text-white mix-blend-difference" />
        </div>

        {/* Hex input */}
        <Input
          type="text"
          value={inputValue}
          onChange={handleHexInputChange}
          placeholder="#000000"
          className="flex-1 font-mono uppercase"
          maxLength={7}
        />

        {/* Color swatch */}
        <div
          className="h-10 w-16 rounded-md border border-border"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
}
