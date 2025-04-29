<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let transactions = [];
  export let targetCurrency = 'HUF';

  //console.log('TransactionList kapott tranzakciók:', transactions);

  let convertedTransactions = [];
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

  async function refreshConverted() {
    const updated = [];

    for (const tx of transactions) {
      let converted = Number(tx.amount);
      if (tx.currency !== targetCurrency) {
        converted = await convert(converted, tx.currency, targetCurrency);
      }
      updated.push({ ...tx, converted });
    }

    convertedTransactions = updated;
  }

  onMount(async () => {
    if (transactions.length > 0) {
      await refreshConverted();
    }
  });

  $: if (transactions.length > 0 || targetCurrency) {
    refreshConverted();
  }
</script>

<div class="space-y-4">
  {#if convertedTransactions.length > 0}
    {#each convertedTransactions as tx, index (tx.id || index)}
      <div class="p-4 border border-[rgb(102,91,89)] rounded bg-[rgb(255,255,254)] shadow-sm hover:shadow-md transition-shadow duration-300">

      <div class="flex justify-between">
          <div>
            <p class="font-semibold  text-[rgb(102,91,89)]">{tx.description || 'Névtelen tranzakció'}</p>
            <p class="text-sm text-[rgb(102,91,89)]">{tx.date} – {tx.category}</p>
          </div>
          <div class="text-right font-mono">
            <p class="{tx.amount < 0 ? 'text-[rgb(190,158,100)]' : 'text-[rgb(10,97,82)]'}">
              {tx.amount} {tx.currency}
              {#if tx.currency !== targetCurrency}
                <span class="text-xs text-[rgb(102,91,89)]">
                  ({tx.converted.toFixed(2)} {targetCurrency})
                </span>
              {/if}
            </p>
          </div>
        </div>
      </div>
    {/each}
  {:else}
    <p class="text-center text-[rgb(102,91,89)] italic mt-4">Nincs tranzakció ehhez a szűréshez.</p>
  {/if}
</div>
