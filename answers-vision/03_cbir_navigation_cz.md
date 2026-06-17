# 3. Navigační přístup k výběru obrazů z databáze (CBIR) — projekční metody

**Zdroj:** PV_12 (CBIR — content-based image retrieval)
**Reference:**
- Shapiro, L. G., & Stockman, G. C. (2001). *Computer vision*, Ch. 8
- A. W. M. Smeulders, M. Worring, S. Santini, A. Gupta, R. Jain, *Content-based image retrieval at the end of the early years*, IEEE TPAMI, vol. 22, no. 12, pp. 1349–1380, Dec. 2000.

---

## Kontext: CBIR

**CBIR (Content-Based Image Retrieval)** = vyhledávání obrazů v databázi na základě **obsahu samotných obrazů**, nikoliv na základě textových anotací. Uživatel zadá dotaz (např. obraz, skicu, text, výběr barev) a systém vrátí podobné obrazy.

Podobnost obrazů $Q$ a $D$ je obecně:

$$
S_{Q,D} = s(F_Q, F_D) = g\bigl(d(F_Q, F_D)\bigr)
$$

- $F_Q, F_D$ — příznakové vektory dotazu a obrazu z databáze
- $d$ — metrika/vzdálenost
- $g$ — kladná monotónně neklesající funkce

Podobnost se obvykle počítá nad **barvou, texturou, tvarem** nebo **vztahy objektů**.

---

## Navigační přístup k výběru obrazů

