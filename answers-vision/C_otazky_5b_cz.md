# Otázky za 5 bodů (2–3 věty, max 0,5 strany) — odpovědi

**Zdroj:** slidy PV_1 – PV_12 z předmětu Computer Vision (Elena Šikudová)

---

## 1. Gaussovská pyramída obrazov a jej využitie v PV

Gaussovská pyramida je hierarchická reprezentace obrazu na klesajících rozlišeních — každá vyšší úroveň vzniká **Gaussovým vyhlazením a podvzorkováním** (2×) předchozí: $G_l(i,j) = \sum_{m,n} w(m,n) G_{l-1}(2i+m, 2j+n)$. Slouží jako **low-pass kaskáda**, kde se postupně ztrácejí vysoké frekvence. V PV se používá pro **multiscale template matching**, **pyramidální výpočet optického toku** (Lucas–Kanade pro velké pohyby), **DoG prostor v SIFT detektoru** a **saliency** (Itti model).

## 2. Laplaceovská pyramída obrazov a jej využitie v PV

Laplaceovská pyramida ukládá **rozdíly mezi sousedními úrovněmi Gaussovské pyramidy**: $L_i = G_i - \text{expand}(G_{i+1})$, $L_n = G_n$ — tedy pásmově propustný rozklad obsahující frekvence ztracené při vyhlazení (Burt & Adelson, 1983). Rekonstrukce je $G_i = L_i + \text{expand}(G_{i+1})$. Využití: **kombinace obrazů** (image blending s neviditelnými přechody), **komprese** (nízká entropie koeficientů) a **multi-resolution editing detailů**.

## 3. Spektrálne reziduá (Spectral Residual) pre hľadanie významných oblastí

Hou & Zhang (2007) využívají faktu, že **log-amplitudové spektrum přirozených obrazů má statisticky podobný tvar** — odchylky od něj odpovídají význačným strukturám. **Algoritmus:** obraz se zmenší na 64×64, spočítá se Fourierova transformace $\mathcal{F}(I) = (M, P)$, log-amplituda $L = \log M$, **spektrální reziduum** $R = L - h * L$ (rozdíl od vyhlazeného log-spektra), a saliency mapa je $SM = g * |\mathcal{F}^{-1}(e^{R + iP})|^2$ (Gaussův blur, $\sigma = 8$). Implementace má ~5 řádků MATLABu.

## 4. Frequency-tuned metódy pre hľadanie významných oblastí

**Frequency-tuned method** (Achanta et al.) počítá saliency v Lab prostoru jako rozdíl mezi **průměrnou barvou obrazu** $I_\mu$ a **Gaussovsky vyhlazeným obrazem** $I_{hc}$: $S(x,y) = \|I_\mu - I_{hc}(x,y)\|$, kde $\omega_{hc}$ je horní mezní frekvence. **Multiscale frequency-tuned method** zobecňuje na více měřítek: pro každé $S \in \{h/8, h/4, h/2\}$ se počítá lokální kontrast $c^S(i,j) = \|v_1(i,j) - v_2^S(i,j)\|$ jako rozdíl průměrných barev malého $R_1$ (1×1) a velkého okolí $R_2^S$, a výsledná mapa je $SM(i,j) = \sum_S c^S(i,j)$.

## 5. Hľadanie hrán v zašumených obrazoch. LoG

V zašumených obrazech derivace zesilují šum, proto se obraz **nejprve vyhladí Gaussiánem** a teprve potom derivuje — díky asociativitě konvoluce $\nabla^2(I * G) = I * \nabla^2 G$. **LoG (Laplacian of Gaussian)** $\nabla^2 G = \frac{\partial^2 G}{\partial x^2} + \frac{\partial^2 G}{\partial y^2}$ je tedy jeden filtr, který v jednom kroku **vyhladí a spočítá druhou derivaci**; hrany se detekují jako **průchody nulou** (zero crossings) odezvy LoG.

## 6. Moravcov detektor rohov

Moravec hledá body s **nízkou autopodobností**: pro každý pixel posouvá okno v **8 směrech** o vektor $\mathbf{u}$ a počítá sumu kvadratických rozdílů $E_{WSSD}(\mathbf{u}) = \sum_i w(\mathbf{p}_i)[I(\mathbf{p}_i + \mathbf{u}) - I(\mathbf{p}_i)]^2$. **Rohovitost** bodu je **minimum** z těchto 8 hodnot — pokud je vysoké, znamená to změnu ve všech směrech, tedy roh. Slabiny: anizotropní odezva (jen 8 diskrétních směrů), citlivost na šum, není rotačně invariantní (proto Harris).

## 7. Detektor rohov SUSAN

