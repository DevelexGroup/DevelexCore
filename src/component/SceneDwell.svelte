<script lang="ts">
    import { gazeInputStore } from "../store/gazeInputStore";
    import { addDwellEvent, sceneObjectDwellStore } from "../store/sceneStores";
    import { GazeInteractionObjectDwell } from "$lib";
	import { onDestroy } from "svelte";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";
	import GenericTestElement from "./GenericTestElement.svelte";

    const dwellHandler = new GazeInteractionObjectDwell();

    $: if ($gazeInputStore !== null) {
        dwellHandler.connectInput($gazeInputStore);
    }

    onDestroy(() => {
        if ($gazeInputStore !== null) dwellHandler.disconnectInput($gazeInputStore);
    });

    const settings = {
        bufferSize: 10,
        dwellTime: 500,
        onDwellProgress: addDwellEvent,
        onDwellCancel: addDwellEvent,
        onDwellFinish: addDwellEvent,
    };

    const aoiLabels = ["dwell-a", "dwell-b", "dwell-c"];
</script>

<div class="holder">
    <Group heading="Dwell Interaction Elements">
        <div class="grouping">
        {#each aoiLabels as aoi}
            <GenericTestElement aoi={aoi} settings={settings} register={dwellHandler.register.bind(dwellHandler)} unregister={dwellHandler.unregister.bind(dwellHandler)} />
        {/each}
        </div>
    </Group>
    <Group heading="Dwell Interaction Log">
        <GenericTable data={$sceneObjectDwellStore} headers={["timestamp", "type", "elapsed", "target.id"]} />
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