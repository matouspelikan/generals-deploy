# 16. Mean-shift

**Mean-shift** je iterativní algoritmus pro nalezení **lokálních maxim hustoty** v prostoru bodů. Nepotřebuje předem znát počet shluků. **Algoritmus pro jeden bod:** (1) inicializuj okno $W$ se zvoleným poloměrem, (2) spočítej **těžiště** bodů uvnitř okna $\bar{x} = \frac{1}{|W|}\sum_{x \in W} x$, (3) přesuň okno do těžiště, (4) opakuj, dokud se okno nezastaví v lokálním maximu hustoty. Při každé iteraci se okno pohybuje **ve směru gradientu hustoty**.

**Mean-shift segmentace obrazu:** (1) z každého pixelu spusť mean-shift v prostoru (barva + pozice) a zaznamenej, do kterého lokálního maxima konvergoval, (2) **shluky pixelů** = ty, které konvergovaly do stejného maxima (s tolerancí). Pixely v jednom **bazinu atrakce** tvoří jeden segment. **Výhody:** žádné předem dané $K$, robustní vůči outlierům, zvládne nekonvexní shluky. **Nevýhody:** výpočetně náročné (lze paralelizovat), citlivé na velikost okna. Reference: Comaniciu & Meer, IEEE TPAMI 2002.
