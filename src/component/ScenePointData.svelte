<script lang="ts">
    import Group from "./GenericGroup.svelte";
    import GenericTable from "./GenericTable.svelte";
    import pointRepository from "../database/repositories/point.repository";
    import type { Point } from "../database/models/Point";
    import { gazeManagerStore } from "../store/gazeInputStore";

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
        }, 300) as unknown as number;
    };

    const cancelInterval = () => {
        if (interval === null) return;
        clearInterval(interval);
        interval = null;
    };

    if ($gazeManagerStore === null) {
        // Handle the case when $gazeInputStore is null
    } else {
        if ($gazeManagerStore.isEmitting) {
            startInterval();
        }
        $gazeManagerStore.on("emit", (data) => {
            data.value ? startInterval() : cancelInterval();
        });
    }
</script>

<Group heading="Point of Gaze Data (last 300)">
    <GenericTable {data} headers={["timestamp", "xL", "xR", "yL", "yR", "fixationDuration"]} />
</Group>