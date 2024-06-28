<script>
    import ConfigureInputDummy from "./ConfigureGazeInputDummy.svelte";
    import ConfigureInputGazePoint from "./ConfigureGazeInputGazePoint.svelte";
    import Tabs from "./Tabs.svelte";

    // List of tab items with labels, values and assigned components
    let items = [
        { label: "Dummy",
            value: 1,
            component: ConfigureInputDummy
        },
        { label: "GazePoint",
            value: 2,
            component: ConfigureInputGazePoint
        },
    ];
</script>

<Tabs {items} />