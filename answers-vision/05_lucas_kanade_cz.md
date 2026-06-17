# 5. Lucas–Kanade metoda a její iterativní vylepšení pro výpočet optického toku

**Zdroj:** PV_11 (Motion — optický tok, sledování objektů)
**Reference:** Sonka, Hlavac, Boyle — *Image Processing, Analysis, and Machine Vision*, kapitola Motion analysis

---

## Kontext: Optický tok

**Dynamická scéna** je posloupnost snímků $f(x, y, t)$, kde $(x, y)$ jsou prostorové souřadnice a $t$ je časový index. Změny v obraze způsobuje **relativní pohyb** mezi kamerou a objekty.

- **Motion field** = 2D projekce skutečného 3D pohybu (každému bodu odpovídá vektor rychlosti).
- **Optický tok (optic flow)** = **zdánlivý pohyb** oblastí stejné intenzity v obraze; nemusí odpovídat skutečnému 3D pohybu.

### Předpoklady pro výpočet optického toku

1. **Intenzita** bodu zájmu se v čase **nemění**.
2. Bod se nepohne **příliš daleko** mezi dvěma snímky.
3. Body se pohybují **společně se svým lokálním okolím**.

---

## Základní rovnice optického toku (Brightness Constancy Constraint)

Z předpokladu konstantní intenzity bodu pohybujícího se v čase:

$$
f(x(t), y(t), t) = \text{const} \quad \Rightarrow \quad \frac{\mathrm{d}f(x(t), y(t), t)}{\mathrm{d}t} = 0
$$

Rozepsáním řetězového pravidla:

$$
\frac{\partial f}{\partial x}\frac{\mathrm{d}x}{\mathrm{d}t} + \frac{\partial f}{\partial y}\frac{\mathrm{d}y}{\mathrm{d}t} + \frac{\partial f}{\partial t} = 0
$$

Označme:

- **Gradient obrazu**: $\nabla f = (f_x, f_y)^T = (\partial f/\partial x, \partial f/\partial y)^T$
- **Optický tok**: $(u, v)^T = (\mathrm{d}x/\mathrm{d}t, \mathrm{d}y/\mathrm{d}t)^T$
- **Časová derivace**: $f_t = \partial f / \partial t$

Pak rovnice OF nabývá tvaru:

$$
\boxed{\; f_x u + f_y v + f_t = 0 \;}
$$

To je **1 rovnice o 2 neznámých** $\Rightarrow$ řešení leží na **přímce** ve $(u, v)$ rovině.

---

## Aperture problem

Z jediné rovnice umíme určit **pouze složku optického toku rovnoběžnou s gradientem** intenzity. Složku **kolmou na gradient** neumíme — to je **aperture problem**.

$$
\mathbf{v}_\nabla = -\frac{f_t}{\|(f_x, f_y)\|} \quad \text{(složka ve směru gradientu)}
$$

Skutečný pohyb se tak jeví jako pohyb pouze ve směru gradientu (např. pohyb pruhu pozorovaný štěrbinou).

---

## Lucas–Kanade metoda — řešení aperture problému

**Klíčová myšlenka:** předpokládáme, že **sousední pixely se pohybují stejně**. Pak v okolí každého bodu (typicky **3 × 3**, tedy 9 pixelů) sestavíme **9 rovnic** o **2 neznámých** $(u, v)$.

### Soustava rovnic

Pro 9 pixelů $P_1, \ldots, P_9$ v okně:

$$
\underbrace{
\begin{pmatrix}
f_x(P_1) & f_y(P_1) \\
f_x(P_2) & f_y(P_2) \\
\vdots & \vdots \\
f_x(P_9) & f_y(P_9)
\end{pmatrix}
}_{\mathbf{A} \;\in\; \mathbb{R}^{9\times 2}}
\underbrace{
\begin{pmatrix} u \\ v \end{pmatrix}
}_{\mathbf{d}}
=
\underbrace{
\begin{pmatrix}
-f_t(P_1) \\
-f_t(P_2) \\
\vdots \\
-f_t(P_9)
\end{pmatrix}
}_{\mathbf{b}}
$$

