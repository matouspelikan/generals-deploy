# Otázky za 10 bodů (0,5–1 strana) — odpovědi

**Zdroj:** slidy PV_1 – PV_12 z předmětu Computer Vision (Elena Šikudová)

---

## 1. Harrisov detektor rohov. Voči ktorým transformáciám je a nie je invariantný. Prečo?

**Harris detektor** hledá rohy jako body s **vysokou autokorelační odchylkou v každém směru**. Pro okno kolem bodu se sestaví matice druhých momentů gradientů $A = \sum_i w(\mathbf{p}_i) \begin{pmatrix} I_x^2 & I_x I_y \\ I_x I_y & I_y^2 \end{pmatrix}$ (po vyhlazení Gaussem). **Vlastní čísla** $\lambda_1, \lambda_2$ matice $A$ charakterizují bod: oba malé = plochá oblast, jedno velké = hrana, **oba velké a podobné** = roh. Detektor vyhodnocuje **odezvovou funkci** $R = \det A - \alpha (\mathrm{tr}\, A)^2 = \lambda_1\lambda_2 - \alpha(\lambda_1+\lambda_2)^2$ (typicky $\alpha = 0{,}04$–$0{,}06$), kde $R > 0$ značí roh. Body se získají prahováním $R$ a potlačením nemaxim.

**Invariance:** Harris **je invariantní** vůči **rotaci** (vlastní čísla nezávisí na orientaci) a vůči **posunu jasu** $I \to I + b$ (používáme derivace, posun se vynuluje). **Není invariantní** vůči **změně škály** — pro velký roh ve velkém zoomu se objeví spousta lokálních „hran" místo jediného rohu (proto se používá SIFT/SURF s vícescálovým prostorem). Vůči **změně kontrastu** $I \to aI$ je odezva škálována $a^2$, takže prahování přestane fungovat, pokud se kontrast hodně liší — tedy částečná invariance.

---

## 2. Houghova transformácia pre priamky ľubovoľného smeru

**Houghova transformace** detekuje analyticky známé objekty (zejm. **přímky**) v obraze hran. Pro přímky se používá **polární parametrizace**, která zvládá i svislé čáry: $\rho = x \cos\theta + y \sin\theta$, kde $\rho$ je vzdálenost přímky od počátku a $\theta \in [0, \pi)$ úhel její normály. V **parametrickém prostoru** $(\rho, \theta)$ je každá přímka **bodem** a každý hranový bod obrazu odpovídá **sinusoidě** (množina všech přímek procházejících daným bodem).

**Algoritmus:** (1) Detekuj hrany v obraze (např. Canny). (2) Akumulátor $A(\rho, \theta)$ se vynuluje. (3) Pro každý hranový pixel $(x, y)$ a každé $\theta$ v diskrétní mřížce spočítej $\rho = x\cos\theta + y\sin\theta$ a inkrementuj $A(\rho, \theta)$. (4) Najdi **lokální maxima** v akumulátoru — odpovídají přímkám. Houghova transformace je **robustní vůči zákrytům a šumu**, protože každý bod hlasuje samostatně. Dá se zobecnit i pro kružnice (3 parametry) a obecné křivky (Generalized Hough Transform).

---

## 3. Metóda SIFT (detektor a deskriptor)

**SIFT detektor** hledá body zájmu jako **lokální extrémy v DoG prostoru** (Difference of Gaussians, aproximace LoG): $D(x,y,\sigma) = G(k\sigma)*I - G(\sigma)*I$. Bod je extrémem v **26-okolí** (8 sousedů ve stejné škále + 9 + 9 v sousedních) — to zajistí **škálovou invariantnost**. Slabé body se odstraní: nízkokontrastní prahem na $|D|$, hranové pomocí Hessovy matice a testu $(r+1)^2/r$ kde $r = \lambda_1/\lambda_2$. Každému bodu se přiřadí **dominantní orientace** podle histogramu gradientů v okolí (rotační invariantnost).

**SIFT deskriptor** používá přístup **HOG**: okno **16 × 16** kolem bodu, otočené podle dominantní orientace, se rozdělí na **4 × 4 buňky** po 4 × 4 pixelech, v každé se sestaví **histogram s 8 koši** orientací gradientů. Příspěvky se vážou **Gaussovou váhou** se $\sigma = 1{,}5 \cdot \text{scale}$. Výsledný vektor: $4 \times 4 \times 8 = \mathbf{128}$ hodnot. Je škálově i rotačně invariantní a díky normalizaci HOG bloku robustní vůči osvětlení (Lowe, IJCV 2004).

---

## 4. Metóda SURF (detektor a deskriptor)

