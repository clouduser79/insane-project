import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import componentsData from "./components.json"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Example typed access to components.json
export type ComponentEntry = {
  id: string
  name: string
  description?: string
  props?: Record<string, { type: string; description?: string }>
}

export function getComponents(): ComponentEntry[] {
  // cast via unknown to satisfy TypeScript when importing JSON with varied shapes
  return ((componentsData as unknown as { components?: unknown }).components ?? []) as ComponentEntry[]
}