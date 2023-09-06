<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { cn } from "$lib/utils";

	type $$Props = HTMLAttributes<HTMLTableCellElement>;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<th
	class={cn(
		"h-12 px-2 text-left align-middle font-medium text-muted-foreground",
		className
	)}
	{...$$restProps}
>
	<slot />
</th>