**SURF detektor** je rychlejší alternativa SIFT. Místo DoG aproximuje **Hessovu matici druhých derivací Gaussiánu** velmi jednoduchými **box filtry** ($\hat{L}_{xx}, \hat{L}_{yy}, \hat{L}_{xy}$), jejichž odezvu lze díky **integrálnímu obrazu** spočítat v **konstantním čase nezávisle na velikosti filtru**. Místo postupného rozmazávání obrazu se mění **velikost filtru** napříč oktávami — to dále zrychluje výpočet. Body zájmu jsou opět lokální extrémy determinantu aproximované Hessovy matice v 3D měřítkovém prostoru.

**SURF deskriptor** používá **Haarovy waveletové odezvy** v okně kolem bodu zájmu (otočeném do dominantní orientace). Okno se rozdělí na **4 × 4 = 16 buněk** a v každé se spočítají **4 hodnoty**: $\sum d_x, \sum d_y, \sum |d_x|, \sum |d_y|$ (Haar response ve vertikálním a horizontálním směru). Výsledný deskriptor má **$16 \times 4 = 64$ hodnot**, tedy poloviční velikost než SIFT, ale srovnatelnou rozlišovací schopnost a výrazně rychlejší výpočet (Bay et al., ECCV 2006).

---

## 5. Postup detekcie tvárí pomocou Gaussiánov. Boosting

Metoda Sunga & Poggia (1998) modeluje **prostor obličejů a ne-obličejů Gaussovskými směsmi**. Vstupní okno (např. 19 × 19 px) je vektor v 283-dim prostoru. Trénovací data se **shlukují do 6 + 6 shluků** (faces / non-faces), každý je modelován Gaussiánem. Pro každý nový vzorek $\mathbf{x}$ se počítají **vzdálenosti od všech 12 shluků**, a to ve dvou složkách: $D_1$ (Mahalanobisova vzdálenost v 75-dim PCA podprostoru) a $D_2$ (kolmá vzdálenost od podprostoru). Tím se z $\mathbf{x}$ získá **24-dim vektor příznaků** (12 × 2), který klasifikuje **neuronová síť**.

**Boosting** lze zařadit do trénovací smyčky pro **iterativní vylepšení** klasifikátoru: (1) trénuj na malé množině PE + NE, (2) klasifikuj náhodné obrazy bez obličejů, (3) **falešně pozitivní** přidej do NE jako „hard negatives", (4) přetrénuj. Tím se klasifikátor postupně učí těžší případy a přesnost výrazně roste. Obecně **AdaBoost** kombinuje slabé klasifikátory s váhami $\alpha_t$ a v každé iteraci **zvyšuje váhu** špatně klasifikovaných vzorků — výsledný silný klasifikátor je vážená lineární kombinace slabých.

---

## 6. Metódy sledovania pohybov oka a analýza získaných dát

**Metody eyetrackingu:** (1) **Elektronické** — elektrody na kůži kolem oka měří potenciálové změny (elektrookulografie); špatná přesnost, vhodné pro neurologickou diagnostiku. (2) **Mechanické** — speciální kontaktní čočky s cívkou v magnetickém poli; velmi přesné, ale nepohodlné. (3) **Single-point video** — software sleduje **jeden objekt** (zornici nebo duhovku), vyžaduje kalibraci. (4) **Two-point video** — sleduje **zornici + odraz na rohovce** (typicky první Purkyňův obraz) pomocí IR osvětlení; poloha odrazu vůči zornici určuje **směr pohledu**. Parametry: přesnost ~1°, prostorové rozlišení 0,03–0,2°, časové rozlišení 30–500 Hz.

**Analýza dat:** surová data jsou nepoužitelná, je třeba je rozdělit na **fixace** (perioda relativní stability, 120–1000 ms) a **sakády** (skoky 40–120 ms). Algoritmus **I-VT** počítá rychlost mezi body — pokud je pod prahem (typicky 20°/s), jde o fixaci, jinak sakádu; po sloučení dá těžiště fixace. Algoritmus **I-DT** udržuje okno délky $\sim$100–200 ms a kontroluje, zda **rozptyl** bodů zůstává pod prahem (0,5°–1° zorného úhlu); pokud ano, jde o fixaci.

---

## 7. Vizualizácia dát z eyetrackingu a metódy ich porovnávania

**Heatmapy** vizualizují **hustotu fixací** v obraze. Z bodů fixací se vytvoří 2D pravděpodobnostní hustota (např. konvolucí s Gaussiánem), která se vybarví barevnou škálou (modrá = málo, červená = hodně). Pro zvýraznění hlavních oblastí se aplikuje **prahování**. **Gaze trajectory** (trajektorie pohledu) zobrazuje fixace jako **kružnice** spojené úsečkami — poloměr kružnice odpovídá **délce fixace**, úsečky reprezentují **sakády** a pořadí. Tím je vidět nejen kde se pozorovatel díval, ale i v jakém pořadí.

