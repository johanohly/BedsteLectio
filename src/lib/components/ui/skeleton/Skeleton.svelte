<script lang="ts">
	import { cn } from "$lib/utils";

	let className: null | string | undefined = undefined;
	export { className as class };
</script>

<div
	class={cn("animate-pulse rounded-md bg-slate-300 dark:bg-dark-hover", className)}
	{...$$restProps}
/>
