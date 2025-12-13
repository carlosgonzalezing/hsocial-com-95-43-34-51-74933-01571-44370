import { useState, useCallback } from 'react';

interface ValidationRule {
  field: string;
  message: string;
  validator: (value: any) => boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

export function useFormValidation(rules: ValidationRule[]) {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback((data: Record<string, any>): boolean => {
    setIsValidating(true);
    const newErrors: ValidationError[] = [];

    rules.forEach(rule => {
      if (!rule.validator(data[rule.field])) {
        newErrors.push({
          field: rule.field,
          message: rule.message
        });
      }
    });

    setErrors(newErrors);
    setIsValidating(false);
    return newErrors.length === 0;
  }, [rules]);

  const validateField = useCallback((field: string, value: any): boolean => {
    const rule = rules.find(r => r.field === field);
    if (!rule) return true;

    const isValid = rule.validator(value);
    
    setErrors(prev => {
      const filtered = prev.filter(e => e.field !== field);
      if (!isValid) {
        filtered.push({ field, message: rule.message });
      }
      return filtered;
    });

    return isValid;
  }, [rules]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getFieldError = useCallback((field: string): string | null => {
    const error = errors.find(e => e.field === field);
    return error ? error.message : null;
  }, [errors]);

  const hasErrors = errors.length > 0;

  return {
    errors,
    isValidating,
    hasErrors,
    validate,
    validateField,
    clearErrors,
    getFieldError
  };
}

// Validation helpers for common patterns
export const validationHelpers = {
  required: (value: any) => Boolean(value && value.toString().trim()),
  minLength: (min: number) => (value: string) => value && value.trim().length >= min,
  maxLength: (max: number) => (value: string) => !value || value.trim().length <= max,
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  url: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  number: (value: any) => !isNaN(Number(value)),
  range: (min: number, max: number) => (value: number) => value >= min && value <= max,
  arrayMinLength: (min: number) => (arr: any[]) => Array.isArray(arr) && arr.length >= min,
  oneOf: (options: any[]) => (value: any) => options.includes(value)
};