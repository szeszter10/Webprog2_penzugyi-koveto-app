<script>
  import ExpensePieChart from '$lib/components/ExpensePieChart.svelte';
  import IncomeBarChart from '$lib/components/IncomeBarChart.svelte';
  import SummaryCard from '$lib/components/SummaryCard.svelte';
  import TransactionList from '$lib/components/TransactionList.svelte';
  import CurrencyRateCard from '$lib/components/CurrencyRateCard.svelte';
  import MiniExchangeChart from '$lib/components/MiniExchangeChart.svelte';
  import { onMount } from 'svelte';
  import YearlyIncomeExpenseChart from '$lib/components/YearlyIncomeExpenseChart.svelte';


  let transactions = [];
  let eurToHufRate = 400;
  let viewCurrency = 'HUF';
  let selectedCustomCurrency = 'USD';

  let selectedYear = 'all';
  let selectedMonth = 'all';
  let selectedCurrency = 'all';

  let loading = true;

  const allSelectableCurrencies = ['USD', 'CHF', 'GBP', 'JPY', 'PLN', 'NOK', 'CZK'];

  const monthNames = [
    '01 - Január', '02 - Február', '03 - Március', '04 - Április', '05 - Május', '06 - Június',
    '07 - Július', '08 - Augusztus', '09 - Szeptember', '10 - Október', '11 - November', '12 - December'
  ];

  $: extraTransactionCurrencies = Array.from(
    new Set(transactions.map(tx => tx.currency).filter(c => c !== 'HUF' && c !== 'EUR'))
  );

  $: availableCurrencies = Array.from(new Set(transactions.map(tx => tx.currency))).sort();
  $: availableYears = Array.from(new Set(transactions.map(tx => tx.date.slice(0, 4)))).sort().reverse();

  $: availableMonths = Array.from(new Set(
    transactions
      .filter(tx => selectedYear === 'all' || tx.date.startsWith(selectedYear))
      .map(tx => tx.date.slice(5, 7))
  )).sort();

  $: filteredTransactions = transactions.filter(tx => {
    const yearMatch = selectedYear === 'all' || tx.date.startsWith(selectedYear);
    const monthMatch = selectedMonth === 'all' || tx.date.slice(5, 7) === selectedMonth;
    const currencyMatch = selectedCurrency === 'all' || tx.currency === selectedCurrency;
    return yearMatch && monthMatch && currencyMatch;
  });

  $: activeCurrency = viewCurrency === 'CUSTOM' ? selectedCustomCurrency : viewCurrency;

  onMount(async () => {
    try {
      const res = await fetch('/api/transactions');
      transactions = await res.json();
      loading = false;
    } catch (error) {
      console.error('Hiba a tranzakciók betöltésekor:', error);
      loading = false;
    }

    const rateRes = await fetch('/api/exchange?base=EUR&target=HUF');
    const { rate } = await rateRes.json();
    eurToHufRate = rate;
  });
</script>

<h1 class="text-2xl font-bold mb-6">Pénzügyi Áttekintés</h1>

<div class="flex flex-wrap gap-4 mb-6">
  <CurrencyRateCard />
  <MiniExchangeChart />
  <YearlyIncomeExpenseChart transactions={filteredTransactions} />
</div>

<div class="flex flex-wrap items-center gap-4 mb-4">
  <button
    on:click={() => viewCurrency = 'HUF'}
    class="px-4 py-2 rounded-lg font-semibold text-[#5F4C4A] shadow-md hover:shadow-lg active:translate-y-[1px] transition duration-150
      {viewCurrency === 'HUF'
        ? 'bg-[#C7D5C7]'
        : 'bg-[#ECE6DF] hover:bg-[#C9C3BC] active:bg-[#A19B94]'}">
    Forint nézet
  </button>
  <button
    on:click={() => viewCurrency = 'EUR'}
    class="px-4 py-2 rounded-lg font-semibold text-[#5F4C4A] shadow-md hover:shadow-lg active:translate-y-[1px] transition duration-150
      {viewCurrency === 'EUR'
        ? 'bg-[#C7D5C7]'
        : 'bg-[#ECE6DF] hover:bg-[#C9C3BC] active:bg-[#A19B94]'}"
  >
    Euro nézet
  </button>
  <button
    on:click={() => viewCurrency = 'CUSTOM'}
    class="px-4 py-2 rounded-lg font-semibold text-[#5F4C4A] shadow-md hover:shadow-lg active:translate-y-[1px] transition duration-150
      {viewCurrency === 'CUSTOM'
        ? 'bg-[#C7D5C7]'
        : 'bg-[#ECE6DF] hover:bg-[#C9C3BC] active:bg-[#A19B94]'}">
    Egyéb deviza
  </button>

  {#if viewCurrency === 'CUSTOM'}
    <select bind:value={selectedCustomCurrency} class="min-w-[90px] h-[42px] px-3 py-2 text-sm border rounded bg-white">
      {#each allSelectableCurrencies as curr}
        <option value={curr}>{curr}{extraTransactionCurrencies.includes(curr) ? ' *' : ''}</option>
      {/each}
    </select>
  {/if}
</div>

<div class="flex flex-wrap gap-4 mb-6">
  <div>
    <label class="font-semibold text-[#5F4C4A] mr-2" for="yearFilter">Év:</label>
    <select id="yearFilter" bind:value={selectedYear}
            class="border-[1px] border-[#5F4C4A] rounded px-3 py-2 pr-8 appearance-none bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5F4C4A]">
      <option value="all">Összes</option>
      {#each availableYears as year}
        <option value={year}>{year}</option>
      {/each}
    </select>
  </div>

  <div>
    <label class="font-semibold text-[#5F4C4A] mr-2" for="monthFilter">Hónap:</label>
    <select id="monthFilter" bind:value={selectedMonth}
            class="border-[1px] border-[#5F4C4A] rounded px-3 py-2 pr-8 appearance-none bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5F4C4A]">
      <option value="all">Összes</option>
      {#each availableMonths as month}
        <option value={month}>{monthNames[Number(month)-1]}</option>
      {/each}
    </select>
  </div>

  <div>
    <label class="font-semibold text-[#5F4C4A] mr-2" for="currencyFilter">Pénznem:</label>
    <select id="currencyFilter" bind:value={selectedCurrency}
            class="border-[1px] border-[#5F4C4A] rounded px-3 py-2 pr-8 appearance-none bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5F4C4A]">
      <option value="all">Összes</option>
      {#each availableCurrencies as curr}
        <option value={curr}>{curr}</option>
      {/each}
    </select>
  </div>
</div>

{#if loading}
  <div class="text-center text-gray-400 mt-10">
    <p class="text-lg font-semibold animate-pulse">Betöltés...</p>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <ExpensePieChart transactions={filteredTransactions} targetCurrency={activeCurrency} />
    <IncomeBarChart transactions={filteredTransactions} targetCurrency={activeCurrency} />
  </div>

  <SummaryCard transactions={filteredTransactions} targetCurrency={activeCurrency} />

  <TransactionList transactions={filteredTransactions} targetCurrency={activeCurrency} />
{/if}
