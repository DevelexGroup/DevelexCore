<script lang="ts">
	import { GazeIndicator } from "$lib/GazeIndicator/GazeIndicator";
	import type { GazeInputMessage } from "$lib/GazeInput/GazeInputEvent";
    import type { GazeDataPoint } from "$lib/GazeData/GazeData";
    import { gazeInputStore, setGazeInput } from "../store/gazeInputStore";
	import Button from "./Button.svelte";
	import { scenePointDataStore, sceneStateStore } from "../store/sceneStores";

    let isGazeIndicatorVisible = true;
    const indicator = new GazeIndicator();
    $: disabled = $gazeInputStore === null;

    let isConnectedProcessing = false;
    let isStartedProcessing = false;
    let isStoppedProcessing = false;
    let isDisconnectedProcessing = false;
    let isCalibratedProcessing = false;

    const handleGazeInputMessage = (data: GazeInputMessage) => {
        sceneStateStore.update((store) => {
            store.push(data);
            return store;
        });
        switch (data.type) {
            case "emit":
                handleEmitEvent(data);
                break;
        }
    };

    const handleEmitEvent = (data: GazeInputMessage) => {
        if (!$gazeInputStore) return;
        if (data.value && isGazeIndicatorVisible) {
            initIndicator();
        } else {
            destroyIndicator();
        }
    };

    $: if ($gazeInputStore !== null) {
        $gazeInputStore.on("state", (data) => {
            handleGazeInputMessage(data);
        });
        $gazeInputStore.on("data", (data) => {
            scenePointDataStore.update((store) => {
                store.push(data);
                return store;
            });
        });
    }

    const drawGaze = (gaze: GazeDataPoint) => {
        indicator.draw(gaze);
    };

    const initIndicator = () => {
        if ($gazeInputStore === null) {
            return;
        }
        indicator.init(document);
        $gazeInputStore.on("data", drawGaze);
    };

    const destroyIndicator = () => {
        if ($gazeInputStore === null) {
            return;
        }
        $gazeInputStore.off("data", drawGaze);
        indicator.remove();
    };

    const toggleGazeIndicator = (targetValue: boolean) => {
        if ($gazeInputStore === null) {
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
            if ($gazeInputStore === null) {
                throw new Error("No gaze input configured.");
            }
            await $gazeInputStore.connect();
        } catch (error) {
            console.error(error);
        }
        isConnectedProcessing = false;
    };

    const disconnect = async () => {
        isDisconnectedProcessing = true;
        try {
            if ($gazeInputStore === null) {
                throw new Error("No gaze input configured.");
            }
            await $gazeInputStore.disconnect();
        } catch (error) {
            console.error(error);
        }
        isDisconnectedProcessing = false;
    };

    const start = async () => {
        isStartedProcessing = true;
        try {
            if ($gazeInputStore === null) {
                throw new Error("No gaze input configured.");
            }
            await $gazeInputStore.start();
        } catch (error) {
            console.error(error);
        }
        isStartedProcessing = false;
    };

    const stop = async () => {
        isStoppedProcessing = true;
        try {
            if ($gazeInputStore === null) {
                throw new Error("No gaze input configured.");
            }
            await $gazeInputStore.stop();
        } catch (error) {
            console.error(error);
        }
        isStoppedProcessing = false;
    };

    const calibrate = async () => {
        isCalibratedProcessing = true;
        try {
            if ($gazeInputStore === null) {
                throw new Error("No gaze input configured.");
            }
            await $gazeInputStore.calibrate();
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