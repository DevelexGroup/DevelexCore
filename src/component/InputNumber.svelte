<script lang="ts">
    import InputScaffold from "./InputScaffold.svelte";
    // create text input very basic with error handling, no writables, onlz binding
    export let value: number;
    export let label: string;
    export let placeholder: string = "";
    export let error: string = "";
    export let step: number = 1;
    export const id = Math.random().toString(36).substring(7);
</script>

<InputScaffold {id} {label} {error}>
    <input type="number" class="form-control" id={id} placeholder={placeholder} bind:value step={step} />
</InputScaffold>