**Porovnávání heatmap:** heatmapy se chápou jako **pravděpodobnostní hustoty** a porovnávají se **Kullback–Leiblerovou divergencí** $D_{KL}(P\|Q) = \sum P \log(P/Q)$, případně dalšími metrikami (korelace, EMD). Tím se dá kvantifikovat, jak moc se liší pohled dvou pozorovatelů (např. expert vs. začátečník) nebo stejného pozorovatele při různých úkolech.

---

## 8. Kvantovanie farebného obrazu. Typy paliet, ich vytváranie, chyba kvantovania

**Kvantování** mapuje plnou množinu barev $C$ na konečnou **paletu** $P = \{c_1, \ldots, c_n\}$, $n \ll |C|$, kvantizátorem $Q: C \to P$. Cílem je snížit objem dat (např. z 24-bit RGB na 8-bit index do palety = 3× méně) při vizuální podobnosti. Metody dělíme na **image-independent** (pevné palety: nejvýznamnější bity, dělení barevného prostoru např. 6×6×6 = 216 nebo 3-3-2 bity = 256 barev) a **image-dependent** (adaptivní palety: clustering, segmentace). Algoritmus adaptivní palety: (1) projdi obraz a zjisti barvy, (2) urči paletu, (3) namapuj barvy na reprezentanty, (4) vykresli kvantovaný obraz.

**Median cut** je klasický algoritmus adaptivní palety: najde AABB všech barev, rozdělí ho na nejdelší ose v **mediánu**, opakuje rekurzivně, dokud nedostane $K$ shluků; reprezentantem je průměr shluku. **Chyba kvantování** se měří jako MSE: $E = \frac{1}{N}\sum_{i=1}^N \|d(\mathbf{x}_i, Q(\mathbf{x}_i))\|^2$ (euklidovsky v RGB). **Optimální paleta** splňuje dvě podmínky: (1) **nearest neighbor** — pixel se mapuje na nejbližšího reprezentanta, (2) **centroid** — reprezentant je těžištěm svého regionu. Adaptivní palety se používají pro jednotlivé obrazy; **pevné** pro porovnávání množin obrazů (např. histogramy).

---

## 9. Moravcov a Harrisov detektor rohov

**Moravcův detektor** hledá body s **nízkou autopodobností**. Pro každý pixel testuje, jak moc se okno kolem něj **liší od posunutých oken** v 8 směrech: $E_{WSSD}(\mathbf{u}) = \sum_i w(\mathbf{p}_i)[I(\mathbf{p}_i + \mathbf{u}) - I(\mathbf{p}_i)]^2$. „Rohovitost" bodu = **minimum** z těchto 8 hodnot — pokud je vysoké, znamená to změnu v každém směru a tedy roh. **Slabiny:** anizotropní odezva (pouze 8 diskrétních směrů), citlivý na šum, není rotačně invariantní.

**Harris** je vylepšení: pomocí **Taylorova rozvoje 1. řádu** se $E_{WSSD}$ aproximuje jako kvadratická forma $\mathbf{u}^T A \mathbf{u}$, kde $A = \sum_i w(\mathbf{p}_i) \begin{pmatrix} I_x^2 & I_x I_y \\ I_x I_y & I_y^2 \end{pmatrix}$. **Vlastní čísla** $A$ charakterizují bod (oba velké → roh). Odezva: $R = \det A - \alpha(\mathrm{tr}\, A)^2$, prahování + potlačení nemaxim. Výhody oproti Moravcovi: **rotační invariance**, lepší robustnost vůči šumu, spojitá odezva ve všech směrech. Není ale **škálově invariantní**.

---

## 10. Hľadanie objektov pomocou prikladania šablón (template matching)

**Template matching** posouvá šablonu $g$ velikosti $P \times Q$ přes celý obraz $f$ velikosti $M \times N$ a pro každou pozici vyhodnocuje **míru podobnosti** — pozice s nejvyšší odezvou je detekce. Možné metriky: **korelace** $h(m,n) = \sum_{k,l} g(k,l) f(m+k, n+l)$ (rychlá, ale násobí intenzity, špatné výsledky); **korelace s nulovým průměrem** (eliminuje DC složku); **SSD** $\sum [g - f]^2$ (citlivá na změnu jasu); **normalizovaná korelace** — nejpomalejší, ale **invariantní vůči změně kontrastu i jasu** (standardní volba). Složitost je $O(MNPQ)$, ještě hůř pokud neznáme škálu šablony.

Pro nalezení objektů **v různých velikostech** se používá **Gaussovská pyramida**: hledání začíná na **nejhrubší úrovni** (kandidátní oblasti), poté se zpřesňuje jen v okolí kandidátů na jemnějších úrovních. Tím se výpočet výrazně urychlí. Template matching dobře funguje, pokud známe **přesný vzhled** objektu — je citlivý na rotaci, deformaci, zákryt; pro takové případy se používají raději lokální příznaky (SIFT/SURF).