Tedy $\mathbf{A}\mathbf{d} = \mathbf{b}$, kde $\mathbf{A}$ má rozměr $9 \times 2$ a $\mathbf{d} = (u, v)^T$.

### Řešení metodou nejmenších čtverců

Soustava je **přeurčená** $\Rightarrow$ řešíme **least squares**:

$$
\min_{\mathbf{d}} \|\mathbf{A}\mathbf{d} - \mathbf{b}\|^2
$$

Řešení je dáno **normálními rovnicemi**:

$$
\mathbf{A}^T \mathbf{A} \, \mathbf{d} = \mathbf{A}^T \mathbf{b}
$$

V rozepsaném tvaru:

$$
\underbrace{
\begin{pmatrix}
\sum f_x f_x & \sum f_x f_y \\
\sum f_x f_y & \sum f_y f_y
\end{pmatrix}
}_{2 \times 2}
\begin{pmatrix} u \\ v \end{pmatrix}
= -
\begin{pmatrix}
\sum f_x f_t \\
\sum f_y f_t
\end{pmatrix}
$$

(Sumy probíhají přes 3 × 3 okno.)

### Finální vzorec pro Lucas–Kanade

$$
\boxed{\; \mathbf{d} = (\mathbf{A}^T \mathbf{A})^{-1} \mathbf{A}^T \mathbf{b} \;}
$$

---

## Podmínka řešitelnosti — vlastní čísla $\mathbf{A}^T \mathbf{A}$

Soustava je řešitelná, pokud je $\mathbf{A}^T \mathbf{A}$ **invertibilní**, tedy obě vlastní čísla $\lambda_1, \lambda_2$ jsou **dostatečně velká**:

| Případ | Vlastní čísla | Interpretace |
|--------|---------------|--------------|
| **Roh (corner)** | $\lambda_1 \sim \lambda_2$, $\lambda_1 \gg 0$ | Změna v každém směru → **dobré pro LK** |
| **Hrana (edge)** | $\lambda_1 \gg \lambda_2$ (resp. naopak) | Pouze jedna dominantní orientace → **aperture problem** |
| **Plochá oblast (flat)** | $\lambda_1, \lambda_2$ malé | Žádná změna → **neřešitelné** |

Proto se LK přirozeně používá pro **sparse** výpočet OF jen v bodech zájmu (typicky rozích), kde $\mathbf{A}^T \mathbf{A}$ je dobře podmíněná.

---

## Možné zdroje chyb

Lucas–Kanade může selhat, i když je $\mathbf{A}^T \mathbf{A}$ invertibilní:

1. **Předpoklad konstantní intenzity** — selže při změně osvětlení, stínech, lesku.
2. **Předpoklad společného pohybu pixelů v okně** — selže na hranicích pohybujících se objektů (různé pohyby v jednom okně).
3. **Předpoklad malého pohybu** — selže pro velké posuny mezi snímky (Taylorův rozvoj 1. řádu už neplatí).

První problém řeší např. **Horn–Schunck** (přidává hladkost pohybu) nebo **gradient-based constraints** (místo intenzity používá LoG/gradient — robustnější vůči osvětlení). Třetí problém řeší **iterativní vylepšení** a **pyramidální výpočet**.

---

## Iterativní vylepšení Lucas–Kanade

Předpoklad **malého pohybu** vychází z **Taylorova rozvoje 1. řádu**. Pro větší posuny je linearizace nepřesná a jedno spuštění LK dá podhodnocený posun $d$. Řešení: **iterujeme**.

### Algoritmus

1. **Spočítej OF** $\hat{d}$ Lucas–Kanade metodou.
2. **Warp** (deformuj) snímek $f(x, y, t)$ podle odhadu $\hat{d}$ — výsledek se přibližuje k $f(x, y, t+1)$.
3. **Opakuj**, dokud $f(x, y, t)$ (warpovaný) $\approx f(x, y, t+1)$.

