import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./profileSchema";

interface RelationshipStatusSelectProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function RelationshipStatusSelect({ form }: RelationshipStatusSelectProps) {
  return (
    <FormField
      control={form.control}
      name="relationship_status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Situación sentimental</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu situación sentimental" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="soltero">Soltero/a</SelectItem>
              <SelectItem value="en_relacion">En una relación</SelectItem>
              <SelectItem value="casado">Casado/a</SelectItem>
              <SelectItem value="es_complicado">Es complicado</SelectItem>
              <SelectItem value="divorciado">Divorciado/a</SelectItem>
              <SelectItem value="viudo">Viudo/a</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}