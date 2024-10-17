<script lang="ts">
	import { onDestroy, onMount } from "svelte";
    import type { GazeInteractionObjectValidationSettings } from "$lib";
	import type { GazeManager } from "$lib/GazeManager/GazeManager";

    export let validationSettings: Partial<GazeInteractionObjectValidationSettings> & { validationDuration: number };
    export let validator: GazeManager;
    export let centerCoordinates: { x: number, y: number };
    export let animation: 'smaller' | 'bigger' | 'pulse' = 'smaller';
    export let color: string = 'red';

    let element: HTMLElement;
    let duration = validationSettings.validationDuration; // ms

    onMount(() => {
        validator.register({
            interaction: "validation",
            element,
            settings: validationSettings,
        });
    });

    onDestroy(() => {
        validator.unregister({
            interaction: "validation",
            element,
        });
    });
</script>


<div bind:this={element} class="validation-circle {animation}" style="left: {centerCoordinates.x}px; top: {centerCoordinates.y}px; background-color: {color};">
</div>

<style>
    .validation-circle {
        position: absolute;
        left: 50%;
        top: 50%;
        aspect-ratio: 1;
        transform: translate(-50%, -50%) scale(0);
        width: 120px;
        height: 120px;
        background-color: red;
        opacity: 0.25;
        border-radius: 50%;
        animation: circle-smaller 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .validation-circle.pulse {
        animation: circle-pulse 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .validation-circle.bigger {
        animation: circle-bigger 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes circle-pulse {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
        }
        50% {
            opacity: 0.75;
            transform: translate(-50%, -50%) scale(0.25);
        }
        75% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(0.5);
        }
        100% {
            opacity: 0.25;
            transform: translate(-50%, -50%) scale(0);
        }
    }

    @keyframes circle-smaller {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0.75;
            transform: translate(-50%, -50%) scale(0);
        }
    }

    @keyframes circle-bigger {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
        }
        100% {
            opacity: 0.75;
            transform: translate(-50%, -50%) scale(1);
        }
    }
</style>