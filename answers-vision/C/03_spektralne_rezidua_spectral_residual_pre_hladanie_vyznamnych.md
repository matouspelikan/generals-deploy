# 3. Spektrálne reziduá (Spectral Residual) pre hľadanie významných oblastí

Hou & Zhang (2007) využívají faktu, že **log-amplitudové spektrum přirozených obrazů má statisticky podobný tvar** — odchylky od něj odpovídají význačným strukturám. **Algoritmus:** obraz se zmenší na 64×64, spočítá se Fourierova transformace $\mathcal{F}(I) = (M, P)$, log-amplituda $L = \log M$, **spektrální reziduum** $R = L - h * L$ (rozdíl od vyhlazeného log-spektra), a saliency mapa je $SM = g * |\mathcal{F}^{-1}(e^{R + iP})|^2$ (Gaussův blur, $\sigma = 8$). Implementace má ~5 řádků MATLABu.