---

## 11. Vizualizácia dát z eyetrackingu a hľadanie významných oblastí v obraze

**Vizualizace eyetrackingu** (viz otázka 7): **heatmapa** zobrazuje hustotu fixací jako 2D pravděpodobnostní hustotu (Gaussian blur kolem bodů fixací), porovnává se **Kullback–Leiblerovou divergencí**; **gaze trajectory** ukazuje sekvenci fixací jako kružnice (poloměr = délka fixace) spojené úsečkami (sakády).

**Hledání významných oblastí (saliency)** — **Ittiho model** je biologicky inspirovaný bottom-up model: vstupní obraz se rozloží do **3 paralelních kanálů** (intenzita, barva, orientace), v každém se spočítají **Gaussovské/Gaborovy pyramidy** a **center-surround rozdíly** mezi škálami (inspirace ON-/OFF-center ganglionovými buňkami). Vzniká **42 map** (6 intenzita + 12 barva + 24 orientace) s $c \in \{2,3,4\}$ a $s = c + d$, $d \in \{3,4\}$. Mapy se **normalizují** ($\mathcal{N}(\cdot)$: namapuj na $[0,M]$, $\bar{m}$ = průměr lokálních maxim, vynásob $(M-\bar{m})^2$), sloučí do 3 **conspicuity maps** a finální **saliency map (SM)**. Nad SM běží **winner-take-all** síť + **inhibition of return**, která generuje sekvenci ohnisek pozornosti.

---

## 12. Výpočet optického toku

**Optický tok** je zdánlivý pohyb oblastí stejné intenzity v obraze. Z předpokladu **konstantní intenzity bodu v čase** se derivací řetězcovým pravidlem získá **brightness constancy equation**: $f_x u + f_y v + f_t = 0$, kde $(u,v) = (dx/dt, dy/dt)$ je optický tok a $f_x, f_y, f_t$ jsou parciální derivace obrazu. To je **1 rovnice o 2 neznámých** — neumíme určit složku **kolmou na gradient** (tzv. **aperture problem**).

Řešení vyžaduje další předpoklady. **Lucas–Kanade** předpokládá, že pixely v 3 × 3 okně se pohybují společně → 9 rovnic, 2 neznámé, řešeno **metodou nejmenších čtverců** $\mathbf{d} = (\mathbf{A}^T\mathbf{A})^{-1}\mathbf{A}^T\mathbf{b}$, kde $\mathbf{A}^T\mathbf{A}$ je sumační matice gradientů (řešitelná, když má obě vlastní čísla velká — tedy v rozích). **Horn–Schunck** místo toho přidává globální **podmínku hladkosti** $e = e_s + \lambda e_c$, kde $e_s = \iint (u_x^2 + u_y^2 + v_x^2 + v_y^2)$ a $e_c = \iint (f_x u + f_y v + f_t)^2$. Pro **velké pohyby** se používá **pyramidální výpočet** (LK na hrubé škále → warp → upsample → LK na jemnější škále) a **iterativní vylepšení** $d_{i+1} = d_i + \hat{d}$.

---

## 13. K-means

**K-means** je nehierarchická shlukovací metoda, která rozdělí $N$ bodů do **$K$ shluků** tak, aby **minimalizovala vnitroshlukový rozptyl** (within sum of squares): $W = \sum_{k=1}^K \sum_{x_i \in C_k} \|x_i - m_k\|^2$, kde $m_k$ je těžiště $k$-tého shluku. **Algoritmus:** (1) náhodně rozmísti $K$ počátečních středů, (2) **přiřazení**: každý bod přiřaď k nejbližšímu středu $C(i) = \arg\min_k \|x_i - m_k\|^2$, (3) **update**: spočítej nové středy jako průměr přiřazených bodů $m_k = \frac{1}{N_k}\sum_{x_i \in C_k} x_i$, (4) opakuj 2–3 do konvergence (žádná změna nebo MSE < práh).

**Použití v CV:** segmentace obrazu (clustering pixelů v RGB/Lab + pozice), **kvantování barev** (palety pomocí K-means), **bag of visual words** (klastrování deskriptorů do slovníku vizuálních slov), **clustering pro CBIR**. **Omezení:** konverguje, ale **ne nutně ke globálnímu optimu**; citlivý na **inicializaci** a **outliery**; tvoří jen **konvexní shluky**; vyžaduje předem znát $K$ (volí se např. metodou inflection point — sleduje se WSS pro různá $K$ a hledá zlom).

---

## 14. Rozdiel medzi vzorkovaním a kvantovaním. Metódy kvantovania farieb. Kvalita

