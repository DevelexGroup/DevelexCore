<script>
	import { ETGazeIndicator } from "$lib/ETGazeIndicator/ETGazeIndicator";
    import { gazeInputStore } from "../store/gazeInputStore";
	import Button from "./Button.svelte";
    import { onMount } from "svelte";

    let isGazeIndicatorVisible = true;
    let isDocumentReady = false;
    const indicator = new ETGazeIndicator();

    /*
    $: if ($gazeInputStore !== null && isGazeIndicatorVisible && document) {
        if ($gazeInputStore !== null && isGazeIndicatorVisible) {
            alert($gazeInputStore.isEmitting)
            indicator.init(document);
            $gazeInputStore.on("data", (gaze) => {
                indicator.draw(gaze);
            });
        } else {
            $gazeInputStore.off("data", (gaze) => {
                indicator.draw(gaze);
            });
            indicator.remove();
        }
    }*/

    onMount(() => {
        isDocumentReady = true;
    });

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
    {#if $gazeInputStore === null}
        <p>
            No gaze input configured.
        </p>
    {:else}
        <Button text={"Connect"} on:click={connect} />
        <Button text={"Start"} on:click={start} />
        <Button text={"Stop"} on:click={stop} />
        <Button text={"Disconnect"} on:click={disconnect} />
        <Button text={"Null gaze input"} on:click={() => gazeInputStore.set(null)} />
    {/if}
</div>