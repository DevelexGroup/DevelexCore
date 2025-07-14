<script lang="ts">
    import { gazeManagerStore } from "../store/gazeInputStore";
    import { sceneObjectSaccadeStore } from "../store/sceneStores";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";
	import GenericTestElement from "./GenericTestElement.svelte";

    const settings = {
        bufferSize: 10
    };

    const aoiLabels = ["saccade-a", "saccade-b", "saccade-c"];

    const registerFn = (element: HTMLElement) => {
        if (!$gazeManagerStore) return;
        $gazeManagerStore.register({
            interaction: "saccade",
            element,
            settings,
        });
    };

    const unregisterFn = (element: HTMLElement) => {
        if (!$gazeManagerStore) return;
        $gazeManagerStore.unregister({
            interaction: "saccade",
            element,
        });
    };
</script>

<div class="holder">
    <Group heading="Saccade Interaction Elements">
        <div class="grouping">
        {#each aoiLabels as aoi}
            <GenericTestElement aoi={aoi} {registerFn} {unregisterFn} />
        {/each}
        </div>
    </Group>
    <Group heading="Saccade Interaction Log">
        <GenericTable data={$sceneObjectSaccadeStore} headers={["timestamp", "type", "duration", "distance", "aoi"]} />
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