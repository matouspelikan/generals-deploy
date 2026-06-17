# 8. Hľadanie škvŕn (blobů) pomocou LoG

Pro detekci **blobu o poloměru $r$** se hledá taková škála $\sigma$, kdy LoG odezva v centru blobu je **maximální** — to nastane, když LoG **prochází nulou na okraji blobu** (vztah $\sigma = r/\sqrt{2}$ pro 2D). **Algoritmus:** spočítej **normalizovaný LoG** $\sigma^2 \nabla^2 G$ pro řadu škál $\sigma$, a najdi **lokální extrémy v 3D scale-space** $(x, y, \sigma)$ — to jsou středy a charakteristické škály blobů. Aproximací LoG je **DoG** (rozdíl dvou Gaussiánů) — používá ho SIFT.