**Vzorkování (sampling)** převádí spojitou prostorovou doménu obrazu $I_C(\rho, \gamma)$ na diskrétní mřížku pixelů $I_S(r, c) = \frac{1}{\Delta^2}\int\int I_C(\rho,\gamma)\,d\rho\,d\gamma$ — integrace přes plochu pixelu. Vzorkování ovlivňuje **prostorové rozlišení**; nedostatečné vzorkování vede k **aliasing** (Moiré, schody). **Kvantování (quantization)** převádí spojitý rozsah hodnot (intenzity/barvy) na diskrétní konečnou množinu — tedy mapování hodnot, ne polohy. Obě operace se aplikují postupně: spojitý obraz → vzorkování → kvantování → digitální obraz.

**Metody kvantování barev:** **image-independent** (pevná paleta — dělení barevného prostoru např. 6×6×6 = 216, nebo 3-3-2 bity = 256 barev; rychlé, ale obecné) vs. **image-dependent** (adaptivní paleta — **median cut** rekurzivně dělí AABB barev v nejdelší ose v mediánu; **K-means clustering** v barevném prostoru). **Kvalita kvantování** se měří **MSE chybou** $E = \frac{1}{N}\sum_i \|d(\mathbf{x}_i, Q(\mathbf{x}_i))\|^2$ (euklidovsky v RGB nebo Lab), vizuálně **error mapou** (rozdíl pixel po pixelu). Optimální paleta splňuje **nearest neighbor podmínku** a **centroid podmínku**.

---

## 15. Gaussovská a Laplaceovská pyramída obrazov

**Gaussovská pyramida (GP)** je hierarchická reprezentace obrazu na **klesajících rozlišeních**. Každá vyšší úroveň se získá **Gaussovým vyhlazením + podvzorkováním** předchozí úrovně (typicky 2×): $G_{l}(i,j) = \sum_{m,n} w(m,n) G_{l-1}(2i+m, 2j+n)$. Tím dostaneme posloupnost $G_0$ (originál), $G_1, G_2, \ldots, G_n$ se stále hrubšími detaily. **Použití v CV:** template matching v různých škálách, multiscale detekce (SIFT/SURF), výpočet optického toku pro velké pohyby (LK pyramid), saliency (Itti model).

**Laplaceovská pyramida (LP)** ukládá **rozdíly mezi sousedními úrovněmi GP**: $L_i = G_i - \text{expand}(G_{i+1})$, $L_n = G_n$. Každá úroveň obsahuje **frekvence ztracené při vyhlazení** — tedy LP je v podstatě **pásmově propustný rozklad**. Rekonstrukce: $G_i = L_i + \text{expand}(G_{i+1})$. **Použití:** **kombinace obrazů** (image blending na hranicích bez viditelných švů), **komprese** (LP koeficienty mají nízkou entropii), **úprava detailů** (multi-resolution editing). Klasická reference: Burt & Adelson, 1983.

---

## 16. Mean-shift

**Mean-shift** je iterativní algoritmus pro nalezení **lokálních maxim hustoty** v prostoru bodů. Nepotřebuje předem znát počet shluků. **Algoritmus pro jeden bod:** (1) inicializuj okno $W$ se zvoleným poloměrem, (2) spočítej **těžiště** bodů uvnitř okna $\bar{x} = \frac{1}{|W|}\sum_{x \in W} x$, (3) přesuň okno do těžiště, (4) opakuj, dokud se okno nezastaví v lokálním maximu hustoty. Při každé iteraci se okno pohybuje **ve směru gradientu hustoty**.

**Mean-shift segmentace obrazu:** (1) z každého pixelu spusť mean-shift v prostoru (barva + pozice) a zaznamenej, do kterého lokálního maxima konvergoval, (2) **shluky pixelů** = ty, které konvergovaly do stejného maxima (s tolerancí). Pixely v jednom **bazinu atrakce** tvoří jeden segment. **Výhody:** žádné předem dané $K$, robustní vůči outlierům, zvládne nekonvexní shluky. **Nevýhody:** výpočetně náročné (lze paralelizovat), citlivé na velikost okna. Reference: Comaniciu & Meer, IEEE TPAMI 2002.

---

## 17. 4 základné morfologické operácie ⊕ ⊖ ∘ •

**Dilatace** $A \oplus E$: pro každý bod struktury $A$ se „nakreslí" strukturní element $E$ → množina se **zvětší**, vyplní díry a zálivy do velikosti $E$. Formálně $A \oplus E = \bigcup_{e \in E} A_e$ (Minkowského součet). **Eroze** $A \ominus E$: opačně, $A \ominus E = \bigcap_{e \in E} A_{-e}$ — množina se **zmenší**, odstraní struktury menší než $E$, může objekt rozdělit. Dilatace a eroze nejsou inverzní, ale jsou **duální** vzhledem ke komplementu: $(A \ominus E)^C = A^C \oplus \hat{E}$.

