<script>
	import { onMount, tick } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import { browser } from '$app/environment';

	Chart.register(...registerables);

	export let transactions = [];

	let canvas;
	let chart;
	let selectedYear = null;
	let monthlyIncome = Array(12).fill(0);
	let monthlyExpense = Array(12).fill(0);
	let hasData = false;
	const fixedTargetCurrency = 'HUF';

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

	async function groupData() {
		monthlyIncome = Array(12).fill(0);
		monthlyExpense = Array(12).fill(0);

		const years = Array.from(new Set(transactions.map(tx => (new Date(tx.date)).getFullYear()))).sort((a, b) => b - a);

		if (!years.length) {
			selectedYear = new Date().getFullYear();
			return;
		}
		selectedYear = years[0];

		for (const tx of transactions) {
			const date = new Date(tx.date);
			if (!tx.amount || isNaN(date)) continue;

			if (date.getFullYear() === selectedYear) {
				let amount = Number(tx.amount);
				if (tx.currency !== fixedTargetCurrency) {
					amount = await convert(amount, tx.currency, fixedTargetCurrency);
				}
				const month = date.getMonth();
				if (amount > 0) {
					monthlyIncome[month] += amount;
				} else {
					monthlyExpense[month] += Math.abs(amount);
				}
			}
		}

		hasData = monthlyIncome.some(val => val !== 0) || monthlyExpense.some(val => val !== 0);
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
				labels: ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szept', 'Okt', 'Nov', 'Dec'],
				datasets: [
					{
						label: 'Bevétel',
						data: monthlyIncome,
						borderColor: '#EADFC9',
						backgroundColor: 'rgba(234, 223, 201,0.4)',
						fill: true,
						tension: 0.3
					},
					{
						label: 'Kiadás',
						data: monthlyExpense,
						borderColor: '#B5C3B7',
						backgroundColor: 'rgba(181, 195, 183,0.4)',
						fill: true,
						tension: 0.3
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						ticks: { color: '#5F4C4A', font: { size: 10 } },
						grid: { color: '#eee' }
					},
					y: {
						beginAtZero: false,
						ticks: {
							color: '#5F4C4A',
							font: { size: 10 }
						},
						grid: { color: '#eee' },
						title: {
							display: true,
							text: fixedTargetCurrency,
							color: '#5F4C4A',
							font: { size: 12, weight: 'bold' }
						},
						suggestedMin: 0,
						suggestedMax: undefined
					}

				},
				plugins: {
					legend: {
						labels: { color: '#5F4C4A', font: { size: 10 }, boxWidth: 18,
							boxHeight: 14, padding: 4 }
					},
					tooltip: {
						backgroundColor: '#111827',
						titleColor: '#EBE0CB',
						bodyColor: '#e5e7eb',
						padding: 8,
						cornerRadius: 6
					}
				}
			}
		});
	}

	$: if (transactions.length) {
		groupData().then(renderChart);
	}

	onMount(async () => {
		await groupData();
		await renderChart();
	});
</script>

<div class="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 p-4 rounded-xl text-sm w-full max-w-xs flex flex-col gap-2">
	<h2 class="text-[13px] font-bold text-[#665954] text-center">
		{selectedYear ? `Évi Bevétel-Kiadás Arány (${selectedYear})` : 'Bevétel-Kiadás'}
	</h2>

	<div class="h-36">
		<canvas bind:this={canvas} class="w-full"></canvas>
	</div>

	{#if !hasData}
		<p class="text-center text-xs text-gray-500 mt-2">Nincs adat erre az évre.</p>
	{/if}
</div>
