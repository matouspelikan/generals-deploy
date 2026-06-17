# 12. Distance transform

**Distance transform (DT)** binárního obrazu přiřadí každému pixelu **vzdálenost k nejbližší hraně** objektu — výsledkem je šedotónová mapa (metriky: euklidovská, City Block / Manhattan, Chessboard). **Souvislost s morfologií:** DT lze interpretovat jako rekurzivní erozi, kde hodnota pixelu = iterace, ve které zmizel; ekvivalence se SE — čtverec ↔ chessboard, kříž ↔ city block, kruh ↔ euklidovská. **Použití:** efektivní implementace dilatace/eroze s velkým SE, skelet, segmentace (watershed), shape analysis.
