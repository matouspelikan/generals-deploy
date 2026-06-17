# 2. Ittiho model vizuální pozornosti

**Zdroj:** PV_10 (Vizuální pozornost), slidy o Ittiho modelu
**Referenční článek:** Laurent Itti, Christof Koch, Ernst Niebur, *A Model of Saliency-Based Visual Attention for Rapid Scene Analysis*, IEEE PAMI 1998.

---

## Kontext: Vizuální pozornost

Vizuální pozornost lze chápat ve dvou režimech:

| Přístup | Popis | Příklady |
|---------|-------|----------|
| **Bottom-up** | Podvědomá reakce na podněty (rysy obrazu) | Hořící svíčka v tmavé místnosti, červené jablko na zeleném stromě, oči a rty v obličeji — kontrast, barva, orientace, textura, pohyb |
| **Top-down** | Vědomé směrování pozornosti na objekty relevantní k zadanému úkolu | Hledání dopravních značek, počítání objektů ve scéně, hledání cíle ve hře |

- **Bottom-up** odpovídá tzv. **saliency map** (mapa význačnosti) — odpověď na *lokální změny* v obraze.
- **Top-down** odpovídá tzv. **task map** — odpověď podle zadaného úkolu (mění se s každým úkolem).

**Ittiho model** je **bottom-up** výpočetní model — modeluje, kam se pozornost zaměří podvědomě, na základě obrazových rysů.

---

## Hlavní myšlenka modelu

Ittiho model je biologicky inspirovaný výpočetní model saliency:

1. Obraz je rozdělen do **3 paralelních kanálů**: **barva**, **intenzita**, **orientace** — v nich se hledají **lokální změny**.
2. Lokální změny se počítají operací **center-surround** (rozdíl mezi středem a okolím receptivního pole).
3. Mapy z různých rysů a měřítek se normalizují a slučují do jedné **saliency map (SM)**.
4. Nad SM běží neuronová síť typu **winner-take-all (WTA)**, která vybírá nejvýznamnější bod (= místo, kam se pozornost přesune).
5. Po fixaci se aktivuje **„inhibition of return"** (žádný návrat) — význam dané oblasti postupně klesá, takže se pozornost může přesunout jinam.

---

## Biologická inspirace

### Ganglionové buňky a organizace center-surround

Ganglionové buňky v sítnici mají přibližně **kruhové receptivní pole** s organizací **center-surround**. Existují dva typy:

- **ON-center / OFF-surround** — světlo ve středu pole buňku **excituje**, světlo v okolním prstenci ji **inhibuje**.
- **OFF-center / ON-surround** — přesně opačně: světlo ve středu buňku inhibuje, světlo v okolí ji excituje.

Tento mechanismus je v modelu napodoben rozdílem mezi „jemnou" (center) a „hrubou" (surround) škálou Gaussovské pyramidy.

### M a P buňky

- **M buňky** (magno-large) — citlivé na velké objekty, dokážou sledovat rychlé změny podnětů, nesou informaci o hrubých rysech objektů a o pohybu.
- **P buňky** (parvo-small) — početnější, menší, s menšími receptivními poli; nesou hlavně informaci o **barvě a detailech**, kombinují informaci z čípků.

---

## Implementace — kanály a pyramidy

### Barevný kanál

Z RGB obrazu se odvodí čtyři barevně oponentní kanály:

$$
R = r - \frac{g + b}{2}, \quad
G = g - \frac{r + b}{2}, \quad
B = b - \frac{r + g}{2}, \quad
Y = \frac{r + g}{2} - \frac{|r - g|}{2} - b
$$

Z nich se sestaví **Gaussovské pyramidy** $R(\sigma), G(\sigma), B(\sigma), Y(\sigma)$.

### Intenzitní kanál

$$
I = \frac{r + g + b}{3}
$$

Z $I$ se sestaví Gaussovská pyramida $I(\sigma)$.

### Orientační kanál

Z $I$ se sestaví **Gaborovy pyramidy** $O(\sigma, \theta)$, kde:

- $\theta \in \{0^\circ, 45^\circ, 90^\circ, 135^\circ\}$
- $\sigma \in [0 \ldots 8]$

---

## Center-surround operace

Center-surround se počítá jako **rozdíl mezi vrstvami Gaussovských pyramid**:

- **Center**: měřítka $c \in \{2, 3, 4\}$
- **Surround**: měřítka $s = c + d$, kde $d \in \{3, 4\}$

