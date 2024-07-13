<script lang="ts">
    import Group from "./GenericGroup.svelte";
    import GenericTable from "./GenericTable.svelte";
    import { gazeInputStore } from "../store/gazeInputStore";
    import pointRepository from "../database/repositories/point.repository";
    import type { Point } from "../database/models/Point";

    let interval: number | null = null;
    let data: Point[] = [];

    const obtainPoints = () => {
        pointRepository.getLast(300).then((points) => {
            data = points;
        });
    };

    obtainPoints();

    // Function that will start an interval of 300ms to retrieve the last 300 points of gaze data from pointRepository
    const startInterval = () => {
        interval = setInterval(() => {
            obtainPoints();
        }, 300);
    };

    const cancelInterval = () => {
        if (interval === null) return;
        clearInterval(interval);
        interval = null;
    };

    if ($gazeInputStore === null) {
        // Handle the case when $gazeInputStore is null
    } else {
        if ($gazeInputStore.isEmitting) {
            startInterval();
        }
        $gazeInputStore.on("emit", (data) => {
            data.value ? startInterval() : cancelInterval();
        });
    }
</script>

<Group heading="Point of Gaze Data (last 300)">
    <GenericTable {data} headers={["timestamp", "xL", "xR", "yL", "yR", "fixationDuration"]} />
</Group>