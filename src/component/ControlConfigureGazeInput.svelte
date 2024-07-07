<script>
    import ConfigureInputDummy from "./ConfigureGazeInputDummy.svelte";
	import ConfigureGazeInputEyelogic from "./ConfigureGazeInputEyelogic.svelte";
    import ConfigureInputGazePoint from "./ConfigureGazeInputGazePoint.svelte";
	import ConfigureGazeInputSmi from "./ConfigureGazeInputSMI.svelte";
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
            label: "SMI",
            value: 4,
            component: ConfigureGazeInputSmi
        }
    ];
</script>

<Tabs {items} />