### Inkrementální aktualizace odhadu

V každé iteraci $i$ se odhad přesune o nový přírůstek $\hat{d}$:

$$
d_0 = 0, \qquad d_{i+1} = d_i + \hat{d}
$$

Po konvergenci platí:

$$
f(x - d_N, t) \approx f(x, t + 1)
$$

### Schéma

```
Iterace 0:   f(x,t) ─────── d̂ ────────► částečný odhad d_1
Iterace 1:   warp(f(x,t), d_1) ── d̂ ──► d_2 = d_1 + d̂
Iterace 2:   warp(f(x,t), d_2) ── d̂ ──► d_3 = d_2 + d̂
   ...
Konvergence: warp(f(x,t), d_N) ≈ f(x, t+1)
```

### Praktické poznámky

- **Warping může zavádět chyby** (interpolace).
- Proto se používá **gradient nedeformovaného obrazu** (tedy $f_x, f_y$ se počítají na původním $f(x, t)$, nikoliv na warpovaném).
- **Vyhlazení obrazu** (Gaussián) před výpočtem **pomáhá** — gradienty jsou stabilnější.

---

## Pyramidální výpočet pro velké pohyby

I s iterativním vylepšením LK nezvládne **velké pohyby**, pokud je počáteční odhad příliš daleko od pravdy (uvízne v lokálním minimu). Řešení: **Gaussovská pyramida**.

### Princip

- V **hrubších škálách** pyramidy se velký pohyb stane malým (např. 10 px ve full res se stane 1,25 px ve škále $\sigma = 8$).
- Spustím **iterativní LK na nejhrubší škále** — najdu hrubý odhad.
- **Warpuju** snímek tím odhadem a **přejdu na jemnější škálu** (upsample).
- Tam spustím iterativní LK znovu — odhad **upřesním**.
- Opakuju až k plnému rozlišení.

### Schéma

```
image J (vyšší rozlišení) ◄── ... ◄── image I (nejhrubší škála)
       │                                       │
   Iterativní LK ◄── warp & upsample ◄── Iterativní LK
       │                                       │
       ▼                                       ▼
   jemný odhad                          hrubý odhad
```

Tím se z velkého pohybu stane sekvence **malých pohybů**, pro které LK předpoklad o malém posunu platí.

---

## Shrnutí (zkouškové)

**Lucas–Kanade metoda** počítá optický tok $(u, v)$ řešením rovnice **brightness constancy** $f_x u + f_y v + f_t = 0$, která je sama o sobě **podurčená** (1 rovnice, 2 neznámé — aperture problem). LK předpokládá, že **sousední pixely se pohybují stejně**, a v okně 3 × 3 sestaví **9 rovnic o 2 neznámých**. Tu řeší metodou nejmenších čtverců přes normální rovnice:

$$
\mathbf{d} = (\mathbf{A}^T \mathbf{A})^{-1} \mathbf{A}^T \mathbf{b}
$$

Soustava je dobře řešitelná, pokud má matice $\mathbf{A}^T \mathbf{A}$ obě **vlastní čísla velká** ($\lambda_1 \sim \lambda_2 \gg 0$) — typicky **v rozích**.

Protože LK předpokládá **malý pohyb** (Taylorův rozvoj 1. řádu), používá se **iterativní vylepšení**: v každé iteraci se spočítá přírůstek $\hat{d}$, snímek $f(x, t)$ se podle něj **warpuje**, aby se přiblížil $f(x, t+1)$, a proces se opakuje až do konvergence $f(x - d_N, t) \approx f(x, t+1)$. Aby se omezila chyba z warpingu, gradient se počítá vždy na **nedeformovaném** obraze a obraz se předtím **vyhladí**.

Pro **velké pohyby** se navíc používá **Gaussovská pyramida**: iterativní LK běží nejprve na hrubé škále (kde je pohyb malý), výsledek se **warpne a upsampluje**, a totéž se opakuje na jemnějších úrovních pyramidy až do plného rozlišení.
