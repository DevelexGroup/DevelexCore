<script lang="ts">
    export let text: string;
</script>

<input type="submit" value={text} />

<style>
    input {
        border-radius: 5px;
        padding: 5px;
        background-color: #007bff;
        color: white;
        border: none;
        cursor: pointer;
    }
    input:hover {
        background-color: #0056b3;
    }
</style>