<script>
    import BankList from '$lib/components/BankList.svelte';
    import { onMount } from 'svelte';

    let alreadyConnected = false;

    onMount(() => {
        const accountId = localStorage.getItem('nordigen_account_id');
        if (accountId) {
            alreadyConnected = true;
        }
    });

    function removeConnection() {
        localStorage.removeItem('nordigen_account_id');
        localStorage.removeItem('nordigen_connected_at');
        localStorage.removeItem('requisition_id');
        location.reload();
    }
</script>

<h1 class="text-2xl font-bold mb-4">Beállítások</h1>

{#if alreadyConnected}
    <p class="text-[green-700] bg-[rgb(182,195,184)] border border-[rgb(132,145,134)] p-4 rounded mb-4">
        ✅ Már csatlakoztál egy bankszámlához!<br />
        🔐 Account ID: <code class="font-mono">{localStorage.getItem('nordigen_account_id')}</code>
    </p>

    <button
            on:click={removeConnection}
            class="bg-[rgb(231,146,142)] text-red-800 px-4 py-2 rounded hover:bg-[rgb(201,116,112)] transition"
    >
        ❌ Kapcsolat törlése
    </button>
{:else}
    <p class="mb-4 text-gray-700">
        Itt tudod csatlakoztatni a bankszámláidat a PSD2 API-n keresztül. Válaszd ki a bankod, majd csatlakozz a GoCardless sandbox környezetéhez.
    </p>

    <BankList />
{/if}
