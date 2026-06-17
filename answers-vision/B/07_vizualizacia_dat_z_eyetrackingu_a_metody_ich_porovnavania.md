# 7. Vizualizácia dát z eyetrackingu a metódy ich porovnávania

**Heatmapy** vizualizují **hustotu fixací** v obraze. Z bodů fixací se vytvoří 2D pravděpodobnostní hustota (např. konvolucí s Gaussiánem), která se vybarví barevnou škálou (modrá = málo, červená = hodně). Pro zvýraznění hlavních oblastí se aplikuje **prahování**. **Gaze trajectory** (trajektorie pohledu) zobrazuje fixace jako **kružnice** spojené úsečkami — poloměr kružnice odpovídá **délce fixace**, úsečky reprezentují **sakády** a pořadí. Tím je vidět nejen kde se pozorovatel díval, ale i v jakém pořadí.

**Porovnávání heatmap:** heatmapy se chápou jako **pravděpodobnostní hustoty** a porovnávají se **Kullback–Leiblerovou divergencí** $D_{KL}(P\|Q) = \sum P \log(P/Q)$, případně dalšími metrikami (korelace, EMD). Tím se dá kvantifikovat, jak moc se liší pohled dvou pozorovatelů (např. expert vs. začátečník) nebo stejného pozorovatele při různých úkolech.
