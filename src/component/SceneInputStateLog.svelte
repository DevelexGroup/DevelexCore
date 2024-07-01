<script lang="ts">
    import { sceneStateStore } from "../store/sceneStores";
</script>


<ul>
    {#each $sceneStateStore as message, i}
        <li>
            <span>{new Date(message.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <span>{message.type}</span>
            <span>{message.value}</span>
        </li>
    {/each}
</ul>

<style>
    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        border: 1px solid #dee2e6;
        height: 500px;
        overflow: scroll;
    }
    li {
        display: grid;
        grid-template-columns: 1fr 1fr 3fr;
        text-align: left;
        padding: 5px;
        border-bottom: 1px solid #ced4da;
    }
</style>