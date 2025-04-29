<script>
    import { onMount } from 'svelte';

    export let availableCurrencies = [
        'HUF', 'EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CZK', 'PLN', 'AUD', 'CAD'
    ];
    export let base = 'EUR';
    export let target = 'HUF';

    let rate = null;
    let error = null;

    async function fetchRate() {
        rate = null;
        error = null;
        if (base === target) {
            rate = 1;
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/api/exchange?base=${base}&target=${target}`);
            const data = await res.json();
            if (!res.ok || !data.rate) throw new Error(data.error || 'Hiba történt');
            rate = data.rate;
        } catch (err) {
            error = err.message;
        }
    }

    onMount(() => {
        fetchRate();
    });

    $: if (base && target && typeof window !== 'undefined') {
        fetchRate();
    }
</script>

<div class="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 p-4 rounded-xl text-sm w-full max-w-xs">
    <div class="flex gap-2 items-center mb-4">
        <label for="base" class="font-semibold whitespace-nowrap">Pénznemből:</label>
        <select id="base" bind:value={base} class="border px-2 py-1 rounded w-full">
            {#each availableCurrencies as curr}
                <option value={curr}>{curr}</option>
            {/each}
        </select>
    </div>

    <div class="flex gap-8 items-center mb-5">
        <label for="target" class="font-semibold whitespace-nowrap">Devizára:</label>
        <select id="target" bind:value={target} class="border px-2 py-1 rounded w-full">
            {#each availableCurrencies as curr}
                <option value={curr}>{curr}</option>
            {/each}
        </select>
    </div>

    {#if error}
        <p class="text-red-600 text-xs">{error}</p>
    {:else if rate}
        <p class="text-center text-xl font-bold">{base} → {target}: {rate.toFixed(4)}</p>
    {:else}
        <p class="text-gray-500 text-center">Töltés...</p>
    {/if}
</div>
