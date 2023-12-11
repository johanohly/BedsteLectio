<script lang="ts">
    export let href = "";
    export let title: string | undefined = undefined;
</script>

<a class="underline font-medium" target="_blank" {href} {title}><slot /></a>
