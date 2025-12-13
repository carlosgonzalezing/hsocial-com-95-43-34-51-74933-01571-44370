
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

interface ProfileBasicInfoProps {
  form: UseFormReturn<z.infer<any>>;
}

export function ProfileBasicInfo({ form }: ProfileBasicInfoProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="username">Nombre de usuario</FormLabel>
            <FormControl>
              <Input 
                id="username" 
                {...field} 
                autoComplete="username" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="bio">Biografía</FormLabel>
            <FormControl>
              <Textarea 
                id="bio" 
                {...field} 
                rows={4} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
