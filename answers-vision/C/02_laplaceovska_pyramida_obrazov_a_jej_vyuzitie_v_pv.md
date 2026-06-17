# 2. Laplaceovská pyramída obrazov a jej využitie v PV

Laplaceovská pyramida ukládá **rozdíly mezi sousedními úrovněmi Gaussovské pyramidy**: $L_i = G_i - \text{expand}(G_{i+1})$, $L_n = G_n$ — tedy pásmově propustný rozklad obsahující frekvence ztracené při vyhlazení (Burt & Adelson, 1983). Rekonstrukce je $G_i = L_i + \text{expand}(G_{i+1})$. Využití: **kombinace obrazů** (image blending s neviditelnými přechody), **komprese** (nízká entropie koeficientů) a **multi-resolution editing detailů**.
