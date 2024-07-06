<script lang="ts">
	import type { GazeInputMessage } from "$lib/GazeInput/GazeInputEvent";
    import { gazeInputStore } from "../store/gazeInputStore";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";
    import { sceneStateStore } from "../store/sceneStores";

    const getGazeInputStates = () => {
        return [
            { variable: "Connected", value: $gazeInputStore !== null ? $gazeInputStore.isConnected : null },
            { variable: "Emitting", value: $gazeInputStore !== null ? $gazeInputStore.isEmitting : null },
            { variable: "Calibrated", value: $gazeInputStore !== null ? $gazeInputStore.isDeviceCalibrated : null },
            { variable: "WindowCalibrated", value: $gazeInputStore !== null ? $gazeInputStore.isWindowCalibrated : null }
        ]   
    };

    const getGazeInputConfig = () => {
        if ($gazeInputStore === null) return [];
        return Object.entries($gazeInputStore.config).map(([key, value]) => ({ variable: key, value }));
    };

    let gazeInputStates = getGazeInputStates();
    let gazeInputConfig = getGazeInputConfig();

    const handleGazeInputMessage = (data: GazeInputMessage) => {
        console.log(data);
        gazeInputStates = getGazeInputStates();
    };

    // if gazeInputState, listen for messages
    $: if ($gazeInputStore !== null) {
        $gazeInputStore.on("message", handleGazeInputMessage);
        gazeInputStates = getGazeInputStates();
        gazeInputConfig = getGazeInputConfig();
    } else {
        gazeInputStates = getGazeInputStates();
        gazeInputConfig = getGazeInputConfig();
    }


</script>

<div class="state-container">
    <Group heading="Gaze input configuration">
        <GenericTable data={gazeInputConfig} headers={["variable", "value"]} />
    </Group>
    <Group heading="Gaze input states">
        <GenericTable data={gazeInputStates} headers={["variable", "value"]} />
    </Group>
    <Group heading="Gaze input log">
        <GenericTable data={$sceneStateStore} headers={["timestamp", "type", "value"]} />
    </Group>
</div>

<style>
    .state-container {
        display: grid;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 1rem;
        grid-template-columns: 250px 250px 1fr;
        min-width: 800px;
    }
</style>