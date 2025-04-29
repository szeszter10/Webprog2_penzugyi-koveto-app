<script>
    import { onMount } from 'svelte';

    let institutions = [];
    let isLoading = true;
    let selectedInstitution = 'SANDBOXFINANCE_SFIN0000'; //Sandbox az alapértelmezett
    let error = '';

    onMount(async () => {
        try {
            const res = await fetch('http://localhost:3000/api/nordigen/institutions');
            institutions = await res.json();
        } catch (err) {
            error = '❌ Nem sikerült lekérni a banklistát';
            console.error(err);
        } finally {
            isLoading = false;
        }
    });

    async function connectToInstitution() {
        if (!selectedInstitution) return;

        try {
            const res = await fetch('http://localhost:3000/api/nordigen/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ institutionId: selectedInstitution })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Hiba történt');
            }

            localStorage.setItem('requisition_id', data.requisition_id);
            window.location.href = data.link;
        } catch (err) {
            error = '❌ Nem sikerült létrehozni a kapcsolatot';
            console.error(err);
        }
    }
</script>

{#if isLoading}
    <p>Töltés...</p>
{:else if error}
    <p class="text-red-600">{error}</p>
{:else}
    <h2 class="text-xl font-bold mb-4">Válassz bankot</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each institutions as bank}
            <button
                    type="button"
                    class={`text-left w-full border rounded p-6 hover:shadow cursor-pointer transition
          ${selectedInstitution === bank.id ? 'border-[rgb(100,125,114)] ring-5 ring-[rgb(140,165,154)]' : ''}`}
                    on:click={() => selectedInstitution = bank.id}
            >
                <img src={bank.logo} alt={bank.name} class="h-10 mb-2" />
                <h3 class="font-semibold">
                    {bank.name}
                    {#if bank.id === 'SANDBOXFINANCE_SFIN0000'}
                        <span class="text-xs text-white bg-[rgb(100,125,114)] rounded px-2 ml-2">sandbox</span>
                    {/if}
                </h3>
            </button>
        {/each}
    </div>

    {#if selectedInstitution}
        <button
                class="mt-6 bg-[rgb(140,165,154)] text-white px-6 py-2 rounded hover:bg-[rgb(100,125,114)] transition"
                on:click={connectToInstitution}
        >
            Kapcsolódás a kiválasztott bankhoz
        </button>
    {/if}
{/if}
