<script lang="ts">
    export let heading: string = "Group Component";
</script>

<div>
    <h2>{heading}</h2>
    <slot />
</div>

<style>
    h2 {
        margin-top: 0;
        font-size: small;
    }
    div {
        max-width: 100%;
    }
</style>