SUSAN porovná **intenzitu každého pixelu v kruhové masce** s intenzitou jejího středu (**nucleus**) a vyznačí oblast, kde mají body **podobnou intenzitu** = **USAN (Univalue Segment Assimilating Nucleus)**. USAN je velká v ploché oblasti, **malá u hran a ještě menší v rozích**. **Rohy** se detekují jako **lokální minima USAN mapy** (SUSAN = Smallest USAN). Výhoda: nepoužívá derivace, takže je robustní vůči šumu.

## 8. Hľadanie škvŕn (blobů) pomocou LoG

Pro detekci **blobu o poloměru $r$** se hledá taková škála $\sigma$, kdy LoG odezva v centru blobu je **maximální** — to nastane, když LoG **prochází nulou na okraji blobu** (vztah $\sigma = r/\sqrt{2}$ pro 2D). **Algoritmus:** spočítej **normalizovaný LoG** $\sigma^2 \nabla^2 G$ pro řadu škál $\sigma$, a najdi **lokální extrémy v 3D scale-space** $(x, y, \sigma)$ — to jsou středy a charakteristické škály blobů. Aproximací LoG je **DoG** (rozdíl dvou Gaussiánů) — používá ho SIFT.

## 9. Detektor FAST a deskriptor BRIEF

**FAST** porovnává intenzitu středu s **16 pixely na Bresenhamově kružnici** o poloměru $r=3$. Bod je roh, pokud existuje souvislý oblouk (např. 12) pixelů, které jsou **všechny jasnější** nebo **všechny tmavší** než střed o určitý práh; je extrémně rychlý (Rosten & Drummond, ECCV 2006). **BRIEF** je jeden z prvních **binárních deskriptorů**: v okolí bodu zájmu porovnává **intenzity dvojic pixelů** v náhodně zvolených pozicích, výsledek je **bitový řetězec** o délce 128 nebo 256 bitů — porovnává se rychle pomocí **Hammingovy vzdálenosti**.

## 10. Bayerova mriežka

**Bayerova mřížka** je nejrozšířenější **barevné filtrové pole (CFA)** na obrazovém senzoru — pixely jsou pokryty filtry **R, G, B** v opakujícím se 2×2 vzoru typicky **RGGB** (dvakrát více zelených, protože oko je nejcitlivější na zelenou). Každý pixel zaznamená jen jednu složku, plné RGB se získá **demosaicingem** = **interpolací** chybějících složek z okolních pixelů.

## 11. CIE chromatický diagram

CIE chromatický diagram je 2D projekce barev pomocí normalizovaných souřadnic $x = X/(X+Y+Z), y = Y/(X+Y+Z)$, která **odděluje barevnost od jasu**. Z diagramu se dá určit: **dominantní vlnová délka** barvy (průsečík přímky z reference white přes danou barvu se spektrálním obvodem), **saturace** (poměr vzdáleností), **komplementární barvy** (na opačné straně přes white), **gamut** zobrazovacího zařízení (trojúhelník jeho primárních barev) a **spektrální vs. ne-spektrální barvy** (na obvodu vs. purple line).

## 12. Distance transform

**Distance transform (DT)** binárního obrazu přiřadí každému pixelu **vzdálenost k nejbližší hraně** objektu — výsledkem je šedotónová mapa (metriky: euklidovská, City Block / Manhattan, Chessboard). **Souvislost s morfologií:** DT lze interpretovat jako rekurzivní erozi, kde hodnota pixelu = iterace, ve které zmizel; ekvivalence se SE — čtverec ↔ chessboard, kříž ↔ city block, kruh ↔ euklidovská. **Použití:** efektivní implementace dilatace/eroze s velkým SE, skelet, segmentace (watershed), shape analysis.

## 13. White a Black Top-Hat transformácia

**White Top-Hat** $\text{WTH}(A) = A - (A \circ B)$ extrahuje **světlé objekty** menší než SE $B$ ležící na nekonstantním pozadí — opening odstraní malé světlé struktury, rozdíl je vrátí zpět. **Black Top-Hat** $\text{BTH}(A) = (A \bullet B) - A$ analogicky extrahuje **tmavé objekty** menší než $B$. Použití: **segmentace** světlých/tmavých detailů na proměnlivém pozadí, **vyrovnání nerovnoměrného osvětlení**, a **zvýšení kontrastu** kombinací $A + \text{WTH} - \text{BTH}$.

## 14. Hľadanie hrán binárnych a gradient šedotónových obrazov pomocou morfológie

