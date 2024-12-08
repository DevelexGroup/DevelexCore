<script lang="ts">
	import { GazeIndicator } from "$lib/GazeIndicator/GazeIndicator";
	import type { GazeInputEventMessage, GazeInputEventState } from "$lib/GazeInput/GazeInputEvent";
    import type { GazeDataPoint } from "$lib/GazeData/GazeData";
    import { gazeManagerStore, setGazeInput } from "../store/gazeInputStore";
	import Button from "./Button.svelte";
	import { sceneStateStore } from "../store/sceneStores";

    let isGazeIndicatorVisible = true;
    const indicator = new GazeIndicator();
    $: disabled = $gazeManagerStore.input === null;

    let isConnectedProcessing = false;
    let isStartedProcessing = false;
    let isStoppedProcessing = false;
    let isDisconnectedProcessing = false;
    let isCalibratedProcessing = false;

    const handleGazeInputEventState = (data: GazeInputEventState) => {
        sceneStateStore.update((store) => {
            store.push(data);
            return store;
        });
        if (!$gazeManagerStore) return;
        if (data.trackerStatus?.status === "trackerEmitting" && isGazeIndicatorVisible) {
            initIndicator();
        } else {
            destroyIndicator();
        }
    };

    $gazeManagerStore.on("inputState", handleGazeInputEventState);

    const drawGaze = (gaze: GazeDataPoint) => {
        indicator.draw(gaze);
    };

    const initIndicator = () => {
        if ($gazeManagerStore === null) {
            return;
        }
        indicator.init(document);
        $gazeManagerStore.on("inputData", drawGaze);
    };

    const destroyIndicator = () => {
        if ($gazeManagerStore === null) {
            return;
        }
        $gazeManagerStore.off("inputData", drawGaze);
        indicator.remove();
    };

    const toggleGazeIndicator = (targetValue: boolean) => {
        if ($gazeManagerStore === null) {
            return;
        }
        if (targetValue) {
            initIndicator();
        } else {
            destroyIndicator();
        }
        isGazeIndicatorVisible = targetValue;
    };

    const connect = async () => {
        isConnectedProcessing = true;
        try {
            if ($gazeManagerStore === null) {
                throw new Error("No gaze input configured.");
            }
            await $gazeManagerStore.connect();
        } catch (error) {
            console.error(error);
        }
        isConnectedProcessing = false;
    };

    const disconnect = async () => {
        isDisconnectedProcessing = true;
        try {
            if ($gazeManagerStore === null) {
                throw new Error("No gaze input configured.");
            }
            await $gazeManagerStore.disconnect();
        } catch (error) {
            console.error(error);
        }
        isDisconnectedProcessing = false;
    };

    const start = async () => {
        isStartedProcessing = true;
        try {
            if ($gazeManagerStore === null) {
                throw new Error("No gaze input configured.");
            }
            await $gazeManagerStore.start();
        } catch (error) {
            console.error(error);
        }
        isStartedProcessing = false;
    };

    const stop = async () => {
        isStoppedProcessing = true;
        try {
            if ($gazeManagerStore === null) {
                throw new Error("No gaze input configured.");
            }
            await $gazeManagerStore.stop();
        } catch (error) {
            console.error(error);
        }
        isStoppedProcessing = false;
    };

    const calibrate = async () => {
        isCalibratedProcessing = true;
        try {
            if ($gazeManagerStore === null) {
                throw new Error("No gaze input configured.");
            }
            await $gazeManagerStore.calibrate();
        } catch (error) {
            console.error(error);
        }
        isCalibratedProcessing = false;
    };
</script>

<div class="container">
        <Button disabled={disabled || isConnectedProcessing} text={"Connect"} on:click={connect} />
        <Button disabled={disabled || isCalibratedProcessing} text={"Calibrate"} on:click={calibrate} />
        <Button disabled={disabled || isStartedProcessing} text={"Start"} on:click={start} />
        <Button disabled={disabled || isStoppedProcessing} text={"Stop"} on:click={stop} />
        <Button disabled={disabled || isDisconnectedProcessing} text={"Disconnect"} on:click={disconnect} />
        <Button {disabled} text={isGazeIndicatorVisible ? "Hide gaze indicator" : "Show gaze indicator"} on:click={() => {
            toggleGazeIndicator(!isGazeIndicatorVisible);
        }} />
        <Button {disabled} text={"Null gaze input"} on:click={() => setGazeInput(null)} />
</div>

<style>
.container {
    margin-bottom: 10px;
    padding: 20px;
    border: 1px solid #dee2e6;
    border-radius: .5rem;
}
</style>