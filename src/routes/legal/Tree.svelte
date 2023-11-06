<script lang="ts">
    import { melt, type TableOfContentsElements, type TableOfContentsItem } from "@melt-ui/svelte";

    export let tree: TableOfContentsItem[] = [];
    export let activeHeadingIdxs: number[];
    export let item: TableOfContentsElements["item"];
    export let level = 1;
</script>

<ul class="not-prose m-0 list-none {level !== 1 ? 'pl-4' : ''}">
    {#if tree && tree.length}
        {#each tree as heading, i (i)}
            <li class="mt-0 pt-2">
                <a
                    href="#{heading.id}"
                    use:melt={$item(heading.id)}
                    class="inline-flex items-center justify-center gap-1 text-neutral-500 no-underline transition-colors
             hover:!text-black dark:hover:!text-white data-[active]:text-black data-[active]:dark:text-white"
                >
                    {@html heading.node.innerHTML}
                </a>
                {#if heading.children && heading.children.length}
                    <svelte:self tree={heading.children} level={level + 1} {activeHeadingIdxs} {item} />
                {/if}
            </li>
        {/each}
    {/if}
</ul>
