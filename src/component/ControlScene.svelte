<script>
    import SceneInputState from "./SceneInputState.svelte";
	import ScenePointData from "./ScenePointData.svelte";
    import Tabs from "./Tabs.svelte";

    // List of tab items with labels, values and assigned components
    let items = [
        { label: "Input State",
            value: 1,
            component: SceneInputState
        },
        { label: "Point Data",
            value: 2,
            component: ScenePointData
        }
    ];
</script>

<Tabs {items} />