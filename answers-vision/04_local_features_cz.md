# 4. Hledání objektů pomocí lokálních příznaků — detektor a deskriptor

**Zdroj:** PV_8 (Local features)
**Reference:**
- D. Lowe, *Distinctive Image Features from Scale-Invariant Keypoints*, IJCV 2004 (SIFT)
- H. Bay, T. Tuytelaars, L. Van Gool, *SURF: Speeded Up Robust Features*, ECCV 2006
- E. Rosten, T. Drummond, *Machine learning for high-speed corner detection*, ECCV 2006 (FAST)

---

## Hlavní myšlenka

**Lokální příznak** = malý, vizuálně výrazný kus obrazu (typicky **roh** nebo **blob**), jehož okolí lze popsat kompaktním vektorem. Tyto příznaky:

- jsou **opakovatelné** napříč různými snímky téhož objektu,
- jsou (do jisté míry) **invariantní** vůči změně škály, rotaci, osvětlení a částečnému zakrytí.

**Hledání objektů pomocí lokálních příznaků** funguje tak, že si v obraze najdeme významné body, popíšeme jejich okolí, najdeme **korespondence** s body z modelu hledaného objektu a ověříme je geometricky.

---

## Tři základní kroky lokálních příznaků

Slidy uvádějí jasnou pipeline (opakovanou třikrát):

1. **Detection** — nalezení bodů zájmu (interest points, IP).
2. **Description** — vytvoření vektoru popisujícího okolí každého bodu zájmu.
3. **Matching** — nalezení korespondencí mezi příznaky.

Pro **hledání objektů** se navíc přidává čtvrtý krok:

4. **Nalezení transformace** mezi modelem a scénou a **identifikace objektu** (typicky pomocí **RANSAC**).

---

## Kompletní pipeline „Object detection"

