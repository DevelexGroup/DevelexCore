<script lang="ts">
    import { dwellObjectStore } from "../store/interactionStores";
    import { addDwellEvent, sceneObjectDwellStore } from "../store/sceneStores";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";
	import GenericTestElement from "./GenericTestElement.svelte";

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
            <GenericTestElement aoi={aoi} settings={settings} register={$dwellObjectStore.register.bind($dwellObjectStore)} unregister={$dwellObjectStore.unregister.bind($dwellObjectStore)} />
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