**Otevření** $A \circ E = (A \ominus E) \oplus E$ — eroze následovaná dilatací: **vyhladí obrysy**, **přeruší tenké propojky**, odstraní tenké výběžky a malé objekty, přitom zachová přibližně velikost zbylých objektů. **Uzavření** $A \bullet E = (A \oplus E) \ominus E$ — dilatace následovaná erozí: **vyhladí obrysy**, **propojí blízké oblasti**, **vyplní malé díry a tenké zálivy**. Opening a closing jsou **idempotentní** (opakování nemění výsledek) a duální vůči komplementu. Pro šedotónové obrazy se dilatace nahradí $\max$ a eroze $\min$.

---

## 18. Hĺbka ostrosti, circle of confusion, ohnisková vzdialenosť. Čo ovplyvňuje DoF?

**Ohnisková vzdálenost (focal length)** $f$ je vzdálenost mezi optickým středem čočky a obrazovým ohniskem — tj. bodem, kde se sbíhají rovnoběžné paprsky přicházející z nekonečna. Vztah mezi vzdáleností objektu $a$, vzdáleností obrazu $a'$ a $f$ je dán **rovnicí tenké čočky**: $\frac{1}{a} + \frac{1}{a'} = \frac{1}{f}$. **Circle of confusion (CoC)** je kroužek, který vznikne na obrazovém senzoru z bodu, který **není v rovině ostrosti** — místo bodového obrazu vznikne malá kružnice. Pokud je CoC menší než velikost pixelu (resp. rozlišovací limit oka/senzoru), bod se stále jeví ostrý.

**Hloubka ostrosti (Depth of Field, DoF)** je **rozsah vzdáleností**, ve kterém je CoC dostatečně malý, aby se objekty jevily ostře. DoF ovlivňují **tři parametry**: (1) **clona (aperture)** — čím **menší clona** (větší clonové číslo $f/D$), tím **větší DoF**; (2) **ohnisková vzdálenost** $f$ — čím **delší $f$** (teleobjektiv), tím **menší DoF**; (3) **vzdálenost objektu** — čím **dál** je objekt, tím **větší DoF**. Malá DoF se používá pro portréty (rozmazané pozadí), velká DoF pro krajinu.

---

## 19. Chyby šošoviek (aberrations)

**Chromatická aberace** — index lomu čočky závisí na **vlnové délce** ($n(\lambda)$), takže různé barvy se lámou jinak. **Axiální** chromatická aberace: různé vlnové délky se ostří v různých vzdálenostech (modrá blíž, červená dál). **Laterální**: vlnové délky se sice ostří v rovině obrazu, ale **ne ve stejném bodě** → barevné lemy na hranách. Korekce: achromatické dublety (kombinace čoček různých skel).

**Sférická aberace** — reálné čočky mají kulové (ne hyperbolické) povrchy, takže **paprsky z okraje čočky se neostří do stejného ohniska** jako paraxiální paprsky → rozmazání ve středu obrazu. Korekce: skupina čoček, asférické povrchy. **Radiální zkreslení (distortion)** — geometrické zkreslení obrazu: **pincushion** (poduškovité, okraje stažené) nebo **barrel** (soudkovité, okraje vyklopené). Korekce softwarem (kalibrace kamery). **Vignettingu** (ztmavení rohů) má tři příčiny: **přirozené** ($E = L \frac{\pi}{4}(d/f)^2 \cos^4\alpha$, klesá s úhlem dopadu), **optické** (paprsky blokované hranami čočkových elementů) a **mechanické** (chybná clona/sluneční clona).

---

## 20. Segmentácia pomocou prahovania. Otsuho prahovanie

**Prahování (thresholding)** je nejjednodušší segmentační metoda: mapuje vstupní obraz $f(i,j)$ na binární obraz $g(i,j)$ podle prahu $T$: $g = 1$ pokud $f \geq T$ (objekt), jinak 0 (pozadí). **Globální** prahování používá jeden $T$ na celý obraz (vhodné pro bimodální histogramy); **lokální** počítá $T_w$ samostatně v každém okně (např. když není histogram bimodální v celku); **adaptivní (dynamické)** používá $T(x,y)$ závislé na poloze (např. Niblack: $T = M + (k \cdot \text{std} + d)$, kde $M$ je lokální průměr a std rozptyl — pro binarizaci skenovaných dokumentů).

