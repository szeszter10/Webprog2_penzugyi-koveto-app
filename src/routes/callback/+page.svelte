<script>
    import { onMount } from 'svelte';
    import { format } from 'date-fns';

    let message = 'Kapcsolat visszaigazolása...';
    let accountId = null;

    onMount(async () => {
        const url = new URL(window.location.href);
        console.log('🔁 Callback URL:', url.toString());
        let requisitionId = url.searchParams.get('requisition_id');

        if (!requisitionId) {
            requisitionId = localStorage.getItem('requisition_id');
        }

        if (!requisitionId) {
            message = '❌ Hiányzik a requisition azonosító.';
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/api/nordigen/accounts/${requisitionId}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Ismeretlen hiba');

            accountId = data.accountId;
            const now = new Date();
            const time = format(now, 'yyyy.MM.dd HH:mm:ss');

            localStorage.setItem('nordigen_account_id', accountId);
            localStorage.setItem('nordigen_connected_at', time);

            message = `✅ Kapcsolat sikeresen létrehozva!\n\n🔐 Account ID: ${accountId}\n🕒 Csatlakozás ideje: ${time}`;
        } catch (err) {
            console.error('❌ Hiba:', err);
            message = '❌ Nem sikerült lekérni a csatolt számlát.';
        }
    });
</script>

<h1 class="text-2xl font-bold mb-4">Kapcsolat visszaigazolása</h1>
<pre class="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm">{message}</pre>
