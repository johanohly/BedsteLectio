<script lang="ts">
	import { cn } from "$lib/utils";

	let className: null | string | undefined = undefined;
	export { className as class };

	export let tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" = "h3";
</script>

<svelte:element
	class={cn("flex items-center text-lg font-semibold leading-none tracking-tight !mt-0", className)}
	this={tag}
	{...$$restProps}
>
	<slot />
</svelte:element>
