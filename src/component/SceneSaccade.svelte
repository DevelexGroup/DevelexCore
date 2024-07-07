<script lang="ts">
    import { gazeInputStore } from "../store/gazeInputStore";
    import { addSaccadeEvent, sceneObjectSaccadeStore } from "../store/sceneStores";
    import { GazeInteractionObjectSaccade } from "$lib";
	import { onDestroy } from "svelte";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";
	import GenericTestElement from "./GenericTestElement.svelte";

    const saccadeHandler = new GazeInteractionObjectSaccade();

    $: if ($gazeInputStore !== null) {
        saccadeHandler.connectInput($gazeInputStore);
    }

    onDestroy(() => {
        if ($gazeInputStore !== null) saccadeHandler.disconnectInput($gazeInputStore);
    });

    const settings = {
        bufferSize: 10,
        onSaccadeTo: addSaccadeEvent,
        onSaccadeFrom: addSaccadeEvent,
    };

    const aoiLabels = ["saccade-a", "saccade-b", "saccade-c"];
</script>

<div class="holder">
    <Group heading="Saccade Interaction Elements">
        <div class="grouping">
        {#each aoiLabels as aoi}
            <GenericTestElement aoi={aoi} settings={settings} register={saccadeHandler.register.bind(saccadeHandler)} unregister={saccadeHandler.unregister.bind(saccadeHandler)} />
        {/each}
        </div>
    </Group>
    <Group heading="Saccade Interaction Log">
        <GenericTable data={$sceneObjectSaccadeStore} headers={["timestamp", "type", "angleToScreen", "angleToPrevious", "target.id"]} />
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
    .grouping {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }
</style>