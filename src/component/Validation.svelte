<script lang="ts">
	import { onDestroy, SvelteComponent } from "svelte";
    import type { GazeInteractionObjectValidationSettings } from "$lib";
	import ValidationCircle from "./ValidationCircle.svelte";
	import type { GazeInteractionObjectValidationEvent } from "$lib/GazeInteraction/GazeInteractionObjectValidation.event";
	import type { GazeManager } from "$lib/GazeManager/GazeManager";

    export let validationSettings: Partial<GazeInteractionObjectValidationSettings> & { validationDuration: number };
    export let validator: GazeManager;
    export let aoi: string;
    export let animation: 'smaller' | 'bigger' | 'pulse' = 'smaller';
    export let color: string = 'red';

    let element: HTMLElement;
    let validationCircleElement: SvelteComponent | null;
    
    const originalOnValidation = validationSettings.onValidation;
    validationSettings.onValidation = (result: GazeInteractionObjectValidationEvent) => {
        if (originalOnValidation) {
            originalOnValidation(result);
        }
        if (validationCircleElement) {
            validationCircleElement.$destroy();
        }
    };

    const handleClick = (e: MouseEvent) => {
        const centerCoordinates = {
            x: e.clientX + window.scrollX,
            y: e.clientY + window.scrollY
        };
        validationCircleElement = new ValidationCircle({
            target: document.body,
            props: {
                validationSettings,
                validator,
                centerCoordinates,
                animation,
                color
            }
        });
    };

    onDestroy(() => {
        if (validationCircleElement) {
            validationCircleElement.$destroy();
        }
    });
</script>

<div id={aoi} bind:this={element} class="circle" on:click={handleClick}>
    <span>{aoi}</span>
</div>

<style>
    .circle {
        width: 100px;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #FFDB58;
        border-radius: 50%;
    }

    span {
        color: #fff;
    }
</style>