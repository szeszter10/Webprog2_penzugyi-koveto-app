<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    export let transactions = [];
    export let targetCurrency = 'HUF';

    let income = 0;
    let expense = 0;
    let balance = 0;

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
                console.error('Árfolyam hiba SummaryCardban:', err);
                rateCache.set(key, 1);
            }
        }
        return amount * rateCache.get(key);
    }

    async function calculate() {
        income = 0;
        expense = 0;
        balance = 0;

        for (const tx of transactions) {
            let amount = Number(tx.amount);
            if (tx.currency !== targetCurrency) {
                amount = await convert(amount, tx.currency, targetCurrency);
            }

            if (amount > 0) {
                income += amount;
            } else {
                expense += Math.abs(amount);
            }
        }

        balance = income - expense;
    }

    $: if (browser && transactions.length > 0 && targetCurrency) {
        calculate();
    }

    onMount(async () => {
        if (transactions.length > 0) {
            await calculate();
        }
    });
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
    <div class="bg-[#8FAD9F] text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
        <p class="text-base font-semibold" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.25);">Bevétel</p>
        <p class="text-2xl font-bold" style="text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.35);">
            {income.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {targetCurrency}
        </p>
    </div>
    <div class="bg-[#E9E0C8] text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
        <p class="text-base font-semibold" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.25);">Kiadás</p>
        <p class="text-2xl font-bold" style="text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.35);">
            {expense.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {targetCurrency}
        </p>
    </div>
    <div class="bg-[#7D9EB9] text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
        <p class="text-base font-semibold" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.25);">Egyenleg</p>
        <p class="text-2xl font-bold" style="text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.35);">
            {balance.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {targetCurrency}
        </p>
    </div>
</div>
