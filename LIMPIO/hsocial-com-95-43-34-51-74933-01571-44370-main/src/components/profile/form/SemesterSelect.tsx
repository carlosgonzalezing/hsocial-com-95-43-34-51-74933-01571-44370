
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

// List of semesters
const semesters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Egresado"];

interface SemesterSelectProps {
  form: UseFormReturn<z.infer<any>>;
}

export function SemesterSelect({ form }: SemesterSelectProps) {
  return (
    <FormField
      control={form.control}
      name="semester"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="semester">Semestre</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger id="semester">
                <SelectValue placeholder="Selecciona tu semestre" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Sin especificar</SelectItem>
              {semesters.map((semesterOption) => (
                <SelectItem key={semesterOption} value={semesterOption}>
                  {semesterOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Los usuarios podrán ver tu semestre en tu perfil y ranking
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
