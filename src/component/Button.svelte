<script lang="ts">
    export let text: string;
</script>

<button on:click>
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
    }
    button:hover {
        background-color: #0056b3;
    }
</style>