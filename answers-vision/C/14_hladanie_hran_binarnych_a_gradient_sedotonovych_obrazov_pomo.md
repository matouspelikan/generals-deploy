# 14. Hľadanie hrán binárnych a gradient šedotónových obrazov pomocou morfológie

V **binárních obrazech** se hrany získají rozdílem objektu a jeho eroze/dilatace: **vnitřní** $\text{Edge}_I(A) = A \setminus (A \ominus E)$, **vnější** $\text{Edge}_E(A) = (A \oplus E) \setminus A$, **standardní** $\text{Edge}_S(A) = (A \oplus E) \setminus (A \ominus E)$. V **šedotónových** obrazech je analogicky **morfologický gradient** $\text{Grad}_S(A) = (A \oplus E) - (A \ominus E)$ — rozdíl maxima a minima v okně danou SE; aproximuje magnitudu gradientu intenzity.
