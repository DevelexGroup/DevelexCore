<script>
	import ControlConfigureGazeInput from "../component/ControlConfigureGazeInput.svelte";
    import ControlGazeInput from "../component/ControlGazeInput.svelte";
	import ControlScene from "../component/ControlScene.svelte";
</script>

<main>
	<div>
		<h1>develex-core</h1>
		<h2>Test your eye-tracker with the develex ecosystem</h2>
	</div>
	<ControlConfigureGazeInput />
	<ControlGazeInput />
	<ControlScene />
</main>

<style>
	h1, h2 {
		margin: 0;
	}
	h2 {
		font-size: medium;
	}
	div {
		margin-block: 2rem;
	}
	main {
		margin: 0 auto;
		padding-inline: 1rem;
		max-width: 1200px;
		min-width: 900px;
	}
</style>