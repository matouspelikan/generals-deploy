# 5. Hľadanie hrán v zašumených obrazoch. LoG

V zašumených obrazech derivace zesilují šum, proto se obraz **nejprve vyhladí Gaussiánem** a teprve potom derivuje — díky asociativitě konvoluce $\nabla^2(I * G) = I * \nabla^2 G$. **LoG (Laplacian of Gaussian)** $\nabla^2 G = \frac{\partial^2 G}{\partial x^2} + \frac{\partial^2 G}{\partial y^2}$ je tedy jeden filtr, který v jednom kroku **vyhladí a spočítá druhou derivaci**; hrany se detekují jako **průchody nulou** (zero crossings) odezvy LoG.