**Standardní CBIR** (např. „query by example") vrací **seřazený seznam** výsledků. **Navigační přístup** je alternativa, která:

> **Rozmístí obrazy ve virtuálním prostoru** tak, aby uspořádání dávalo uživateli **smysl**, a umožní mu se v tomto prostoru **navigovat** (posouvat, přibližovat, vzdalovat).

Klíčová vlastnost: obrazy jsou umístěny tak, aby **vzdálenosti mezi obrazy v zobrazení odrážely jejich podobnost $S_{Q,D}$**. Podobné obrazy jsou blízko sebe, různé daleko od sebe.

### Požadavky na navigační systém

1. Reprezentace celé kolekce má podobu **2D vektorů** (jako ikony / body na monitoru).
2. Při **přiblížení** k dané oblasti se zobrazí **více podobných obrazů** (vyšší úroveň podobnosti).
3. Při **vzdálení** od aktuální oblasti se zobrazí **méně podobné obrazy** (nižší úroveň podobnosti).

### Typický postup

1. **Shlukování (clustering)** kolekce do skupin podobných obrazů.
2. **Konstrukce 2D projekce** každého shluku (resp. celé kolekce) — sem patří projekční metody.
3. **Zobrazení a navigace** — uživatel se pohybuje, zooming, scrolling, a postupně si filtruje výsledky.

### Shlukování (kontext k projekci)

| Hierarchické | Nehierarchické |
|--------------|----------------|
| Single link (min. vzdálenost mezi objekty shluků) | K-means |
| Complete link (max. vzdálenost mezi objekty shluků) | Kohonenovy neuronové sítě (SOM) |
| Average link | Fuzzy clustering |

Shlukování řeší **organizaci do skupin**; projekční metody řeší **rozmístění v rovině**.

---

## Projekční metody

**Cíl:** převést **D-dimenzionální** obrazové reprezentace do **K-dimenzionálního** prostoru ($K = 1, 2$ nebo $3$) tak, aby se **co nejvíce zachovaly vzájemné vzdálenosti / podobnosti**.

Projekční metody se dělí na:

| Typ | Metody |
|-----|--------|
| **Lineární** | Principal Component Analysis (**PCA**), Classical MDS |
| **Nelineární** | **Sammonova projekce** (a obecně nemetrické MDS) |

---

### Multi-dimensional Scaling (MDS) — obecné nastavení

**Vstup:**
- $D$-rozměrná pozorování $x_1, \ldots, x_N$
- **Vzdálenost / nepodobnost** $\delta_{ij}$ mezi pozorováními $i$ a $j$ (může to být metrika, nebo obecnější míra nepodobnosti)

**Cíl:**
- Najít $K$-rozměrné body $y_1, \ldots, y_N$ (typicky $K = 1, 2, 3$)
- Označme jejich vzdálenost v projekci $d_{ij}$
- Body $y_i$ mají co nejlépe **zachovat původní vzdálenosti** $\delta_{ij}$

Konkrétní varianta MDS se liší **účelovou (stress) funkcí**, kterou minimalizuje.

---

### 1) Metric MDS (klasické metrické MDS)

Hledá body, které **co nejlépe zachovávají párové vzdálenosti**. Minimalizuje **stress funkci**:

$$
E_M = \sum_{i \neq j} \bigl(\delta_{ij} - d_{ij}\bigr)^2
$$

- Cíl: chyby vzdáleností se sčítají kvadraticky.
- Důsledek: metoda klade **stejnou váhu na všechny vzdálenosti** — velké absolutní rozdíly dominují optimalizaci.
- Vhodné, když jsou původní vzdálenosti **smysluplné metriky**.

Na slidech je tato metoda **lineární projekce** (Classical MDS), úzce spjatá s PCA.

---

### 2) Sammonova projekce (Sammon's Mapping)

Úzce souvisí s metric MDS, ale **klade větší důraz na malé vzdálenosti**:

> Chyby v zachování vzdáleností jsou **normalizovány původní vzdáleností**.

Stress funkce:

$$
E_S = \sum_{i \neq j} \frac{\bigl(\delta_{ij} - d_{ij}\bigr)^2}{\delta_{ij}}
$$

- Čím **menší původní vzdálenost** $\delta_{ij}$, tím **větší relativní váha** chyby v součtu.
- Důsledek: Sammon **lépe zachovává lokální strukturu** — blízké obrazy zůstávají blízko, i kdyby to znamenalo větší zkreslení vzdálených bodů.
- Pro CBIR navigaci je to **velmi vhodná vlastnost**: uživatel se nejvíc zajímá o lokální okolí aktuálního výběru.

Patří mezi **nelineární projekce**.

---

### 3) Nonmetric MDS (nemetrické MDS)

Důležité je **pouze pořadí (rank order) vzdáleností**, ne jejich konkrétní hodnoty.

- Zavádí se **monotónně rostoucí funkce** $f$, která působí na původní vzdálenosti $\delta_{ij}$.
- Optimalizuje se normalizovaná stress funkce:

$$
E_{NM} = \frac{\sum_{i \neq j} \bigl(f(\delta_{ij}) - d_{ij}\bigr)^2}{\sum_{i \neq j} d_{ij}^2}
$$

- Užitečné tam, kde **nemáme spolehlivou metrickou vzdálenost**, ale máme jen relativní porovnání (např. „A je podobnější B než C").
- $f$ se zpravidla hledá společně s body $y_i$, podléhá pouze monotonii.

Také patří mezi **nelineární projekce**.

---

## Srovnání projekčních metod

| Vlastnost | Metric MDS | Sammonova projekce | Nonmetric MDS |
|-----------|------------|--------------------|----------------|
| **Zachovává** | absolutní párové vzdálenosti | malé vzdálenosti (lokální strukturu) | pořadí vzdáleností |
| **Citlivost na velké rozdíly** | vysoká | nižší (normalizováno $\delta_{ij}$) | velmi nízká |
| **Typ** | lineární (Classical MDS) | nelineární | nelineární |
| **Stress funkce** | $\sum (\delta_{ij} - d_{ij})^2$ | $\sum \frac{(\delta_{ij}-d_{ij})^2}{\delta_{ij}}$ | $\frac{\sum (f(\delta_{ij}) - d_{ij})^2}{\sum d_{ij}^2}$ |
| **Vhodné pro CBIR navigaci** | hrubé rozmístění | jemné lokální okolí | tam, kde máme jen pořadí |

---

## Kam to zapadá v rámci CBIR

Navigační přístup s projekčními metodami je **doplňkem** klasického dotazování:

1. **Query specifikace** — uživatel zadá dotaz (např. barevné procenta, skicu, příklad).
2. **Vyhledání kandidátů** — systém vrátí kandidátní obrazy podle podobnosti.
3. **Zobrazení v projekci** — kandidáti se zprojektí do 2D (MDS / Sammon / PCA), uživatel vidí **jejich vzájemné vztahy**.
4. **Navigace** — uživatel posouvá, přibližuje, vzdaluje a interaktivně zužuje výběr.
5. **Relevance feedback** — uživatel označí relevantní/nerelevantní obrazy, systém aktualizuje dotaz a opakuje.

Tím se kombinuje výhoda **vizualizace celé kolekce / podmnožiny** s tradičním seřazeným seznamem.

---

## Shrnutí (zkouškové)

**Navigační přístup** k CBIR znamená, že obrazy z kolekce nejsou prezentovány jako seřazený seznam, ale jako **body ve virtuálním (typicky 2D) prostoru**, kde **vzdálenosti odrážejí jejich (ne)podobnost** $S_{Q,D}$. Uživatel pak v tomto prostoru **naviguje** (scrollování, zoomování), takže při přiblížení vidí podobnější obrazy a při vzdálení různější. K vytvoření takového rozmístění slouží **projekční metody**, které $D$-rozměrné příznakové vektory promítají do $K = 1, 2, 3$ dimenzí.

Hlavní projekční metody jsou:

- **Lineární** — PCA, Classical (metric) MDS, který minimalizuje stress $E_M = \sum (\delta_{ij} - d_{ij})^2$ a zachovává absolutní vzdálenosti.
- **Sammonova projekce** (nelineární) — normalizuje chybu původní vzdáleností $\delta_{ij}$: $E_S = \sum \frac{(\delta_{ij} - d_{ij})^2}{\delta_{ij}}$, a tím **klade větší důraz na malé vzdálenosti** (zachovává lokální strukturu).
- **Nemetrické MDS** — zachovává **jen pořadí** vzdáleností pomocí monotónní funkce $f$; vhodné, když máme jen rank-order informaci.

Před projekcí se kolekce zpravidla **shlukuje** (hierarchicky nebo nehierarchicky — K-means, SOM, fuzzy) a teprve potom se shluky / celá kolekce 2D promítají.
