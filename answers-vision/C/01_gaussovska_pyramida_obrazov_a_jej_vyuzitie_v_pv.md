# 1. Gaussovská pyramída obrazov a jej využitie v PV

Gaussovská pyramida je hierarchická reprezentace obrazu na klesajících rozlišeních — každá vyšší úroveň vzniká **Gaussovým vyhlazením a podvzorkováním** (2×) předchozí: $G_l(i,j) = \sum_{m,n} w(m,n) G_{l-1}(2i+m, 2j+n)$. Slouží jako **low-pass kaskáda**, kde se postupně ztrácejí vysoké frekvence. V PV se používá pro **multiscale template matching**, **pyramidální výpočet optického toku** (Lucas–Kanade pro velké pohyby), **DoG prostor v SIFT detektoru** a **saliency** (Itti model).
