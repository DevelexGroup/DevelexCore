<script lang="ts">
    import { gazeInputStore } from "../store/gazeInputStore";
    import { addDwellEvent, sceneObjectDwellStore } from "../store/sceneStores";
    import { GazeInteractionObjectDwell } from "$lib";
	import { onDestroy, onMount } from "svelte";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";

    const dwellHandler = new GazeInteractionObjectDwell();

    let firstElement: HTMLElement;

    $: if ($gazeInputStore !== null) {
        dwellHandler.connectInput($gazeInputStore);
    }

    onDestroy(() => {
        if ($gazeInputStore !== null) dwellHandler.disconnectInput($gazeInputStore);
    });

    onMount(() => {
        dwellHandler.register(firstElement, {
            bufferSize: 10,
            dwellTime: 500,
            onDwellProgress: addDwellEvent,
            onDwellCancel: addDwellEvent,
            onDwellFinish: addDwellEvent,
        });
    });
</script>

<div class="holder">
    <Group heading="Dwell Interaction Elements">
        <div class="circle" bind:this={firstElement}></div>
    </Group>
    <Group heading="Dwell Interaction Log">
        <GenericTable data={$sceneObjectDwellStore} headers={["timestamp", "type", "elapsed"]} />
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