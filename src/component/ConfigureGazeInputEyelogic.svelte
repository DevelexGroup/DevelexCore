<script lang="ts">
    import type { GazeInputConfigEyelogic } from "$lib";
    import InputSelect from "./InputSelect.svelte";
    import InputText from "./InputText.svelte";
    import InputSubmit from "./InputSubmit.svelte";
    import { setGazeInput } from "../store/gazeInputStore";
    const tracker = "eyelogic";
    const config: GazeInputConfigEyelogic = {
        tracker,
        fixationDetection: "none",
        uri: "ws://localhost:13892",
    };

    const submit = (event: MouseEvent) => {
        event.preventDefault();
        setGazeInput({
            inputConfig: config,
            mouseEvent: event,
            window
        });
    };
</script>

<form>
    <div class="container">
        <InputText label="URI" bind:value={config.uri} />
        <InputSelect label="Fixation Detection" bind:value={config.fixationDetection} options={["none"]} />
    </div>
    <InputSubmit text="Start new input instance" on:click={submit} />
</form>

<style>
    .container {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
    }
</style>