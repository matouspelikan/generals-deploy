# 9. Detektor FAST a deskriptor BRIEF

**FAST** porovnává intenzitu středu s **16 pixely na Bresenhamově kružnici** o poloměru $r=3$. Bod je roh, pokud existuje souvislý oblouk (např. 12) pixelů, které jsou **všechny jasnější** nebo **všechny tmavší** než střed o určitý práh; je extrémně rychlý (Rosten & Drummond, ECCV 2006). **BRIEF** je jeden z prvních **binárních deskriptorů**: v okolí bodu zájmu porovnává **intenzity dvojic pixelů** v náhodně zvolených pozicích, výsledek je **bitový řetězec** o délce 128 nebo 256 bitů — porovnává se rychle pomocí **Hammingovy vzdálenosti**.
