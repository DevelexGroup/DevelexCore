<script lang="ts">
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";
    import { sceneStateStore, sceneErrorStore } from "../store/sceneStores";
	import { gazeManagerStore } from "../store/gazeInputStore";
	import { onDestroy } from "svelte";
	import type { GazeInputEventState } from "$lib/index";

    const getGazeInputConfig = () => {
        if ($gazeManagerStore.input === null) return [];
        return Object.entries($gazeManagerStore.input.config).map(([key, value]) => ({ variable: key, value }));
    };

    let gazeInputConfig = getGazeInputConfig();

    const updateGazeInputConfig = (event: GazeInputEventState) => {
        console.log(event);
        gazeInputConfig = getGazeInputConfig();
    };

    // on every state change, update the config
    $gazeManagerStore.on("inputState", updateGazeInputConfig);

    onDestroy(() => {
        $gazeManagerStore.off("inputState", updateGazeInputConfig);
    });

</script>

<div class="state-container">
    <div class="grid col-2">
        <Group heading="Gaze input configuration">
            <GenericTable data={gazeInputConfig} headers={["variable", "value"]} />
        </Group>
        <Group heading="Gaze input error log">
            <GenericTable data={$sceneErrorStore} headers={["timestamp", "content"]} />
        </Group>
    </div>
    <Group heading="Gaze input log">
        <GenericTable data={$sceneStateStore} headers={["timestamp", "trackerStatus", "viewportCalibration"]} />
    </Group>
</div>

<style>
    .state-container {
        display: grid;
        grid-template-columns:300px 1fr;
        gap: 1rem;
        min-width: 800px;
        width: 100%;
    }
</style>
