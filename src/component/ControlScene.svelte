<script>
    import SceneInputState from "./SceneInputState.svelte";
    import Tabs from "./Tabs.svelte";

    // List of tab items with labels, values and assigned components
    let items = [
        { label: "Input State",
            value: 1,
            component: SceneInputState
        },
    ];
</script>

<Tabs {items} />