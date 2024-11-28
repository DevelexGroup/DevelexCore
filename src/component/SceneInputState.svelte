<script lang="ts">
	import type { GazeInputMessage } from "$lib/GazeInput/GazeInputEvent";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";
    import { sceneStateStore } from "../store/sceneStores";
	import { gazeManagerStore } from "../store/gazeInputStore";

    const getGazeInputStates = () => {
        return [
            { variable: "Connected", value: $gazeManagerStore !== null ? $gazeManagerStore.isConnected : null },
            { variable: "Emitting", value: $gazeManagerStore !== null ? $gazeManagerStore.isEmitting : null },
            { variable: "Calibrated", value: $gazeManagerStore !== null ? $gazeManagerStore.isDeviceCalibrated : null },
            { variable: "WindowCalibrated", value: $gazeManagerStore !== null ? $gazeManagerStore.isWindowCalibrated : null },
            { variable: "WindowCalibration ClientX", value: $gazeManagerStore !== null ? $gazeManagerStore.windowCalibration?.clientX : null },
            { variable: "WindowCalibration ScreenX", value: $gazeManagerStore !== null ? $gazeManagerStore.windowCalibration?.screenX : null },
            { variable: "WindowCalibration ClientY", value: $gazeManagerStore !== null ? $gazeManagerStore.windowCalibration?.clientY : null },
            { variable: "WindowCalibration ScreenY", value: $gazeManagerStore !== null ? $gazeManagerStore.windowCalibration?.screenY : null },
            { variable: "WindowCalibration Width", value: $gazeManagerStore !== null ? $gazeManagerStore.windowCalibration?.windowScreenWidth : null },
            { variable: "WindowCalibration Height", value: $gazeManagerStore !== null ? $gazeManagerStore.windowCalibration?.windowScreenHeight : null }
        ]   
    };

    const getGazeInputConfig = () => {
        if ($gazeManagerStore.input === null) return [];
        return Object.entries($gazeManagerStore.input.config).map(([key, value]) => ({ variable: key, value }));
    };

    let gazeInputStates = getGazeInputStates();
    let gazeInputConfig = getGazeInputConfig();

    const handleGazeInputMessage = (data: GazeInputMessage) => {
        gazeInputStates = getGazeInputStates();
    };
    
    $gazeManagerStore.on("state", handleGazeInputMessage);
    // if gazeInputState, listen for messages
    $: if ($gazeManagerStore !== null) {
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
        width: 100%;
    }
</style>