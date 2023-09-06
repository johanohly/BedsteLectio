<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { cn } from "$lib/utils";

	type $$Props = HTMLAttributes<HTMLTableRowElement> & {
		"data-state"?: unknown;
	};

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<tr
	class={cn(
		"border-b transition-colors hover:bg-muted/50",
		className
	)}
	{...$$restProps}
>
	<slot />
</tr>