<script lang="ts">
	import { onDestroy, onMount } from "svelte";

    type RegisterMethod<T> = (element: HTMLElement, settings: Partial<T>) => void;

    export let aoi: string;
    export let settings: Partial<any>;
    export let register: RegisterMethod<any>;
    export let unregister: (element: HTMLElement) => void;

    let element: HTMLElement;

    onMount(() => {
        register(element, settings);
    });

    onDestroy(() => {
        unregister(element);
    });
</script>

<div id={aoi} bind:this={element} class="circle">
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