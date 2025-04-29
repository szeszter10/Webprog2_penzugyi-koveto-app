Pénzügyi Követő App
Ez egy SvelteKit-alapú frontend + Node.js backend alkalmazás, amely lehetővé teszi személyes pénzügyi tranzakciók kezelését, kimutatások megtekintését és valós idejű devizaátváltást is.

I. Indítás

    1. Backend indítása
    Először a backend mappába szükséges belépni és futtatni:
    (cd...../penzugyi-koveto-app/backend)
    node server.js       parancsot
    Ez elindítja az API szervert a következő címen:
    http://localhost:3000 (fontos, hogy mindig a megadott porton induljon)

    2. Frontend indítása
    Vissza kell térni a főmappába, és futtatni:
    (cd...../penzugyi-koveto-app)
    npm install   (csak első indításkor)
    npm run dev    parancsokat
    A frontend várhatóan elérhető lesz a következő címen:
    http://localhost:5173 vagy más portszámmal rendelkezőn
_______________________________________

II. Bankszámla csatlakoztatása (Sandbox)

A Beállítások menüpontban lehet csatlakoztatni bankszámlát.
Teszteléshez a Sandbox Finance opciót szükséges kiválasztani (zölden bekeretezve).
A megjelenő utasítások követése és a feltételek elfogadását követően lehet sikeres a csatlakoztatás.

Sikeres csatlakozás után:

    •A mock adatokkal együtt betöltődnek a tranzakciók az adatbázisba.
    •Ezek az adatok megjelennek a Dashboard nézetben.
________________________________________

III. Funkciók

    •Tranzakciólista megtekintése és szűrése év, hónap és pénznem szerint.
    •Kimutatások:
        oKiadási megoszlás (kategória szerint)
        oBevételi megoszlás
        oÖsszesítések szűrések alapján
        oÉves bevétel-kiadás görbe
    •Valutaváltás:
        oNézetváltás (HUF, EUR, egyéb deviza) automatikusan konvertálja az adatokat az adott nézet devizájára.
    •Valós idejű devizaárfolyam megjelenítés (Mini exchange chart).
__________________________________________

IV. Technológia

    •Frontend: SvelteKit, TailwindCSS, Chart.js
    •Backend: Node.js, Express
    •Külső API: Frankfurter API, Nordigen sandbox (GoCardless)

