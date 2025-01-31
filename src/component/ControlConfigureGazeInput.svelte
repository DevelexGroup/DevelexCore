<script>
    import ConfigureInputDummy from "./ConfigureGazeInputDummy.svelte";
	import ConfigureGazeInputEyelogic from "./ConfigureGazeInputEyelogic.svelte";
    import ConfigureInputGazePoint from "./ConfigureGazeInputGazePoint.svelte";
	import ConfigureGazeInputAsee from "./ConfigureGazeInputAsee.svelte";
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
        { label: "Eyelogic",
            value: 3,
            component: ConfigureGazeInputEyelogic
        },
        {
            label: "Asee",
            value: 4,
            component: ConfigureGazeInputAsee
        }
    ];
</script>

<Tabs {items} />