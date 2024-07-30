<script lang="ts">
	import type { GazeInteractionObjectValidationSettings } from "$lib";
    import { sceneObjectValidationStore } from "../store/sceneStores";
	import Group from "./GenericGroup.svelte";
	import GenericTable from "./GenericTable.svelte";
	import Validation from "./Validation.svelte";
    import { validationObjectStore } from "../store/interactionStores";

    const settings: Partial<GazeInteractionObjectValidationSettings> & { validationDuration: number } = {
        accuracyTolerance: 100,
        validationDuration: 1000,
    };

    const validations = [
        {aoi:"validation-1",
        animation: "smaller",
        color: "red"},
        {aoi:"validation-2",
        animation: "bigger",
        color: "blue"},
        {aoi:"validation-3",
        animation: "pulse",
        color: "green"},
    ] as const;

</script>

<div class="holder">
    <Group heading="Validation Circles">
        <div class="grouping">
        {#each validations as setting}
            <Validation aoi={setting.aoi} validationSettings={settings} validator={$validationObjectStore} animation={setting.animation} color={setting.color} />
        {/each}
        </div>
    </Group>
    <Group heading="Validation Interaction Log">
        <GenericTable data={$sceneObjectValidationStore} headers={["timestamp", "type", "isValid", "allDataPointsCount", "validDataPointsCount", "validDataPointsPercentage", "accuracy", "precision"]} />
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