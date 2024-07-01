<script lang="ts">
    // Input Select
    import InputScaffold from "./InputScaffold.svelte";
    export let value: string;
    export let label: string;
    export let options: string[];
    export let error: string = "";
    export let disabled: boolean = false;
    export const id = Math.random().toString(36).substring(7);
</script>

<InputScaffold {id} {label} {error}>
    <select class="form-control" id={id} {disabled} bind:value>
        {#each options as option}
            <option value={option} selected={option === value}>{option}</option>
        {/each}
    </select>
</InputScaffold>