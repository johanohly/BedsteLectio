<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { cn } from "$lib/utils";

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