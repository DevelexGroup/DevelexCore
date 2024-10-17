<script lang="ts">
	import type { Intersect } from "../database/models/Intersect";
	import intersectRepository from "../database/repositories/intersect.repository";
	import { gazeManagerStore } from "../store/gazeInputStore";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";
	import GenericTestElement from "./GenericTestElement.svelte";
    let interval: number | null = null;
    let data: Intersect[] = [];

    const obtainPoints = () => {
        intersectRepository.getLast(300).then((intersects) => {
            data = intersects;
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

    const settings = {
        bufferSize: 10
    };

    const aoiLabels = ["intersect-a", "intersect-b", "intersect-c"];

    const registerFn = (element: HTMLElement) => {
        $gazeManagerStore.register({
            interaction: "intersect",
            element,
            settings,
        });
    };

    const unregisterFn = (element: HTMLElement) => {
        $gazeManagerStore.unregister({
            interaction: "intersect",
            element,
        });
    };
</script>

<div class="holder">
    <Group heading="Intersect Interaction Elements">
        <div class="grouping">
        {#each aoiLabels as aoi}
            <GenericTestElement aoi={aoi} {registerFn} {unregisterFn} />
        {/each}
        </div>
    </Group>
    <Group heading="Intersect Interaction Log">
        <GenericTable {data} headers={["timestamp", "gazeData.xL", "gazeData.xR", "gazeData.yL", "gazeData.yR", "gazeData.fixationDuration", "aoi"]} />
    </Group>
</div>

<style>
    .holder {
        display: grid;
        flex-wrap: wrap;
        justify-content: space-between;
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    .grouping {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }
</style>