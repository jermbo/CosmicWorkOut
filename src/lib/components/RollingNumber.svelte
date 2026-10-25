<!--
	A figure that rolls when it changes (v1.12.0): up when it grows, down when it
	shrinks. Styling comes from the parent — this only animates. Reduced motion
	is handled by the global rule in app.css (Svelte transitions are CSS animations).
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { cubicOut } from 'svelte/easing';

	let { value }: { value: number | string } = $props();

	let dir = $state(1);
	let prev = untrack(() => value);

	$effect.pre(() => {
		const next = value;
		const a = Number(next);
		const b = Number(prev);
		dir = !Number.isNaN(a) && !Number.isNaN(b) && a < b ? -1 : 1;
		prev = next;
	});

	function roll(_node: Element, { dir }: { dir: number }) {
		return {
			duration: 200,
			easing: cubicOut,
			css: (t: number) => `transform: translateY(${(1 - t) * dir * 45}%); opacity: ${t}`,
		};
	}
</script>

{#key value}
	<span
		class="roll"
		in:roll={{ dir }}>{value}</span
	>
{/key}

<style>
	.roll {
		display: inline-block;
	}
</style>
