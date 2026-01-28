import React from "react";

export function Header({ children }: { children: React.ReactNode }) {
  return <header className="w-full">{children}</header>;
}