Operace: jemnější škála se **interpoluje** na velikost hrubší škály a obrazy se odečtou bod po bodu.

### Vzniká celkem **42 map**

| Typ mapy | Počet |
|----------|------:|
| Intenzitní | 6 |
| Barevné | 12 |
| Orientační | 24 |
| **Celkem** | **42** |

(Počet vychází z kombinací $c$, $s$ a u orientace navíc $\theta$.)

---

## Normalizace map

Aby silné mapy nepřebíjely slabé jen díky odlišnému rozsahu hodnot, používá se operátor normalizace $\mathcal{N}(\cdot)$:

1. **Mapování hodnot** do intervalu $[0, M]$.
2. Výpočet **průměru lokálních maxim** $\bar{m}$ (všech lokálních maxim **kromě** globálního maxima $M$).
3. Násobení mapy faktorem $(M - \bar{m})^2$.

Tím se zvýrazní mapy s **jedním výrazným píkem** (velké $M - \bar{m}$) a potlačí mapy s **mnoha rovnocennými píky** (malé $M - \bar{m}$).

---

## Kombinace map a finální saliency map

Mapy se v rámci každého kanálu **změní na měřítko 4** a sečtou bod po bodu. Tím vzniknou tři **conspicuity maps**:

- Intenzitní mapa význačnosti
- Barevná mapa význačnosti
- Orientační mapa význačnosti

Tyto tři mapy se znovu normalizují a sloučí do jediné **finální saliency map (SM)**.

---

## Výběr ohnisek pozornosti — WTA + Inhibition of Return

Saliency map (SM) je vstupem do biologicky inspirované **2D neuronové sítě typu „winner-take-all" (WTA)**:

1. **WTA** najde **globální maximum** SM → toto místo je další **ohnisko pozornosti** (focus of attention).
2. Aktivuje se **„inhibition of return"** (v textu označováno také jako „no return"): význam vybrané oblasti se v SM **postupně sníží**, takže WTA při dalším kroku najde **jiný** maximální bod.
3. Tím se generuje **sekvence fixací** — model dokáže předpovědět, jak se bude pozornost postupně přesouvat po scéně.

---

## Schéma celé pipeline

```
Vstupní obraz
   │
   ├── Intenzitní kanál  I  → Gaussovská pyramida ──┐
   ├── Barevný kanál  R,G,B,Y → Gaussovské pyramidy ┤
   └── Orientační kanál  O(σ,θ) → Gaborovy pyramidy ─┘
                                  │
                  Center-Surround (rozdíl škál pyramid)
                                  │
                       6 intenz. + 12 barev. + 24 orient. = 42 map
                                  │
                          Normalizace  𝒩(·)
                                  │
                   Slučování v rámci kanálů (přeškálovat na 4, sečíst)
                                  │
              Intenz. + Barev. + Orient. conspicuity map
                                  │
                          Normalizace + sloučení
                                  │
                       Saliency Map  (SM)
                                  │
              Winner-Take-All (WTA) + Inhibition of Return
                                  │
                  Sekvence ohnisek pozornosti (fixací)
```

---

## Související pojmy ze slidů

- **Fixace** — období relativní stability oka (120–1000 ms, typicky 200–600 ms), kdy mozek získává informaci o scéně. Oko mírně driftuje (do 1°) a vrací se mikrosakádami.
- **Sakády** — rychlé skoky mezi fixacemi (40–120 ms, až 600°/s). Během sakády je vizuální systém **nefunkční**; směr a koncový bod jsou určeny **před** zahájením sakády.

Ittiho model lze chápat jako **výpočetní prediktor**, kam padne další fixace při volném prohlížení scény (bottom-up režim).

---

## Shrnutí (zkouškové)

Ittiho model je **bottom-up biologicky inspirovaný** výpočetní model vizuální pozornosti, který vytváří **saliency map** ze tří paralelních kanálů — **intenzita, barva, orientace**. V každém kanálu se ze **Gaussovských** (resp. **Gaborových**) pyramid spočítají **center-surround rozdíly** mezi škálami, čímž vznikne celkem **42 map**. Tyto mapy se **normalizují** (zvýrazní se mapy s jedním výrazným píkem pomocí faktoru $(M-\bar{m})^2$) a sloučí do tří **conspicuity maps** a následně do jedné **finální saliency map (SM)**. Nad SM běží **winner-take-all** neuronová síť, která vybírá ohnisko pozornosti, a mechanismus **inhibition of return** zajišťuje, že se pozornost postupně přesouvá z jedné význačné oblasti na další.
