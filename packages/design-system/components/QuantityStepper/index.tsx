import React from 'react';

export interface QuantityStepperProps {
  id: string;
  label?: string;
  max: number;
  min?: number;
  onChange: (value: number) => void;
  value: number;
}

export function QuantityStepper({
  id,
  label = 'Quantity',
  max,
  min = 1,
  onChange,
  value,
}: QuantityStepperProps) {
  return (
    <div className="cp-quantity-stepper">
      <span id={`${id}-label`} className="cp-label-small">
        {label}
      </span>
      <div role="group" aria-labelledby={`${id}-label`}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="Decrease quantity"
        >
          -
        </button>
        <output id={id} aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
}
