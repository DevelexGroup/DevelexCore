<script lang="ts">
    import { gazeInputStore } from "../store/gazeInputStore";
    import { addFixationEvent, sceneObjectFixationStore } from "../store/sceneStores";
    import { GazeInteractionObjectFixation } from "$lib";
	import { onDestroy } from "svelte";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";
	import GenericTestElement from "./GenericTestElement.svelte";

    const fixationHandler = new GazeInteractionObjectFixation();

    $: if ($gazeInputStore !== null) {
        fixationHandler.connectInput($gazeInputStore);
    }

    onDestroy(() => {
        if ($gazeInputStore !== null) fixationHandler.disconnectInput($gazeInputStore);
    });

    const settings = {
        bufferSize: 10,
        onFixationProgress: addFixationEvent,
        onFixationEnd: addFixationEvent,
        onFixationStart: addFixationEvent,
    };

    const aoiLabels = ["fixation-a", "fixation-b", "fixation-c"];
</script>

<div class="holder">
    <Group heading="Fixation Interaction Elements">
        <div class="grouping">
        {#each aoiLabels as aoi}
            <GenericTestElement aoi={aoi} settings={settings} register={fixationHandler.register.bind(fixationHandler)} unregister={fixationHandler.unregister.bind(fixationHandler)} />
        {/each}
        </div>
    </Group>
    <Group heading="Fixation Interaction Log">
        <GenericTable data={$sceneObjectFixationStore} headers={["timestamp", "type", "duration", "target.id"]} />
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