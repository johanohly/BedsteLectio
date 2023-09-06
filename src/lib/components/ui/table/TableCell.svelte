<script lang="ts">
	import { cn } from "$lib/utils";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLTableCellElement>;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<td
	class={cn(
		"p-2 align-middle",
		className
	)}
	{...$$restProps}
>
	<slot />
</td>