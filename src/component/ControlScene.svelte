<script>
	import SceneDownload from "./SceneDownload.svelte";
	import SceneDwell from "./SceneDwell.svelte";
	import SceneFixation from "./SceneFixation.svelte";
    import SceneInputState from "./SceneInputState.svelte";
	import SceneIntersect from "./SceneIntersect.svelte";
	import ScenePointData from "./ScenePointData.svelte";
	import SceneSaccade from "./SceneSaccade.svelte";
	import SceneValidation from "./SceneValidation.svelte";
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
        {
            label: "Intersect",
            value: 3,
            component: SceneIntersect
        },
        { label: "Dwell",
            value: 4,
            component: SceneDwell
        },
        {
            label: "Fixation",
            value: 5,
            component: SceneFixation
        },
        {
            label: "Saccade",
            value: 6,
            component: SceneSaccade
        },
        {
            label: "Validation",
            value: 7,
            component: SceneValidation
        },
        {
            label: "Download",
            value: 8,
            component: SceneDownload
        }
    ];
</script>

<Tabs {items} />