<script>
	import SceneDownload from "./SceneDownload.svelte";
	import SceneDwell from "./SceneDwell.svelte";
	import SceneFixation from "./SceneFixation.svelte";
    import SceneInputState from "./SceneInputState.svelte";
	import ScenePointData from "./ScenePointData.svelte";
	import SceneSaccade from "./SceneSaccade.svelte";
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
        },
        { label: "Dwell",
            value: 3,
            component: SceneDwell
        },
        {
            label: "Fixation",
            value: 4,
            component: SceneFixation
        },
        {
            label: "Saccade",
            value: 5,
            component: SceneSaccade
        },
        {
            label: "Download",
            value: 6,
            component: SceneDownload
        }
    ];
</script>

<Tabs {items} />