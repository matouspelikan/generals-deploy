# 6. Kalmanův filtr

**Zdroj:** PV_11 (Motion — sledování objektů, Kalmanův filtr)
**Reference:** Sonka, Hlavac, Boyle — *Image Processing, Analysis, and Machine Vision*, kapitola Motion analysis

---

## Kontext: Sledování objektů

Sledování (object tracking) má **tři fáze**:

1. **Detekce** — najít objekt(y) zájmu v obraze.
2. **Asociace** — určit, které části patří stejnému objektu (mezi snímky).
3. **Predikce** — predikovat budoucí pohyb na základě pozorovaného a tuto predikci využít ke zlepšení detekce a asociace v dalších snímcích.

### Predikce pohybu

Pohyb se dá predikovat dvěma způsoby:

- **Naučením modelu pohybu** (motion model).
- **Na základě pozorování** — pozorování ale **bývají zkreslená šumem**.

**Kalmanův filtr** kombinuje obojí: má vnitřní lineární model dynamiky a zároveň ho **koriguje měřeními** (zatíženými šumem).

---

## Hlavní myšlenka Kalmanova filtru

Kalmanův filtr je **rekurzivní (sekvenční) odhadovač stavu** pro **lineární systém** s **Gaussovským šumem**:

- Pracuje s **lineárním modelem** (např. $y = ax + b$ v 1D).
- Provádí **sekvenční update** parametrů — v každém kroku zpřesňuje odhad.
- V každém kroku:
  1. **Predikuje** budoucí stav z dynamického modelu.
  2. **Koriguje** predikci skutečným měřením.

Výsledkem je nejlepší odhad stavu v MMSE smyslu (minimum mean square error).

---

## Model: stav a měření

Označení:

| Symbol | Význam |
|--------|--------|
| $\mathbf{x}_k$ | **Stav** objektu v čase $k$ (např. pozice, rychlost, zrychlení) |
| $\mathbf{z}_k$ | **Měření** v čase $k$ |
| $\mathbf{u}_k$ | **Známý vstup** do systému (řízení; nemusí být) |
| $\mathbf{w}_k$ | **Procesní šum**, $\mathbf{w}_k \sim \mathcal{N}(0, \mathbf{Q}_k)$ |
| $\mathbf{v}_k$ | **Šum měření**, $\mathbf{v}_k \sim \mathcal{N}(0, \mathbf{R}_k)$ |

### Stavová rovnice (dynamika systému)

$$
\boxed{\;\mathbf{x}_k = \mathbf{A}_k\, \mathbf{x}_{k-1} + \mathbf{B}_k\, \mathbf{u}_k + \mathbf{w}_k\;}
$$

### Rovnice měření

$$
\boxed{\;\mathbf{z}_k = \mathbf{H}_k\, \mathbf{x}_k + \mathbf{v}_k\;}
$$

### Známé matice

| Matice | Význam |
|--------|--------|
| $\mathbf{A}_k$ | **Tranziční (přechodová) matice** — popisuje vývoj stavu mezi kroky |
| $\mathbf{H}_k$ | **Matice měření** — mapuje stav na měření |
| $\mathbf{B}_k$ | **Matice řízení (control input matrix)** |
| $\mathbf{Q}_k$ | Kovariance procesního šumu |
| $\mathbf{R}_k$ | Kovariance šumu měření |

Pokud nezávisí na čase, index $k$ se vypouští.

---

## Algoritmus Kalmanova filtru

V každém kroku se vykonávají **dvě fáze**: **predikce** a **korekce**.

### Inicializace

- Počáteční odhad stavu $\hat{\mathbf{x}}_{k-1}$ a kovariance $\mathbf{P}_{k-1}$.

### Fáze predikce (Time update / „a priori")

**(P1)** Predikce stavu:

$$
\hat{\mathbf{x}}_k^- = \mathbf{A}\, \hat{\mathbf{x}}_{k-1} + \mathbf{B}\, \mathbf{u}_k
$$

**(P2)** Predikce kovariance chyby stavu:

$$
\mathbf{P}_k^- = \mathbf{A}\, \mathbf{P}_{k-1}\, \mathbf{A}^T + \mathbf{Q}
$$

Symbol „$^-$" označuje **a priori** odhad — jen z modelu, bez měření.

### Fáze korekce (Measurement update / „a posteriori")

**(C1)** Výpočet **Kalmanova zesílení (Kalman gain)**:

$$
\boxed{\;\mathbf{K} = \mathbf{P}_k^-\, \mathbf{H}^T \bigl(\mathbf{H}\, \mathbf{P}_k^-\, \mathbf{H}^T + \mathbf{R}\bigr)^{-1}\;}
$$

**(C2)** Korekce predikce podle měření $\mathbf{z}_k$:

$$
\hat{\mathbf{x}}_k = \hat{\mathbf{x}}_k^- + \mathbf{K}\bigl(\mathbf{z}_k - \mathbf{H}\, \hat{\mathbf{x}}_k^-\bigr)
$$

Výraz $\mathbf{z}_k - \mathbf{H}\, \hat{\mathbf{x}}_k^-$ se nazývá **inovace (innovation, residual)** — rozdíl mezi skutečným měřením a tím, co predikuje model.

**(C3)** Korekce kovariance chyby:

$$
\mathbf{P}_k = (\mathbf{I} - \mathbf{K}\, \mathbf{H})\, \mathbf{P}_k^-
$$

### Kalmanovo zesílení — interpretace

$\mathbf{K}$ určuje, **jakou váhu** přiřadit predikci a jakou měření:

- Pokud je **šum měření $\mathbf{R}$ malý** (přesný senzor) → $\mathbf{K}$ velké → věříme **měření**.
- Pokud je $\mathbf{R}$ velké (zašuměné měření) → $\mathbf{K}$ malé → věříme **predikci** modelu.
- Adaptivně se mění s každým krokem podle $\mathbf{P}_k^-$.

---

## Souhrnný diagram

```
                Inicializace x̂_{k-1}, P_{k-1}
                          │
                          ▼
   ┌──────────────── PREDIKCE ────────────────┐
   │  (P1)  x̂_k⁻ = A x̂_{k-1} + B u_k          │
   │  (P2)  P_k⁻ = A P_{k-1} Aᵀ + Q            │
   └───────────────────┬───────────────────────┘
                       │
                       ▼  ◄── měření z_k
   ┌──────────────── KOREKCE ─────────────────┐
   │  (C1)  K = P_k⁻ Hᵀ (H P_k⁻ Hᵀ + R)⁻¹      │
   │  (C2)  x̂_k = x̂_k⁻ + K (z_k − H x̂_k⁻)     │
   │  (C3)  P_k = (I − K H) P_k⁻               │
   └───────────────────┬───────────────────────┘
                       │
                       └──► další krok k+1
```

---

## Odvození Kalmanova zesílení (skica)

Po dosazení korekce do vzorce kovariance se získá:

$$
\mathbf{P}_k = \mathbf{P}_k^- - \mathbf{K}\, \mathbf{H}\, \mathbf{P}_k^- - \mathbf{P}_k^-\, \mathbf{H}^T \mathbf{K}^T + \mathbf{K}\bigl(\mathbf{H}\, \mathbf{P}_k^-\, \mathbf{H}^T + \mathbf{R}\bigr)\mathbf{K}^T
$$

$\mathbf{K}$ se volí tak, aby **minimalizovala stopu** matice $\mathbf{P}_k$ (= součet kvadrátů chyb):

$$
\frac{\partial \operatorname{tr}(\mathbf{P}_k)}{\partial \mathbf{K}} = 0 \quad \Rightarrow \quad \mathbf{K} = \mathbf{P}_k^-\, \mathbf{H}^T \bigl(\mathbf{H}\, \mathbf{P}_k^-\, \mathbf{H}^T + \mathbf{R}\bigr)^{-1}
$$

