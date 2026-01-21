import type { ReactNode } from "react";

export function FormRowMatricula({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full">
      {children}
    </div>
  );
}
