<script lang="ts">
	import type { GazeInputEvent, GazeInputMessage } from "$lib/GazeInput/GazeInputEvent";
    import { gazeInputStore } from "../store/gazeInputStore";
	import SceneInputStateLog from "./SceneInputStateLog.svelte";

    const getGazeInputStates = () => {
        return [
            { label: "Connected", value: $gazeInputStore !== null ? $gazeInputStore.isConnected : null },
            { label: "Emitting", value: $gazeInputStore !== null ? $gazeInputStore.isEmitting : null },
            { label: "Calibrated", value: $gazeInputStore !== null ? $gazeInputStore.isDeviceCalibrated : null },
            { label: "WindowCalibrated", value: $gazeInputStore !== null ? $gazeInputStore.isWindowCalibrated : null }
        ]   
    };

    let gazeInputStates = getGazeInputStates();

    const handleGazeInputMessage = (data: GazeInputMessage) => {
        console.log(data);
        gazeInputStates = getGazeInputStates();
    };

    // if gazeInputState, listen for messages
    $: if ($gazeInputStore !== null) {
        $gazeInputStore.on("message", handleGazeInputMessage);
        gazeInputStates = getGazeInputStates();
    } else {
        gazeInputStates = getGazeInputStates();
    }


</script>

<div class="state-container">
    <div class="state-section">
        <h2>Gaze input configuration</h2>
        {#if $gazeInputStore === null}
            <p>No gaze input configured. Choose a gaze input in the previous step and its configuration.</p>
        {:else}
            {#each Object.entries($gazeInputStore.config) as [key, value]}
                <p>{key}: {value}</p>
            {/each}
        {/if}
    </div>
    <div class="state-section">
        <h2>Gaze input state</h2>
        {#each gazeInputStates as state}
            <p>{state.label}: {state.value === null ? "N/A" : state.value ? "Yes" : "No"}</p>
        {/each}
    </div>
    <div class="state-section">
        <h2>Gaze input messages</h2>
        <SceneInputStateLog />
    </div>
</div>

<style>
    h2 {
        margin-top: 0;
        font-size: 1rem;
    }
    .state-container {
        display: grid;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 1rem;
        grid-template-columns: 250px 250px 1fr;
    }
</style>