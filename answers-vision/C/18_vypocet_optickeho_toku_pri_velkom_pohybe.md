# 18. Výpočet optického toku pri veľkom pohybe

Lucas–Kanade selhává při velkém pohybu, protože využívá **Taylorův rozvoj 1. řádu**. Řešení: **Gaussovská pyramida** — v hrubších škálách se velký pohyb stane malým (např. 10 px se ve škále 1/8 stane 1,25 px). **Algoritmus:** (1) na **nejhrubší škále** spustí iterativní LK → hrubý odhad $d$, (2) **warpne** obraz tímto odhadem, **upsample** na jemnější škálu, (3) spustí LK znovu pro zpřesnění, (4) opakuje až do plného rozlišení. Tím se velký pohyb rozloží na sekvenci **malých kroků** v každé úrovni.
