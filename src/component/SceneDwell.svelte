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

    const registerFn = (element: HTMLElement) => {
        $dwellObjectStore.register(element, settings);
    };

    const unregisterFn = (element: HTMLElement) => {
        $dwellObjectStore.unregister(element);
    };
</script>

<div class="holder">
    <Group heading="Dwell Interaction Elements">
        <div class="grouping">
        {#each aoiLabels as aoi}
            <GenericTestElement aoi={aoi} {registerFn} {unregisterFn} />
        {/each}
        </div>
    </Group>
    <Group heading="Dwell Interaction Log">
        <GenericTable data={$sceneObjectDwellStore} headers={["timestamp", "type", "duration", "target"]} />
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