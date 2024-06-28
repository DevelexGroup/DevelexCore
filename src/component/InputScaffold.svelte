<script lang="ts">
    export let id: string;
    export let label: string;
    export let error: string = "";
</script>

<div class="form-group">
    <label for={id}>{label}</label>
    <slot></slot>
    {#if error}
        <div class="invalid-feedback">{error}</div>
    {/if}
</div>

<style>
    .form-group {
        margin-bottom: 1rem;
        width: 200px;
    }
    .invalid-feedback {
        color: red;
    }
    .form-group :global(input)  {
        border: 1px solid #ced4da;
    }
    label {
        display: block;
        font-size: 12px;
    }
</style>