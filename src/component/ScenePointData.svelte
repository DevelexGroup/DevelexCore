<script lang="ts">
	import type { GazeDataPoint } from "$lib/GazeData/GazeData";
    import { scenePointDataStore } from "../store/sceneStores";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";

    let log: GazeDataPoint[] = [];

    const bufferLogging = () => {
        setInterval(() => {
            log = $scenePointDataStore.toArray();
        }, 100);
    };

    bufferLogging();
</script>

<Group heading="Point of Gaze Data (last 300)">
<GenericTable data={log} headers={["timestamp", "xL", "xR", "yL", "yR", "fixationDuration"]} />
</Group>