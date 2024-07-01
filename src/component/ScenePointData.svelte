<script lang="ts">
    import { scenePointDataStore } from "../store/scenePointDataStore";
</script>

<ul>
    {#each $scenePointDataStore as data, i (data.timestamp)}
        <li>
            <span>{new Date(data.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <span>{data.x}</span>
            <span>{data.y}</span>
        </li>
    {/each}
</ul>