# 1. Metoda Viola–Jones pro detekci obličejů

**Zdroj:** PV_9 (Detekce obličejů), slidy o metodě Viola/Jones
**Referenční článek:** P. Viola a M. Jones, *Rapid object detection using a boosted cascade of simple features*, CVPR 2001.

---

## Přehled

Metoda Viola–Jones je **appearance-based** (založená na vzhledu) metoda detekce obličejů, která jako první dosáhla **detekce obličejů v reálném čase**. Charakterizují ji:

- **Rychlá detekce** (real-time)
- **Pomalé trénování**
- Pracuje na šedotónových obrázcích a prochází jimi **čtvercovým oknem pevné velikosti** v různých měřítkách

Detekce je formulována jako klasifikační úloha do dvou tříd: *obličej* vs. *ne-obličej*.

---

## Tři základní myšlenky

Celá metoda stojí na třech klíčových myšlenkách, z nichž každá řeší jiné úzké hrdlo klasické detekce:

| # | Myšlenka | Účel |
|---|----------|------|
| 1 | **Integrální obrazy** | Rychlé vyhodnocení příznaků |
| 2 | **Boosting (AdaBoost)** | Výběr příznaků / konstrukce klasifikátoru |
| 3 | **Kaskády** | Rychlé zamítnutí ne-obličejových vzorků |

---

## Fáze algoritmu

1. **Trénování**
   - Algoritmus se trénuje na detekci obličeje uvnitř čtvercového okna pevné velikosti.
   - Počítají se jednoduché obdélníkové (Haar-like) příznaky.
   - Nejinformativnější příznaky jsou vybrány algoritmem **AdaBoost**.

2. **Klasifikace**
   - Obraz je procházen oknem v **různých měřítkách**.
   - Mění se měřítko **detektoru, nikoliv obrazu** (klíčový trik pro rychlost).
   - Obličej může být detekován na několika překrývajících se pozicích → následuje **postprocessing**, který je sloučí.

---

## 1) Integrální obrazy — rychlé vyhodnocení příznaků

Integrální obraz $I_O$ ukládá v každém pixelu $(x, y)$ součet intenzit všech pixelů nahoře a vlevo:

$$
I_O(x, y) = \sum_{i=1}^{x} \sum_{j=1}^{y} I(i, j)
$$

Jakmile je integrální obraz spočítán (jeden průchod obrazem), **součet intenzit uvnitř libovolného obdélníku ABCD** zarovnaného s osami lze vyhodnotit v **konstantním čase** pomocí pouhých čtyř lookupů:

$$
\text{součet}(ABCD) = I_O(A) - I_O(B) - I_O(D) + I_O(C)
$$

Díky tomu je vyhodnocení libovolného obdélníkového příznaku extrémně rychlé, **nezávisle na velikosti obdélníku**.

---

## 2) Obdélníkové příznaky a slabé klasifikátory

Příznaky Viola–Jones jsou jednoduché **Haar-like obdélníkové příznaky**. Hodnota příznaku je:

$$
f(x) = \sum (\text{intenzity v bílé oblasti } R_2) \; - \; \sum (\text{intenzity v černé oblasti } R_1)
$$

Díky integrálním obrazům vyžaduje vyhodnocení libovolného takového příznaku jen konstantní počet lookupů (např. třírobdélníkový příznak se zredukuje na:
$I_O(A) - 2 \cdot I_O(B) + I_O(C) - I_O(D) + 2 \cdot I_O(E) - I_O(F)$).

Každý příznak je interpretován jako **slabý klasifikátor obličejů**:

$$
h_j(x) =
\begin{cases}
1, & p_j f_j(x) < p_j \theta_j \\
-1, & \text{jinak}
\end{cases}
$$

kde $\theta_j$ je práh a $p_j$ je **parita**, která obrací znaménko. Každý příznak má svůj vlastní práh a paritu.

Jediný příznak je *jen mírně lepší než náhoda* — proto se nazývá **slabý** klasifikátor.

---

## 3) Boosting (AdaBoost) — výběr příznaků/klasifikátoru

**Boosting** kombinuje mnoho slabých klasifikátorů do jediného **silného klasifikátoru**.

- Slabý klasifikátor: $h_j(x) \in \{-1, 1\}$, přesnost mírně nad 50 %.
- Silný klasifikátor je váženou lineární kombinací:

$$
H(x) =
\begin{cases}
1, & \sum_{t=1}^{T} \alpha_t h_t(x) \geq \tfrac{1}{2} \sum_{t=1}^{T} \alpha_t \\
-1, & \text{jinak}
\end{cases}
$$

**AdaBoost** iterativně:
1. Začne s počátečním rozdělením vah trénovacích vzorků.
2. Natrénuje slabý model na aktuálním rozdělení.
3. Spočte chybu modelu.
4. Spočte koeficient $\alpha_t$ tohoto modelu (lepší modely dostanou větší váhu).
5. **Aktualizuje rozdělení** — zvýší váhu špatně klasifikovaných vzorků.
6. Opakuje; finální silný klasifikátor je vážený průměr slabých klasifikátorů.

Ve Viola–Jones má AdaBoost **dvojí roli**: nejen kombinuje slabé klasifikátory, ale také **vybírá**, které obdélníkové příznaky (z obrovského množství) jsou nejdiskriminativnější.

---

## 4) Kaskády — rychlé zamítnutí ne-obličejů

Většina podoken v reálném obrázku **nejsou obličeje**. Kaskáda toho využívá:

- Na začátku kaskády jednoduché klasifikátory zamítnou co **nejvíce negativních vzorků**.
- Negativní klasifikace v libovolné fázi **ukončí** zpracování daného podokna.
- Pozitivně klasifikované vzorky postupují k **složitějším** klasifikátorům v dalších fázích.

```
VZORKY → C1 → T → C2 → T → C3 → T → ... → OBLIČEJ
              F        F        F
            NE-OBLIČEJ NE-OBLIČEJ NE-OBLIČEJ
```

### Trénování kaskády

- Práh každého slabého klasifikátoru je zvolen tak, aby **minimalizoval falešné negativy** (nesmíme příliš brzy zahodit skutečné obličeje).
- Každý další klasifikátor je trénován na **falešných pozitivech předchozího** — postupně se učí rozlišovat těžší negativy.

Příklad uvedený na slidech:

| Fáze | #příznaků | Míra detekce | Míra falešných pozitiv |
|------|----------:|-------------:|-----------------------:|
| C1   | 1         | 100 %        | 50 %                   |
| C5   | 5         | 100 %        | 40 % (kumulativně 20 %) |
| C20  | 20        | 100 %        | 10 % (kumulativně 2 %)  |

Používané příznaky jsou v podstatě **Haarovy vlnky**, vybírané jako nejdiskriminativnější pro danou fázi.

### Parametry kaskády

- Počet fází kaskády
- Počet příznaků v každé fázi
- Práh v každém klasifikátoru

---

## Implementační detaily

- Základní detekční okno: **24 × 24** pixelů.
- **Mění se měřítko detektoru, ne obrazu** (rychlejší, integrální obraz se počítá jen jednou).
- Více překrývajících se detekcí téhož obličeje je sloučeno v **postprocessingu**.

### Použitá trénovací data

- **4916 × 2** obličejů (zrcadlené), normalizované a škálované na 24 × 24.
- **10 000** ne-obličejů.

### Výsledný klasifikátor

- **38 fází** kaskády.
- Počty příznaků v jednotlivých fázích: 2, 10, 25, 25, 50, …
- Celkem **6060** příznaků.

### Uváděné výsledky

- Testovací množina MIT + CMU: 130 obrázků / 507 obličejů — používá se jako *de facto* benchmark.

### Rozšíření na profilové obličeje

- Pro detekci profilů se trénuje **nová kaskáda s novými příznaky** (příznaky pro frontální obličeje nejsou invariantní vůči rotaci kolem osy y).

---

## Shrnutí (zkouškové)

Detektor Viola–Jones převádí detekci obličejů na klasifikaci posuvného okna do dvou tříd. Pro real-time je dostatečně rychlý díky třem komplementárním myšlenkám:

1. **Integrální obrazy** umožňují vyhodnocení jednoduchých Haar-like obdélníkových příznaků v **konstantním čase**, nezávisle na velikosti příznaku.
2. **AdaBoost** vybere malou množinu nejdiskriminativnějších příznaků a kombinuje je jako vážené slabé klasifikátory do silného klasifikátoru.
3. **Kaskáda** silných klasifikátorů rostoucí složitosti rychle zahodí drtivou většinu ne-obličejových oken už v prvních fázích, takže výpočetně náročné klasifikátory běží jen na několika málo nadějných kandidátech.