**Otsuho metoda** najde **optimální globální práh** automaticky tak, že **maximalizuje mezitřídní rozptyl** (= minimalizuje vnitrotřídní rozptyl). Pro každou hodnotu prahu $t$ se rozdělí pixely na třídu 0 (pozadí, hodnoty $< t$) s pravděpodobností $P_0(t)$ a průměrem $\mu_0(t)$, a třídu 1 (objekt) s $P_1(t), \mu_1(t)$. Mezitřídní rozptyl: $\sigma_b^2(t) = P_0(t) P_1(t) [\mu_0(t) - \mu_1(t)]^2$. Otsuho práh je $t^* = \arg\max_t \sigma_b^2(t)$. Výhoda: nemá žádné ladící parametry, předpokládá ale bimodální histogram.

---

## 21. Segmentácia založená na regiónoch — narastanie, delenie, kombinácia

**Region growing (narůstání)** začíná z malých homogenních **semínek** (jádra, oversegmentation) a postupně k nim přidává sousední pixely, pokud splňují **kritérium homogenity** (např. rozdíl jasů pod prahem). Metody se liší volbou semínek a kritériem sloučení (např. „pokud významná část společné hranice jsou slabé hrany"). Výsledek závisí na **pořadí sloučení**. Vhodné, když známe počáteční oblasti zájmu.

**Region splitting (dělení)** funguje opačně: začíná s celým obrazem jako jednou oblastí a **rekurzivně dělí** nehomogenní regiony (typicky na 4 podčtverce — **segmentační quadtree**), dokud každá oblast nesplňuje predikát homogenity $Q(R_k)$. **Split-and-merge** kombinuje oba přístupy: (1) inicializuj segmentaci a kritérium $Q$, (2) pokud region není homogenní, **rozděl** ho na 4 podregiony; pokud lze sourozenecké regiony **sloučit**, sluč je; (3) procházej i nesourozenecké sousední regiony a slučuj, pokud lze. Tento přístup spojuje **shora-dolů** (split) a **zdola-nahoru** (merge) a respektuje hierarchickou datovou strukturu.

---

## 22. RANSAC

**RANSAC (RANdom SAmple Consensus)** je iterativní metoda odhadu parametrů matematického modelu z **bodů zatížených outliery**. **Algoritmus:** (1) náhodně vyber **minimální podmnožinu** bodů (sample size $s$ — minimum nutné pro určení modelu, např. 2 pro přímku, 3 pro afinní transformaci, 4 pro homografii), (2) **spočítej parametry** modelu z této podmnožiny, (3) najdi **podporu (consensus set)** — všechny body ve specifikované **vzdálenosti** $t$ od modelu (inliery), (4) opakuj $N$ iterací, (5) **vítěz** je model s nejvíce podporovateli; volitelně přepočítej parametry z celé množiny inlierů.

**Volba parametrů:** **práh vzdálenosti** $t$ se volí tak, aby např. 95 % inlierů model podporovalo (pro Gaussovský šum $\mathcal{N}(0,\sigma^2)$: $t^2 = 3{,}84\sigma^2$). **Počet iterací** $N$ se odvodí tak, aby s pravděpodobností $p$ alespoň jeden vzorek **neobsahoval outlier**: $N = \log(1-p) / \log(1 - (1-e)^s)$, kde $e$ je podíl outlierů. Protože $e$ obvykle neznáme, určuje se **adaptivně**. **Použití:** odhad geometrických transformací (panorama stitching, identifikace objektu z lokálních příznaků), 3D rekonstrukce, AR.

---

## 23. HOG deskriptor (Histogram of Oriented Gradients)

**HOG** popisuje vzhled okolí bodu pomocí **distribuce orientací gradientů** v lokálních buňkách. **Algoritmus:** (1) **gradient** v každém pixelu (velikost a směr), (2) okolí se rozdělí na **buňky** (typicky 8 × 8 pixelů), v každé buňce se sestaví **histogram orientací** gradientů (typicky 9 košů pro 0°–180°), váhováno velikostí gradientu, (3) buňky se seskupí do **bloků** (např. 16 × 16) a histogram bloku se **normalizuje** (kompenzace lokálního kontrastu/osvětlení), (4) zřetězení normalizovaných bloků dá **finální HOG deskriptor** (pro obraz 128 × 64 px je výsledný vektor 3780 hodnot).

**Použití:** **detekce chodců** (Dalal & Triggs 2005), obecně detekce objektů s charakteristickými hranami. HOG je **robustní** vůči malým změnám pozice, osvětlení a barvy (vzhledem k normalizaci bloků). **Souvislost se SIFT:** SIFT deskriptor je v podstatě HOG aplikovaný lokálně kolem bodu zájmu (16 × 16 okno, 4 × 4 buňky, 8 košů = 128 hodnot), s tou výjimkou, že SIFT okno před výpočtem **otáčí podle dominantní orientace** bodu (rotační invariance).

---

## 24. Bag of Visual Words (BoVW)

**BoVW** je metoda reprezentace obrazu inspirovaná **bag-of-words** v textovém vyhledávání. **Algoritmus:** (1) v každém obrazu z databáze najdi **lokální příznaky** (SIFT/SURF detektor + deskriptor), (2) z velkého množství deskriptorů ze všech obrazů vytvoř **slovník vizuálních slov** **klastrováním** (typicky K-means) — středy shluků = **vizuální slova**, (3) **kvantuj** každý deskriptor — přiřaď ho nejbližšímu vizuálnímu slovu ze slovníku, (4) reprezentuj obraz **histogramem výskytů vizuálních slov** ve slovníku (frekvenční vektor délky $K$).

(5) Histogram je vstup do **klasifikátoru** (SVM, naivní Bayes, rozhodovací stromy, neuronové sítě), který předpoví třídu obrazu. **Použití:** klasifikace scén, kategorií objektů, CBIR. **Výhody:** kompaktní reprezentace s pevnou délkou nezávislou na počtu detekovaných bodů; **invariance** vůči pozici objektu (histogram nezachycuje prostorové uspořádání). **Nevýhoda:** ztráta prostorové informace — řeší se rozšířeními jako **Spatial Pyramid Matching**, které dělí obraz na regiony a počítá histogramy zvlášť. Reference: Sivic & Zisserman, ICCV 2003.

---

## 25. PCA na rozpoznávanie tvárí (Eigenfaces)

**Princip:** obraz obličeje 100 × 100 px je vektor v 10 000-dim prostoru, ale **smysluplných** obličejových vektorů je málo — leží v nízkodimenzionálním **podprostoru**. **PCA** najde tento podprostor: pro $N$ trénovacích obrazů $\mathbf{x}_1, \ldots, \mathbf{x}_N$ spočítá **kovarianční matici** $\Sigma = \frac{1}{N}\sum_i (\mathbf{x}_i - \bar{\mathbf{x}})(\mathbf{x}_i - \bar{\mathbf{x}})^T$ a najde její **vlastní vektory** $\mathbf{b}_1, \mathbf{b}_2, \ldots$ seřazené podle velikosti vlastních čísel. **Eigenfaces** jsou prvních $K$ vlastních vektorů — zachycují **největší variabilitu** dat (typicky $K \ll D$, např. 50 z 10 000).

**Rozpoznávání:** nový obličej $\mathbf{x}$ se projektuje do eigenface podprostoru: $\mathbf{w} = (w_1, \ldots, w_K)^T$, $w_j = \mathbf{b}_j^T(\mathbf{x} - \bar{\mathbf{x}})$. **Klasifikace** = **nearest neighbor** v $\mathbb{R}^K$ vůči vektorům trénovacích obličejů. Lze také **rekonstruovat** obličej: $\tilde{\mathbf{x}} = \bar{\mathbf{x}} + \sum_{j=1}^K \mathbf{b}_j w_j$ (čím víc komponent, tím lepší rekonstrukce). **Omezení:** citlivé na **zarovnání obličeje**, **osvětlení**, **pozadí** — proto se obličeje normalizují (oči na stejných pozicích, ekvalizace histogramu). Reference: Turk & Pentland, CVPR 1991.

---

## 26. Lucas-Kanade metóda na výpočet optického toku

Z **brightness constancy** plyne základní rovnice OF: $f_x u + f_y v + f_t = 0$ — 1 rovnice o 2 neznámých, aperture problem. **Lucas–Kanade** přidává předpoklad, že **sousední pixely se pohybují stejně**, a v okně 3 × 3 (= 9 pixelů) získá **9 rovnic o 2 neznámých**. To je přeurčená soustava $\mathbf{A}\mathbf{d} = \mathbf{b}$ s $\mathbf{A} \in \mathbb{R}^{9\times 2}$, řešená metodou **nejmenších čtverců**: $\mathbf{d} = (\mathbf{A}^T\mathbf{A})^{-1}\mathbf{A}^T\mathbf{b}$, kde $\mathbf{A}^T\mathbf{A} = \begin{pmatrix} \sum f_x^2 & \sum f_x f_y \\ \sum f_x f_y & \sum f_y^2 \end{pmatrix}$.

**Řešitelnost:** matice $\mathbf{A}^T\mathbf{A}$ musí být **invertibilní** — obě vlastní čísla $\lambda_1, \lambda_2 \gg 0$ a $\lambda_1 \sim \lambda_2$, tedy typicky **v rozích**. Na hranách $\lambda_1 \gg \lambda_2$ (aperture problem zůstává), v plochých oblastech jsou obě malá. **Možné chyby:** selhání předpokladů — (1) konstantní intenzita (změna osvětlení), (2) společný pohyb v okně (hranice objektů), (3) malý pohyb. Pro velké pohyby se používá **iterativní vylepšení** (warp + opakování) a **pyramidální výpočet** (LK od hrubé škály k jemné).
