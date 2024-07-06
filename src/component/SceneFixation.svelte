<script lang="ts">
    import { gazeInputStore } from "../store/gazeInputStore";
    import { addFixationEvent, sceneObjectFixationStore } from "../store/sceneStores";
    import { GazeInteractionObjectFixation } from "$lib";
	import { onDestroy, onMount } from "svelte";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";

    const fixationHandler = new GazeInteractionObjectFixation();

    let firstElement: HTMLElement;

    $: if ($gazeInputStore !== null) {
        fixationHandler.connectInput($gazeInputStore);
    }

    onDestroy(() => {
        if ($gazeInputStore !== null) fixationHandler.disconnectInput($gazeInputStore);
    });

    onMount(() => {
        fixationHandler.register(firstElement, {
            bufferSize: 10,
            onFixationStart: () => {
                console.log("Fixation started");
            },
            onFixationEnd: () => {
                console.log("Fixation ended");
            },
            onFixationProgress: (progress) => {
                console.log("Fixation progress: ", progress);
            },
        });
    });
</script>

<div class="holder">
    <Group heading="Fixation Interaction Elements">
        <div class="circle" bind:this={firstElement}></div>
    </Group>
    <Group heading="Fixation Interaction Log">
        <GenericTable data={$sceneObjectFixationStore} headers={["timestamp", "type", "elapsed"]} />
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
    .circle {
        width: 100px;
        height: 100px;
        background-color: #FFDB58;
        border-radius: 50%;
    }
</style>