<script lang="ts">
	import { ETGazeIndicator } from "$lib/ETGazeIndicator/ETGazeIndicator";
	import type { GazeInputMessage } from "$lib/GazeInput/GazeInputEvent";
    import { gazeInputStore } from "../store/gazeInputStore";
	import Button from "./Button.svelte";

    let isGazeIndicatorVisible = true;
    const indicator = new ETGazeIndicator();

    const handleGazeInputMessage = (data: GazeInputMessage) => {
        switch (data.type) {
            case "connect":
                
                break;
            case "emit":
                handleEmitEvent(data);
                break;
        }
    };

    const handleEmitEvent = (data: GazeInputMessage) => {
        if (!$gazeInputStore) return;
        if (data.value) {
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
    };

    $: if ($gazeInputStore !== null) {
        $gazeInputStore.on("message", (data) => {
            handleGazeInputMessage(data);
        });
    }

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