Ze slidů („Object detection"):

```
1.+2.  Najdi IP a spočítej deskriptory   ──►  (např. SURF / SIFT)
3.     Spáruj příznaky (matching)        ──►  SAD / SSD / cosine, distance ratio
4.     Najdi transformaci, identifikuj objekt
       ──► RANSAC + homografie / afinní transformace H
```

---

## 1) Detekce — zvolený detektor: **SIFT (DoG detektor)**

SIFT detektor hledá body zájmu jako **extrémy v DoG (Difference of Gaussians) prostoru** — což je rychlá aproximace LoG prostoru.

### DoG (Difference of Gaussians) prostor

Definujeme Gaussovský škálový prostor:

$$
J(x, y, \sigma) = G(\sigma) * I(x, y)
$$

a rozdíly sousedních škál:

$$
D(x, y, \sigma) = G(k\sigma) * I(x, y) - G(\sigma) * I(x, y)
$$

### Detekce bodů zájmu

- Body zájmu = **lokální extrémy** (minima a maxima) hodnoty $D$ v **26-okolí** v DoG prostoru.
  - 8 sousedů ve **stejné škále**
  - 9 + 9 sousedů v **sousedních škálách**
- Pro každý extrém se určí **pozice** $(x, y)$ a **škála** $\sigma$ → bod je tím **invariantní vůči škále**.

### Filtrování slabých kandidátů

Detekované extrémy se **filtrují** ve dvou krocích:

1. **Odstranění bodů s nízkým kontrastem** — práh na hodnotu $D$ v nalezeném extrému.
2. **Odstranění bodů na hranách** — body na hranách jsou špatně lokalizované. Pomocí Hessovy matice druhých derivací:

$$
\mathbf{H} =
\begin{pmatrix}
D_{xx} & D_{xy} \\
D_{xy} & D_{yy}
\end{pmatrix}
$$

Spočítáme $\det \mathbf{H} = \lambda_1 \lambda_2$ a $\operatorname{trace} \mathbf{H} = \lambda_1 + \lambda_2$. Pro poměr vlastních čísel $r = \lambda_1 / \lambda_2$ platí:

$$
\frac{(\operatorname{trace} \mathbf{H})^2}{\det \mathbf{H}} = \frac{(r+1)^2}{r}
$$

Pokud je tento poměr příliš velký, jde o hranu a bod je odmítnut.

### Přiřazení orientace

Každému bodu se přiřadí **dominantní orientace** podle gradientů v okolí:

$$
\theta(x, y) = \arctan\!\left(\frac{J(x, y+1) - J(x, y-1)}{J(x+1, y) - J(x-1, y)}\right)
$$

Tím je deskriptor následně možné **rotovat na kanonickou orientaci** → invariance vůči rotaci.

### Proč SIFT detektor

| Vlastnost | Splnění |
|-----------|---------|
| Škálová invariance | **Ano** (extrémy v DoG napříč škálami) |
| Rotační invariance | **Ano** (orientace odvozená z gradientů) |
| Robustnost k osvětlení | **Ano** (gradientní reprezentace) |
| Lokalizace | Subpixelová |

Harris detektor (zmiňovaný na slidech) **není škálově invariantní**, proto se pro hledání objektů SIFT/SURF/FAST používají častěji.

---

## 2) Popis — zvolený deskriptor: **SIFT (128-dim HOG)**

SIFT deskriptor je založen na přístupu **HOG (Histogram of Oriented Gradients)**.

### Princip HOG

1. V každém pixelu se spočítá **gradient** (velikost + směr).
2. Okolí se rozdělí na **buňky** a v každé buňce se sestaví **histogram orientací gradientů**.
3. Bloky buněk se **normalizují** (kompenzace osvětlení).
4. Histogramy se zřetězí do jednoho vektoru — to je deskriptor.

### SIFT deskriptor konkrétně

- Okno **16 × 16 pixelů** kolem bodu zájmu.
- Okno se **otočí** podle dominantní orientace bodu (zajištění rotační invariance).
- Okno se rozdělí na **4 × 4 buňky**, každá o velikosti 4 × 4 pixely.
- V každé buňce se sestaví **histogram s 8 koši** (8 směrů orientace gradientu).
- Příspěvky se vážou **Gaussovskou váhou** se $\sigma = 1{,}5 \cdot \text{scale}$ (středy okna mají větší vliv).
- Výsledný deskriptor: **4 × 4 × 8 = 128 hodnot**.

### Proč SIFT deskriptor

- **128 dimenzí** → kompaktní.
- **Rotační invariance** (otočení podle dominantní orientace).
- **Škálová invariance** (velikost okna se škáluje s nalezenou škálou bodu).
- **Robustnost k osvětlení** (normalizace HOG bloku).
- **Robustnost k částečnému zakrytí** (lokální popis).

### Pro srovnání — další deskriptory ze slidů

| Deskriptor | Velikost | Princip |
|------------|---------|---------|
| Raw data | velký | vektor intenzit pixelů |
| HOG | 3780 hodnot pro 128×64 | Histogram orientovaných gradientů, normalizace 16×16 bloků |
| **SIFT** | **128 hodnot** | **HOG ve 4×4 buňkách s 8 koši + rotace** |
| SURF | 64 hodnot | Haar wavelet responses (vertikální + horizontální) ve 16 buňkách × 4 features |
| BRIEF | 128 / 256 bitů | Binární — porovnání párů intenzit pixelů |

---

## 3) Matching — hledání korespondencí

Pro každý deskriptor $\mathbf{p}$ z modelu hledáme **nejbližší deskriptor** $\mathbf{d}$ ve scéně.

### Metriky vzdálenosti

| Metrika | Vzorec |
|---------|--------|
| **SAD** (Sum of Absolute Differences) | $\sum_{i=1}^{D} |p_i - d_i|$ |
| **SSD** (Sum of Squared Differences) | $\sum_{i=1}^{D} (p_i - d_i)^2$ |
| **Kosinová** | $\cos(\mathbf{p}, \mathbf{d}) = \dfrac{\mathbf{p} \cdot \mathbf{d}}{\|\mathbf{p}\| \cdot \|\mathbf{d}\|}$ |

### Strategie párování

1. **Nearest-neighbor matching** — vezmu nejbližší bod, a pokud je jeho vzdálenost pod prahem, akceptuji shodu. Problém: jednoduchý práh nedostatečně rozlišuje true/false matche.
2. **Distance ratio test (Loweův)** — porovnám vzdálenost k **nejbližšímu** ($D_B$) a **druhému nejbližšímu** ($D_C$) bodu:

$$
\frac{D_A - D_B}{D_A - D_C} < t
$$

Pokud je nejbližší soused **výrazně lepší** než druhý, je shoda spolehlivá. Toto je standardní filtrování v SIFT.

---

## 4) Nalezení transformace — RANSAC

Po matchování máme **sadu kandidátních korespondencí**, které stále obsahují velké procento **outlierů** (chybných shod). Hledáme **geometrickou transformaci** mezi modelem a scénou, která odpovídá co největšímu počtu korespondencí.

### Hledaná transformace

**Afinní transformace** (6 neznámých, alespoň **3 body** × 2 souřadnice):

$$
\begin{pmatrix} x'_i \\ y'_i \end{pmatrix}
= \begin{pmatrix} m_1 & m_2 \\ m_3 & m_4 \end{pmatrix}
\begin{pmatrix} x_i \\ y_i \end{pmatrix}
+ \begin{pmatrix} t_1 \\ t_2 \end{pmatrix}
$$

**Homografie** (projektivní transformace, 8 stupňů volnosti, alespoň **4 body**):

$$
\begin{pmatrix} x'_i \\ y'_i \\ 1 \end{pmatrix}
= \begin{pmatrix}
h_{11} & h_{12} & h_{13} \\
h_{21} & h_{22} & h_{23} \\
h_{31} & h_{32} & h_{33}
\end{pmatrix}
\begin{pmatrix} x_i \\ y_i \\ 1 \end{pmatrix}
$$

### Algoritmus RANSAC (RANdom SAmple Consensus)

Iterativní metoda určení parametrů modelu z bodů s **outliery**:

1. **Náhodně vyber** minimální podmnožinu korespondencí (sample).
2. **Spočítej parametry** transformace z tohoto vzorku.
3. **Najdi podporu modelu** (consensus set) — korespondence, které jsou ve specifikované vzdálenosti od modelu (inliers).
4. **Opakuj** pro $N$ vzorků.
5. **Vyhrává model** s největším konsensem.
6. (Volitelně) Přepočítej parametry z celé množiny inlierů.

### Volba parametrů RANSAC

- **Velikost vzorku** $s$ — minimální počet potřebný pro výpočet modelu (3 pro afinní, 4 pro homografii).
- **Práh vzdálenosti** $t$ — tak, aby např. **95 %** inlierů podporovalo vítězný model. Pro Gaussovský šum $\mathcal{N}(0, \sigma^2)$: $t^2 = 3{,}84\sigma^2$.
- **Počet opakování** $N$ — tak, aby s pravděpodobností $p$ (např. $0{,}99$) alespoň jeden vzorek **neobsahoval** outlier. Při podílu outlierů $e$:

$$
N = \frac{\log(1 - p)}{\log\!\left(1 - (1 - e)^s\right)}
$$

Protože $e$ obvykle **neznáme**, určuje se **adaptivně**: začínáme s $e = 1$, $N = \infty$ a při každém lepším konsensu počet iterací **snižujeme**.

---

## Shrnutí celé pipeline (zkouškové)

Hledání objektů pomocí lokálních příznaků se skládá ze **3 (resp. 4) kroků**:

1. **Detekce bodů zájmu** v obrazech modelu i scény. Zvolený detektor **SIFT** hledá lokální extrémy v **DoG prostoru** ve 26-okolí (čímž dosahuje **škálové invariance**), odstraňuje **nízkokontrastní** a **hranové** body (přes Hessovu matici a poměr $(r+1)^2/r$) a každému bodu přiřadí **dominantní orientaci** podle gradientů (rotační invariance).

2. **Popis okolí** každého bodu zájmu. Zvolený deskriptor **SIFT** popisuje okno **16 × 16** rotované do kanonické orientace, rozdělené na **4 × 4 buňky**, s **8-košovým histogramem orientovaných gradientů** v každé buňce (HOG) a Gaussovskou váhou se $\sigma = 1{,}5 \cdot \text{scale}$. Výsledný vektor má **128 dimenzí**.

3. **Matching** deskriptorů metrikami SAD/SSD/kosinovou, s filtrováním přes **distance ratio test** (poměr vzdálenosti k nejbližšímu a druhému nejbližšímu sousedovi musí být dostatečně malý).

4. **Geometrické ověření** — pomocí **RANSAC** se najde **afinní transformace** (≥ 3 body) nebo **homografie** (≥ 4 body), která má největší **konsensus**. Vítězná transformace identifikuje objekt ve scéně.

Tento postup je základem klasických systémů jako rozpoznávání objektů, panorama stitching, 3D rekonstrukce a augmentovaná realita.
