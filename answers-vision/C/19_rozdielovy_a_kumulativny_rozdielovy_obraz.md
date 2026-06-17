# 19. Rozdielový a kumulatívny rozdielový obraz

**Rozdílový obraz (Difference Image)** mezi dvěma snímky detekuje pohyb: $d(x,y) = 0$ pokud $|f(x,y,t) - f(x,y,t+1)| \leq \varepsilon$ (žádná změna), jinak 1. Hodnota 1 může znamenat pohybující se objekt vs. pozadí, **šum** nebo přechod mezi dvěma objekty. **Kumulativní rozdílový obraz (CDI)** je vážený součet rozdílů vůči **referenčnímu obrazu** $b(x,y)$ přes $N$ snímků: $d_{CDI}(x,y) = \sum_{k=1}^N a_k |b(x,y) - f(x,y,t_0+k)|$ — zvýrazní oblasti s opakovaným pohybem a potlačí náhodný šum.
