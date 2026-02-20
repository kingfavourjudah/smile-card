"use client";

import { useEffect, ReactNode } from "react";
import { configureFlow } from "@/config/flow";

export default function FlowProviderWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    configureFlow();
  }, []);

  return <>{children}</>;
}
