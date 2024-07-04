<script lang="ts">
	import type { GazeDataPoint } from "$lib/GazeData/GazeData";
    import { isGazeDataPointWithFixation } from "$lib/GazeData/GazeData";
    import { scenePointDataStore } from "../store/sceneStores";

    let log: GazeDataPoint[] = [];

    const bufferLogging = () => {
        setInterval(() => {
            log = $scenePointDataStore.toArray();
        }, 100);
    };

    bufferLogging();
</script>

<ul>
    <li>
        <span>Time</span>
        <span>X Left</span>
        <span>X Right</span>
        <span>Y Left</span>
        <span>Y Right</span>
        <span>FixDur</span>
    </li>
    {#each log as data}
        <li>
            <span>{new Date(data.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <span>{data.xL}</span>
            <span>{data.xR}</span>
            <span>{data.yL}</span>
            <span>{data.yR}</span>
            <span>{isGazeDataPointWithFixation(data) ? data.fixationDuration : 'None'}</span>
        </li>
    {/each}
</ul>

<style>
    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    li {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        padding: 0.5rem;
        border-bottom: 1px solid #ccc;
    }
</style>