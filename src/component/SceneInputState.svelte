<script lang="ts">
    import Group from "./GenericGroup.svelte";
    import GenericTable from "./GenericTable.svelte";
    import { sceneStateStore, sceneErrorStore } from "../store/sceneStores";
</script>

<div class="holder">
    <Group heading="Error Log">
        <GenericTable data={$sceneErrorStore} headers={["timestamp", "content"]} />
    </Group>

    <Group heading="State Log">
        <GenericTable data={$sceneStateStore} headers={["timestamp", "trackerStatus", "viewportCalibration"]} />
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
</style>
