<script lang="ts">
	import { cn } from "$lib/utils";

	let className: undefined | string | null = undefined;
	export { className as class };
</script>

<p class={cn("text-sm text-muted-foreground", className)} {...$$restProps}>
	<slot />
</p>
