<script>
	import ControlConfigureGazeInput from "../component/ControlConfigureGazeInput.svelte";
    import ControlGazeInput from "../component/ControlGazeInput.svelte";
	import ControlScene from "../component/ControlScene.svelte";
</script>

<svelte:head>
	<title>Develex Test Controls</title>
	<meta name="description" content="Test your eye-tracker with the Develex framework">
</svelte:head>

<main>
	<header class="flex flex-row items-center justify-center">
		<img src="/favicon.png" alt="develex-core" width="80" height="80" />
		<div>
			<h1>Develex Test Controls</h1>
			<h2>Test your eye-tracker with the Develex framework</h2>
		</div>
	</header>
	<ControlConfigureGazeInput />
	<ControlGazeInput />
	<ControlScene />
</main>

<style>
	header {
		margin-block: 2rem;
		gap: 1rem;
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	h1, h2 {
		margin: 0;
		font-weight: 800;
		letter-spacing: 0.05rem;
		line-height: 1.2;
		color: #0071bc
	}
	h1 {
		font-size: 1.6rem;
	}
	h2 {
		font-size: 1.1rem;
		font-weight: 600;
	}
	main {
		margin: 0 auto;
		padding-inline: 1rem;
		max-width: 1200px;
		min-width: 900px;
	}
</style>