Dosazením této $\mathbf{K}$ zpět se zjednoduší na $\mathbf{P}_k = (\mathbf{I} - \mathbf{K}\mathbf{H})\, \mathbf{P}_k^-$.

---

## Příklad: 1D vlak

> Vlak na nekonečně dlouhé koleji bez tření, začíná v poloze 0. Každých $\Delta t$ vteřin můžeme změřit jeho pozici. Zrychlení se mezi měřeními **náhodně mění**. Chceme znát **pozici a rychlost**.

### Stavový vektor

$$
\mathbf{x}_k = \begin{pmatrix} x \\ \dot{x} \end{pmatrix}
\quad \text{(pozice, rychlost)}
$$

Zrychlení: $a_k \sim \mathcal{N}(0, \sigma_a^2)$.

### Stavová rovnice (motion model)

$$
\begin{aligned}
x_k &= x_{k-1} + \Delta t\, \dot{x}_{k-1} + \frac{\Delta t^2}{2}\, a_k \\
\dot{x}_k &= \dot{x}_{k-1} + \Delta t\, a_k
\end{aligned}
$$

Maticově $\mathbf{x}_k = \mathbf{A}\, \mathbf{x}_{k-1} + \mathbf{G}\, a_k$, kde:

$$
\mathbf{A} = \begin{pmatrix} 1 & \Delta t \\ 0 & 1 \end{pmatrix}, \quad
\mathbf{G} = \begin{pmatrix} \Delta t^2 / 2 \\ \Delta t \end{pmatrix}
$$

V Kalmanově notaci: $\mathbf{w}_k = \mathbf{G}\, a_k \sim \mathcal{N}(0, \mathbf{Q})$, kde:

$$
\mathbf{Q} = \mathbf{G}\, \mathbf{G}^T\, \sigma_a^2 =
\begin{pmatrix} \Delta t^4 / 4 & \Delta t^3 / 2 \\ \Delta t^3 / 2 & \Delta t^2 \end{pmatrix} \sigma_a^2
$$

### Měření

Měříme jen **pozici** (rychlost ne):

$$
\mathbf{z}_k = \mathbf{H}\, \mathbf{x}_k + v_k, \quad
\mathbf{H} = \begin{pmatrix} 1 & 0 \end{pmatrix}, \quad
v_k \sim \mathcal{N}(0, \sigma_z^2)
$$

### Inicializace

Pokud známe počáteční odhad:

$$
\hat{\mathbf{x}}_0 = \begin{pmatrix} \hat{x}_0 \\ \hat{\dot{x}}_0 \end{pmatrix}, \quad
\mathbf{P}_0 = \begin{pmatrix} L & 0 \\ 0 & L \end{pmatrix}
$$

Jinak (pokud nevíme nic):

$$
\hat{\mathbf{x}}_0 = \begin{pmatrix} 0 \\ 0 \end{pmatrix}, \quad
\mathbf{P}_0 = \begin{pmatrix} \infty & 0 \\ 0 & \infty \end{pmatrix}
$$

(Velká nejistota → první měření má v korekci velkou váhu.)

### Výsledek

Filtr postupně sleduje **skutečný stav** (pozici i rychlost), přičemž:

- **Predikovaný stav** je hladký, ale zaostává.
- **Korigovaný stav** (po měření) leží mezi predikcí a zašuměným měřením, blíž k pravdě než obě složky samostatně.

---

## Extended Kalman Filter (EKF) — nelineární rozšíření

Klasický Kalman vyžaduje **lineární** dynamiku i měření. Pro nelineární systémy se používá **Extended Kalman Filter**:

$$
\mathbf{x}_k = f(\mathbf{x}_{k-1}, \mathbf{u}_k) + \mathbf{w}_k, \qquad
\mathbf{z}_k = h(\mathbf{x}_k) + \mathbf{v}_k
$$

Nelineární funkce $f$ a $h$ se v okolí aktuálního odhadu **linearizují** pomocí **Jacobiánů**:

$$
\mathbf{A}_k = \left.\frac{\partial f}{\partial \mathbf{x}}\right|_{\hat{\mathbf{x}}_{k-1}, \mathbf{u}_k}, \qquad
\mathbf{H}_k = \left.\frac{\partial h}{\partial \mathbf{x}}\right|_{\hat{\mathbf{x}}_k^-}
$$

### EKF algoritmus (změny oproti standardnímu KF)

| Fáze | Vzorec |
|------|--------|
| Predikce stavu | $\hat{\mathbf{x}}_k^- = f(\hat{\mathbf{x}}_{k-1}, \mathbf{u}_k)$ |
| Predikce kovariance | $\mathbf{P}_k^- = \mathbf{A}_k\, \mathbf{P}_{k-1}\, \mathbf{A}_k^T + \mathbf{Q}$ |
| Kalman gain | $\mathbf{K} = \mathbf{P}_k^-\, \mathbf{H}_k^T (\mathbf{H}_k\, \mathbf{P}_k^-\, \mathbf{H}_k^T + \mathbf{R})^{-1}$ |
| Korekce stavu | $\hat{\mathbf{x}}_k = \hat{\mathbf{x}}_k^- + \mathbf{K}\bigl(\mathbf{z}_k - h(\hat{\mathbf{x}}_k^-)\bigr)$ |
| Korekce kovariance | $\mathbf{P}_k = (\mathbf{I} - \mathbf{K}\, \mathbf{H}_k)\, \mathbf{P}_k^-$ |

---

## Shrnutí (zkouškové)

**Kalmanův filtr** je **rekurzivní odhadovač stavu** lineárního dynamického systému s Gaussovským procesním šumem $\mathbf{w}_k \sim \mathcal{N}(0, \mathbf{Q})$ a šumem měření $\mathbf{v}_k \sim \mathcal{N}(0, \mathbf{R})$. Model je dán dvěma rovnicemi:

$$
\mathbf{x}_k = \mathbf{A}\, \mathbf{x}_{k-1} + \mathbf{B}\, \mathbf{u}_k + \mathbf{w}_k, \qquad
\mathbf{z}_k = \mathbf{H}\, \mathbf{x}_k + \mathbf{v}_k
$$

V každém kroku filtr provádí dvě fáze:

1. **Predikce** — z dynamického modelu spočítá a priori odhad stavu $\hat{\mathbf{x}}_k^- = \mathbf{A}\hat{\mathbf{x}}_{k-1} + \mathbf{B}\mathbf{u}_k$ a kovariance $\mathbf{P}_k^- = \mathbf{A}\mathbf{P}_{k-1}\mathbf{A}^T + \mathbf{Q}$.
2. **Korekce** — pomocí **Kalmanova zesílení** $\mathbf{K} = \mathbf{P}_k^- \mathbf{H}^T (\mathbf{H}\mathbf{P}_k^- \mathbf{H}^T + \mathbf{R})^{-1}$ se predikce zkoriguje měřením $\mathbf{z}_k$: $\hat{\mathbf{x}}_k = \hat{\mathbf{x}}_k^- + \mathbf{K}(\mathbf{z}_k - \mathbf{H}\hat{\mathbf{x}}_k^-)$ a $\mathbf{P}_k = (\mathbf{I} - \mathbf{K}\mathbf{H})\mathbf{P}_k^-$.

$\mathbf{K}$ je odvozeno tak, aby **minimalizovalo stopu** kovariance chyby $\mathbf{P}_k$, a určuje váhu mezi predikcí a měřením — přesnější měření (malé $\mathbf{R}$) → větší vliv $\mathbf{z}_k$, větší šum měření → větší vliv modelu.

Filtr se v computer vision používá hlavně pro **sledování objektů** (predikce trajektorie ve sledování) a kombinaci zašuměných měření s dynamickým modelem (např. typický 1D příklad — pozice a rychlost s náhodným zrychlením $a_k \sim \mathcal{N}(0, \sigma_a^2)$). Pro nelineární systémy existuje **Extended Kalman Filter**, který nelineární funkce $f, h$ v každém kroku **linearizuje** Jacobiány v okolí aktuálního odhadu.
