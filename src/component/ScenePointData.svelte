<script lang="ts">
    import Group from "./GenericGroup.svelte";
    import GenericTable from "./GenericTable.svelte";
    import { scenePointStore } from "../store/sceneStores";

</script>

<div class="holder">
    <Group heading="Point Data Log">
        <GenericTable data={$scenePointStore} headers={["timestamp", "x", "y", "xL", "yL", "xR", "yR"]} />
    </Group>
</div>