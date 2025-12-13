
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { careers } from "@/data/careers";

interface CareerSelectProps {
  form: UseFormReturn<z.infer<any>>;
}

export function CareerSelect({ form }: CareerSelectProps) {
  return (
    <FormField
      control={form.control}
      name="career"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="career">Carrera</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger id="career">
                <SelectValue placeholder="Selecciona tu carrera" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Sin especificar</SelectItem>
              {careers.map((careerOption) => (
                <SelectItem key={careerOption} value={careerOption}>
                  {careerOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Los usuarios podrán ver tu carrera en tu perfil y ranking
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
