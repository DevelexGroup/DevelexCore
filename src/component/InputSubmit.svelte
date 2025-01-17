<script lang="ts">
    export let text: string;
</script>

<input type="submit" value={text} on:click/>

<style>
    input {
        border-radius: 5px;
        padding: 5px;
        background-color: #0071bc;
        color: white;
        border: none;
        cursor: pointer;
    }
    input:hover {
        background-color: #0056b3;
    }
</style>