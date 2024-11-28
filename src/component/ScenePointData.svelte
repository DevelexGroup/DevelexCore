<script lang="ts">
    import Group from "./GenericGroup.svelte";
    import GenericTable from "./GenericTable.svelte";
    import { scenePointStore } from "../store/sceneStores";

</script>

<Group heading="Point of Gaze Data (last 300)">
    <GenericTable data={$scenePointStore} headers={["timestamp", "xL", "xR", "yL", "yR", "fixationDuration"]} />
</Group>