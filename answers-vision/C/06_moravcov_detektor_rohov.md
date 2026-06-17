# 6. Moravcov detektor rohov

Moravec hledá body s **nízkou autopodobností**: pro každý pixel posouvá okno v **8 směrech** o vektor $\mathbf{u}$ a počítá sumu kvadratických rozdílů $E_{WSSD}(\mathbf{u}) = \sum_i w(\mathbf{p}_i)[I(\mathbf{p}_i + \mathbf{u}) - I(\mathbf{p}_i)]^2$. **Rohovitost** bodu je **minimum** z těchto 8 hodnot — pokud je vysoké, znamená to změnu ve všech směrech, tedy roh. Slabiny: anizotropní odezva (jen 8 diskrétních směrů), citlivost na šum, není rotačně invariantní (proto Harris).
