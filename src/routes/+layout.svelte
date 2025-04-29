<script>
  import "../app.css";
</script>

<div class="min-h-screen bg-[#FFFDFA] text-gray-800">
  <nav class="bg-gradient-to-br from-slate-600 to-slate-900 text-[#FFFDFA] px-4 py-2 shadow-lg border-b border-slate-950">

    <div class="flex items-center justify-between w-full">

      <div class="flex gap-6 items-center text-base font-medium tracking-wide">
        <a href="/" class="hover:underline drop-shadow-sm">Kezdőlap</a>
        <a href="/dashboard" class="hover:underline drop-shadow-sm">Dashboard</a>
        <a href="/settings" class="hover:underline drop-shadow-sm">Beállítások</a>
      </div>


      <div class="ml-auto flex items-center gap-6">
        <span class="text-base font-medium text-[#FFFDFA]">C3IBYO</span>
        <img src="/pk-logo.png" alt="PK logó" class="h-13 w-14 rounded-md" />
      </div>

    </div>
</nav>

<main class="p-6">
  <slot />
</main>

</div>