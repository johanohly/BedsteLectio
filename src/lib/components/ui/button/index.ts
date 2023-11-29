import { cva } from "class-variance-authority";

export { default as Button } from "./Button.svelte";

export const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ring-offset-background",
	{
		defaultVariants: {
			size: "default",
			variant: "default"
		},
		variants: {
			size: {
				default: "h-10 py-2 px-4",
				lg: "h-11 px-8 rounded-md",
				sm: "h-8 px-3 rounded-[6px]",
				icon: "h-11 w-11 rounded-[6px]"
			},
			variant: {
				default:
					"bg-primary text-primary-foreground hover:bg-primary/90",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "underline-offset-4 hover:underline text-primary",
				outline:
					"border border-input hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80"
			}
		}
	}
);
