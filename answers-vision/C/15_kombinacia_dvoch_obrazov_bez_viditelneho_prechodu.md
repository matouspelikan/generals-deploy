# 15. Kombinácia dvoch obrazov bez viditeľného prechodu

Naivní cross-fade vytvoří viditelný šev, pokud mají obrazy různé jasy nebo frekvence. **Řešením je multiresolution blending** přes **Laplaceovské pyramidy**: (1) spočítej LP obou obrazů $L_A, L_B$ a GP masky $G_M$ přechodu, (2) na **každé úrovni** kombinuj $L_{out}^i = G_M^i \cdot L_A^i + (1 - G_M^i) \cdot L_B^i$, (3) **zrekonstruuj** výsledný obraz z $L_{out}$. Tím se nízké frekvence míchají s **širokou maskou** (hladký přechod) a vysoké s úzkou (zachová detaily) — šev je neviditelný (Burt & Adelson).
