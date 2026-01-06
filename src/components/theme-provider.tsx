
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { useTheme } from "next-themes"

function ThemeClassSync({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-tech", theme === "tech");
  }, [theme]);

  return <>{children}</>;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      themes={["light", "dark", "tech"]}
      value={{
        light: "light",
        dark: "dark",
        tech: "dark",
      }}
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      <ThemeClassSync>{children}</ThemeClassSync>
    </NextThemesProvider>
  );
}
