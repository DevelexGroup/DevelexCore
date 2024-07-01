<script lang="ts">
    import type { GazeInputConfigDummy } from "$lib";
    import { setGazeInput } from "../store/gazeInputStore";
	import InputNumber from "./InputNumber.svelte";
	import InputSubmit from "./InputSubmit.svelte";
    import InputSelect from "./InputSelect.svelte";

    const tracker = "dummy";
    let config: GazeInputConfigDummy = {
        tracker,
        fixationDetection: "none",
        frequency: 30,
        precisionMinimalError: 0.5,
        precisionMaximumError: 1.5, // todo fix
        precisionDecayRate: 0.5,
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
        <InputNumber label="Frequency" bind:value={config.frequency} />
        <InputNumber label="Precision Minimal Error" bind:value={config.precisionMinimalError} step={0.001} />
        <InputNumber label="Precision Maximum Error" bind:value={config.precisionMaximumError} step={0.001} />
        <InputNumber label="Precision Decay Rate" bind:value={config.precisionDecayRate} step={0.001} />
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