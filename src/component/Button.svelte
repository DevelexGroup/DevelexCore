<script lang="ts">
    export let text: string;
    export let disabled: boolean = false;
</script>

<button {disabled} on:click>
    {text}
</button>

<style>
    button {
        border-radius: 5px;
        padding: 5px;
        background-color: #007bff;
        color: white;
        border: none;
        cursor: pointer;
        font-size: small;
    }
    button:hover {
        background-color: #0056b3;
    }
    button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }
</style>