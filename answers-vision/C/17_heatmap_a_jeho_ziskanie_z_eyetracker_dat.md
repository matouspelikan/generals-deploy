# 17. Heatmap a jeho získanie z eyetracker dát

**Heatmap** je vizualizace **hustoty fixací** překrytá přes obraz, kde barva (typicky modrá → červená) odpovídá **kumulované délce nebo počtu fixací** v dané oblasti. Získání: ze syrového záznamu pohledu se algoritmem **I-VT / I-DT** identifikují **fixace** (těžiště, doba trvání), z nich se vytvoří 2D **pravděpodobnostní hustota** — typicky konvolucí každé fixace s **Gaussiánem** (šířka ~zrakový úhel 1°, výška ~ délka fixace), výsledek se znormalizuje a obarví. Heatmapy lze prahovat a porovnávat **Kullback–Leiblerovou divergencí**.
