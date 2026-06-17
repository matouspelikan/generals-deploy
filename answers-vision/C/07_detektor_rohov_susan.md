# 7. Detektor rohov SUSAN

SUSAN porovná **intenzitu každého pixelu v kruhové masce** s intenzitou jejího středu (**nucleus**) a vyznačí oblast, kde mají body **podobnou intenzitu** = **USAN (Univalue Segment Assimilating Nucleus)**. USAN je velká v ploché oblasti, **malá u hran a ještě menší v rozích**. **Rohy** se detekují jako **lokální minima USAN mapy** (SUSAN = Smallest USAN). Výhoda: nepoužívá derivace, takže je robustní vůči šumu.
