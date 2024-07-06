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

<div>
<table>
    <thead>
        <tr>
            <th>Time</th>
            <th>X Left</th>
            <th>X Right</th>
            <th>Y Left</th>
            <th>Y Right</th>
            <th>FixDur</th>
        </tr>
    </thead>
    <tbody>
        {#each log as data}
            <tr>
                <td>{new Date(data.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                <td>{data.xL}</td>
                <td>{data.xR}</td>
                <td>{data.yL}</td>
                <td>{data.yR}</td>
                <td>{isGazeDataPointWithFixation(data) ? data.fixationDuration : 'None'}</td>
            </tr>
        {/each}
    </tbody>
</table>
</div>

<style>
    div {
        overflow-x: auto;
        border: 1px solid #ddd;
    }
    table {
        width: 100%;
        min-width: 800px;
        border-collapse: collapse;
    }

    th, td {
        padding: 5px 10px;
        border-bottom: 1px solid #ddd;
    }

    th {
        background-color: #f2f2f2;
    }

    tr:hover {
        background-color: #f5f5f5;
    }
</style>