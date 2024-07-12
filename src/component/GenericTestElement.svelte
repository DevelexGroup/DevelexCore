<script lang="ts">
	import { onDestroy, onMount } from "svelte";

    export let aoi: string;
    export let registerFn: (element: HTMLElement) => void;
    export let unregisterFn: (element: HTMLElement) => void;

    let element: HTMLElement;

    onMount(() => {
        registerFn(element);
    });

    onDestroy(() => {
        unregisterFn(element);
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