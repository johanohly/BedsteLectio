<script lang="ts">
    import { flyAndScale } from "$lib/utils";
    import { createDialog, melt } from "@melt-ui/svelte";
    import { X } from "lucide-svelte";

    const {
        elements: { trigger, overlay, content, title, description, close, portalled },
        states: { open },
    } = createDialog({
        role: "alertdialog",
    });

    export let buttonText = "Slet";
    export let cancelText = "Fortryd";
    export let confirmText = "Slet";
    export let onConfirm: () => void;
</script>

<button use:melt={$trigger} class="h-8 px-3 rounded-[6px] bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black">
    {buttonText}
</button>

<div use:melt={$portalled}>
    {#if $open}
        <div use:melt={$overlay} class="fixed inset-0 z-50 bg-black/50" />
        <div
            class="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw]
              max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white dark:bg-dark
              p-6 shadow-lg"
            transition:flyAndScale={{
                duration: 150,
                y: 8,
                start: 0.96,
            }}
            use:melt={$content}
        >
            <h2 use:melt={$title} class="m-0 text-2xl font-bold">Er du sikker?</h2>
            <p use:melt={$description} class="mb-5 mt-2 leading-normal">Denne handling kan ikke fortrydes.</p>

            <div class="mt-6 flex justify-end gap-4">
                <button
                    use:melt={$close}
                    class="inline-flex h-8 items-center justify-center rounded-[4px]
                      px-4 font-medium leading-none hover:bg-accent hover:text-accent-foreground"
                >
                    {cancelText}
                </button>
                <button
                    use:melt={$close}
                    on:click={onConfirm}
                    class="inline-flex h-8 items-center justify-center rounded-[4px]
                      px-4 font-medium leading-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    {confirmText}
                </button>
            </div>

            <button
                use:melt={$close}
                class="absolute right-[10px] top-[10px] inline-flex h-6 w-6
                  appearance-none items-center justify-center rounded-full text-black dark:text-white
                  hover:bg-gray-100 dark:hover:bg-gray-900"
            >
                <X class="square-4" />
            </button>
        </div>
    {/if}
</div>
