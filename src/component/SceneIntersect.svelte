<script lang="ts">
	import { gazeManagerStore } from "../store/gazeInputStore";
    import { sceneObjectIntersectStore } from "../store/sceneStores";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";
	import GenericTestElement from "./GenericTestElement.svelte";

    const settings = {
        bufferSize: 10
    };

    const aoiLabels = ["intersect-a", "intersect-b", "intersect-c"];

    const registerFn = (element: HTMLElement) => {
        if (!$gazeManagerStore) return;
        $gazeManagerStore.register({
            interaction: "intersect",
            element,
            settings,
        });
    };

    const unregisterFn = (element: HTMLElement) => {
        if (!$gazeManagerStore) return;
        $gazeManagerStore.unregister({
            interaction: "intersect",
            element,
        });
    };
</script>

<div class="holder">
    <Group heading="Intersect Interaction Elements">
        <div class="grouping">
        {#each aoiLabels as aoi}
            <GenericTestElement aoi={aoi} {registerFn} {unregisterFn} />
        {/each}
        </div>
    </Group>
    <Group heading="Intersect Interaction Log">
        <GenericTable data={$sceneObjectIntersectStore} headers={["timestamp", "xL", "xR", "yL", "yR", "fixationDuration", "aoi"]} />
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