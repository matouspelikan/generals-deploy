# 13. White a Black Top-Hat transformácia

**White Top-Hat** $\text{WTH}(A) = A - (A \circ B)$ extrahuje **světlé objekty** menší než SE $B$ ležící na nekonstantním pozadí — opening odstraní malé světlé struktury, rozdíl je vrátí zpět. **Black Top-Hat** $\text{BTH}(A) = (A \bullet B) - A$ analogicky extrahuje **tmavé objekty** menší než $B$. Použití: **segmentace** světlých/tmavých detailů na proměnlivém pozadí, **vyrovnání nerovnoměrného osvětlení**, a **zvýšení kontrastu** kombinací $A + \text{WTH} - \text{BTH}$.
