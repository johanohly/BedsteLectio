<script context="module" lang="ts">
	export type ToastData = {
		color: string;
		description: string;
		title: string;
	};
	export const closeDelay = 5000;
	const {
		actions: { portal },
		elements,
		helpers,
		states: { toasts }
	} = createToaster<ToastData>({
		closeDelay
	});
	export const addToast = helpers.addToast;
</script>

<script lang="ts">
	import { createToaster } from '@melt-ui/svelte';
	import { flip } from 'svelte/animate';

	import Toast from './Toast.svelte';
</script>

<div class="fixed top-0 right-0 z-50 m-4 flex flex-col items-start gap-2" use:portal>
	{#each $toasts as { data, id } (id)}
		<div animate:flip={{ duration: 500 }}>
			<Toast {data} {elements} {id} />
		</div>
	{/each}
</div>