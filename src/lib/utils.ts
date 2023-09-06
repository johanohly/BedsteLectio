import { addToast } from "$components/toaster";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function errorToast(message: string) {
  addToast({
    data: {
      title: "Ukendt fejl",
      description:
        `Der skete en ukendt fejl i python-lectio (ude af vores kontrol). Venligst rapporter denne fejl til udviklerne.\n\nFejl: ${message}`,
      color: "bg-red-500",
    },
  });
}