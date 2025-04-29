<script>
	import { onMount, tick } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import { browser } from '$app/environment';

	Chart.register(...registerables);

	let canvas;
	let chart;

	let availableCurrencies = [
		'AUD', 'CAD', 'CHF', 'CZK', 'EUR', 'GBP', 'HUF', 'JPY', 'NOK', 'PLN', 'SEK', 'USD'
	];

	let base = 'EUR';
	let target = 'HUF';
	let rates = [];
	let dates = [];

	async function fetchRates() {
		if (!browser) return;

		const today = new Date();
		const past = new Date();
		past.setDate(today.getDate() - 6);

		const start = past.toISOString().split('T')[0];
		const end = today.toISOString().split('T')[0];

		const res = await fetch(`https://api.frankfurter.app/${start}..${end}?from=${base}&to=${target}`);
		const data = await res.json();

		dates = Object.keys(data.rates);
		rates = dates.map(date => data.rates[date][target]);
	}

	async function renderChart() {
		if (!canvas) return;

		if (chart) {
			chart.destroy();
			await tick();
		}

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: dates.map(date => date.slice(5)),
				datasets: [{
					label: `${base} ➔ ${target}`,
					data: rates,
					fill: true,
					backgroundColor: 'rgba(176, 198, 230, 0.2)',
					borderColor: '#7B8794',
					tension: 0.3
				}]
			},
			options: {
				scales: {
					x: {
						ticks: { color: '#5F4C4A', font: { size: 10 } },
						grid: { color: '#eee' }
					},
					y: {
						beginAtZero: false,
						ticks: { color: '#5F4C4A', font: { size: 10 } },
						grid: { color: '#eee' }
					}
				},
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: '#111827',
						titleColor: '#EBE0CB',
						bodyColor: '#e5e7eb',
						padding: 8,
						cornerRadius: 6
					}
				},
				responsive: true,
				maintainAspectRatio: false
			}
		});
	}

	$: if (browser && base && target) {
		fetchRates().then(() => renderChart());
	}

	onMount(async () => {
		await fetchRates();
		await renderChart();
	});
</script>

<div class="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 p-4 rounded-xl text-sm w-full max-w-xs flex flex-col gap-2">
	<div class="flex justify-between items-center mb-2">
		<h2 class="text-[13px] font-bold text-[#665954]">Árfolyam alakulás (7 nap)</h2>
		<div class="flex gap-2">
			<select bind:value={base} class="border px-2 py-1 rounded w-15 h-6 text-xs">
				{#each availableCurrencies as curr}
					<option value={curr}>{curr}</option>
				{/each}
			</select>
			<select bind:value={target} class="border px-2 py-1 rounded w-15 h-6 text-xs">
				{#each availableCurrencies as curr}
					<option value={curr}>{curr}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="h-36">
		<canvas bind:this={canvas} class="w-full"></canvas>
	</div>
</div>