V **binárních obrazech** se hrany získají rozdílem objektu a jeho eroze/dilatace: **vnitřní** $\text{Edge}_I(A) = A \setminus (A \ominus E)$, **vnější** $\text{Edge}_E(A) = (A \oplus E) \setminus A$, **standardní** $\text{Edge}_S(A) = (A \oplus E) \setminus (A \ominus E)$. V **šedotónových** obrazech je analogicky **morfologický gradient** $\text{Grad}_S(A) = (A \oplus E) - (A \ominus E)$ — rozdíl maxima a minima v okně danou SE; aproximuje magnitudu gradientu intenzity.

## 15. Kombinácia dvoch obrazov bez viditeľného prechodu

Naivní cross-fade vytvoří viditelný šev, pokud mají obrazy různé jasy nebo frekvence. **Řešením je multiresolution blending** přes **Laplaceovské pyramidy**: (1) spočítej LP obou obrazů $L_A, L_B$ a GP masky $G_M$ přechodu, (2) na **každé úrovni** kombinuj $L_{out}^i = G_M^i \cdot L_A^i + (1 - G_M^i) \cdot L_B^i$, (3) **zrekonstruuj** výsledný obraz z $L_{out}$. Tím se nízké frekvence míchají s **širokou maskou** (hladký přechod) a vysoké s úzkou (zachová detaily) — šev je neviditelný (Burt & Adelson).

## 16. Saliency map vs. Task map

**Saliency map** odpovídá **bottom-up** pozornosti — zachycuje **podvědomou odezvu** na lokální změny v obraze (kontrast, barva, orientace, pohyb) a nezávisí na úkolu. **Task map** odpovídá **top-down** pozornosti — zvýrazňuje objekty/oblasti **relevantní pro zadaný úkol** (např. při počítání tužek se zvýrazní tužky, při hledání značek se zvýrazní značky), takže se **mění s každým úkolem**. Stejné objekty jsou v jiných úkolech ignorovány (inattentional blindness).

## 17. Heatmap a jeho získanie z eyetracker dát

**Heatmap** je vizualizace **hustoty fixací** překrytá přes obraz, kde barva (typicky modrá → červená) odpovídá **kumulované délce nebo počtu fixací** v dané oblasti. Získání: ze syrového záznamu pohledu se algoritmem **I-VT / I-DT** identifikují **fixace** (těžiště, doba trvání), z nich se vytvoří 2D **pravděpodobnostní hustota** — typicky konvolucí každé fixace s **Gaussiánem** (šířka ~zrakový úhel 1°, výška ~ délka fixace), výsledek se znormalizuje a obarví. Heatmapy lze prahovat a porovnávat **Kullback–Leiblerovou divergencí**.

## 18. Výpočet optického toku pri veľkom pohybe

Lucas–Kanade selhává při velkém pohybu, protože využívá **Taylorův rozvoj 1. řádu**. Řešení: **Gaussovská pyramida** — v hrubších škálách se velký pohyb stane malým (např. 10 px se ve škále 1/8 stane 1,25 px). **Algoritmus:** (1) na **nejhrubší škále** spustí iterativní LK → hrubý odhad $d$, (2) **warpne** obraz tímto odhadem, **upsample** na jemnější škálu, (3) spustí LK znovu pro zpřesnění, (4) opakuje až do plného rozlišení. Tím se velký pohyb rozloží na sekvenci **malých kroků** v každé úrovni.

## 19. Rozdielový a kumulatívny rozdielový obraz

**Rozdílový obraz (Difference Image)** mezi dvěma snímky detekuje pohyb: $d(x,y) = 0$ pokud $|f(x,y,t) - f(x,y,t+1)| \leq \varepsilon$ (žádná změna), jinak 1. Hodnota 1 může znamenat pohybující se objekt vs. pozadí, **šum** nebo přechod mezi dvěma objekty. **Kumulativní rozdílový obraz (CDI)** je vážený součet rozdílů vůči **referenčnímu obrazu** $b(x,y)$ přes $N$ snímků: $d_{CDI}(x,y) = \sum_{k=1}^N a_k |b(x,y) - f(x,y,t_0+k)|$ — zvýrazní oblasti s opakovaným pohybem a potlačí náhodný šum.

## 20. Pozadie scény pre určenie pohybu

**Statický model** předpokládá, že referenční obraz $b(x,y)$ je **prázdná scéna bez objektů** (např. první snímek $f(x,y,t_0)$). **Dynamický model** se přizpůsobuje změnám: $b(x,y,t) = \varphi(\{f(x,y,t-n)\}_{n=1}^K)$, kde $\varphi$ je **průměr**, **medián** nebo **rekurzivní průměr** $M_t = \alpha I_{t-1} + (1-\alpha) M_{t-1}$. Pokročilejší přístup je **Gaussian Mixture Model (GMM, Adaptive Background Mixture Model)**, který modeluje každý pixel **směsí Gaussiánů** — zvládá pomalé objekty, **změny osvětlení** i opakující se pohyb pozadí (vlnící se listy).
