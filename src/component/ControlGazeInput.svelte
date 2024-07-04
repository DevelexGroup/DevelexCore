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
        $gazeInputStore.on("message", (data) => {
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

    const connect = () => {
        try {
            if ($gazeInputStore === null) {
                throw new Error("No gaze input configured.");
            }
            $gazeInputStore.connect();
        } catch (error) {
            console.error(error);
        }
    };

    const disconnect = () => {
        try {
            if ($gazeInputStore === null) {
                throw new Error("No gaze input configured.");
            }
            $gazeInputStore.disconnect();
        } catch (error) {
            console.error(error);
        }
    };

    const start = () => {
        try {
            if ($gazeInputStore === null) {
                throw new Error("No gaze input configured.");
            }
            $gazeInputStore.start();
        } catch (error) {
            console.error(error);
        }
    };

    const stop = () => {
        try {
            if ($gazeInputStore === null) {
                throw new Error("No gaze input configured.");
            }
            $gazeInputStore.stop();
        } catch (error) {
            console.error(error);
        }
    };
</script>

<div class="container">
        <Button {disabled} text={"Connect"} on:click={connect} />
        <Button {disabled} text={"Start"} on:click={start} />
        <Button {disabled} text={"Stop"} on:click={stop} />
        <Button {disabled} text={"Disconnect"} on:click={disconnect} />
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