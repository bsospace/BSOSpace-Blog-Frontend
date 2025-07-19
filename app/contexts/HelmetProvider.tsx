"use client"
import { ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";

export default function HelmetContextProvider({ children }: { children: ReactNode }) {
    return <HelmetProvider>{children}</HelmetProvider>;
}