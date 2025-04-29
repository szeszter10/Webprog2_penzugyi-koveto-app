<script>
	import { onMount, tick } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import { browser } from '$app/environment';

	Chart.register(...registerables);

	export let transactions = [];
	export let targetCurrency = 'HUF';

	let canvas;
	let chart;
	let hasData = false;

	let rateCache = new Map();

	async function convert(amount, from, to) {
		if (from === to) return amount;
		if (!browser) return amount;

		const key = `${from}->${to}`;
		if (!rateCache.has(key)) {
			try {
				const res = await fetch(`/api/exchange?base=${from}&target=${to}`);
				const data = await res.json();
				rateCache.set(key, data?.rate || 1);
			} catch (err) {
				console.error('Árfolyam hiba:', err);
				rateCache.set(key, 1);
			}
		}
		return amount * rateCache.get(key);
	}

	async function prepareChartData() {
		const categories = {};

		for (const tx of transactions) {
			let amount = Number(tx.amount);
			if (amount <= 0) continue;

			amount = await convert(amount, tx.currency, targetCurrency);

			const category = tx.category || 'Egyéb';
			categories[category] = (categories[category] || 0) + amount;
		}

		return categories;
	}

	async function renderChart() {
		if (!canvas) return;

		if (chart) {
			chart.destroy();
			chart = null;
			await tick();
		}

		const categories = await prepareChartData();
		const labels = Object.keys(categories);
		const data = Object.values(categories);

		if (data.length === 0) {
			hasData = false;
			chart = new Chart(canvas, {
				type: 'bar',
				data: {
					labels: ['Nincs adat'],
					datasets: [{
						data: [0],
						backgroundColor: '#e5e7eb'
					}]
				},
				options: {
					scales: { y: { beginAtZero: true } },
					plugins: { legend: { display: false } }
				}
			});
		} else {
			hasData = true;
			chart = new Chart(canvas, {
				type: 'bar',
				data: {
					labels,
					datasets: [{
						label: 'Bevételek kategóriánként',
						data,
						backgroundColor: '#B0C6E6',
						borderColor: '#B0C8E6',
						borderWidth: 1
					}]
				},
				options: {
					scales: { y: { beginAtZero: true,ticks: { color: '#665954' } },
										x: { ticks: { color: '#665954' }}
									},
					plugins: {
						legend: { display: false },
						tooltip: {
							backgroundColor: '#111827',
							titleColor: '#EBE0CB',
							bodyColor: '#e5e7eb',
							titleFont: { weight: 'bold' },
							padding: 10,
							cornerRadius: 6
						}
					}
				}
			});
		}
	}

	$: if (transactions.length > 0 || targetCurrency) {
		renderChart();
	}

	onMount(() => {
		renderChart();
	});
</script>

<div class="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
	<h2 class="text-lg text-[#665954] font-bold mb-9 text-center"
			style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);">Bevételi megoszlás</h2>
	<canvas bind:this={canvas} class="w-full max-w-[500px] mx-auto"></canvas>
	{#if !hasData}
		<p class="text-center text-[#665954] italic mt-2">Nincs bevételi adat.</p>
	{/if}
</div>
