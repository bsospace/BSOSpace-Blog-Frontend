import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { nanoid } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getnerarteIdFromUrl(url: string) {
  const regex = /\/nerarte\/([a-zA-Z0-9]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function getnerateId() {
  const first = nanoid(8)
  return first
}


export const formatDate = (dateString: string) => {
  if (!dateString || dateString === "0001-01-01T00:00:00Z") return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};