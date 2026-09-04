---
trigger: always_on
---

---

name: skill-diary
description: Buenas prácticas para construir o extender mind-diary, una app de diario personal en Astro con estética Warm Bento grid y persistencia en localStorage. Úsala siempre que el usuario trabaje en componentes .astro de tarjetas (cards) del diario, entradas de journal, mood tracker, tags, streaks, o cualquier feature del proyecto mind-diary — incluso si no lo menciona por nombre y solo dice "agrégale una card de X" o "haz que el diario guarde Y". También aplica al crear un diario/journal web nuevo desde cero con el mismo enfoque (Astro + Warm Bento + localStorage).

---

# skill-diary

Reglas para trabajar en mind-diary — o cualquier diario/journal web que siga el mismo enfoque (Astro, sin React, estética Warm Bento grid, persistencia en localStorage) — sin salirse de las convenciones que el proyecto ya tiene.

## Por qué existe esta skill

Un diario personal es una app pequeña que crece a punta de "agrégale una card más". Sin una regla explícita, cada card nueva termina con su propia paleta, su propio patrón de guardado y sus propios nombres de clase — y el conjunto deja de sentirse como un solo producto. Esta skill fija lo que debe mantenerse igual (diseño, modelo de datos) para que cada componente nuevo encaje con los que ya existen.

## 1. Sistema de diseño: Warm Bento

Cada card es un bloque de color cálido y desaturado, con un acento más oscuro de la misma familia de color para texto/label. No mezclar familias de color entre fondo y acento de una misma card — el acento siempre es una versión más oscura/saturada del mismo tono del fondo.

Paletas ya en uso — reutilízalas para cards relacionadas antes de inventar un color nuevo:

| Card            | Fondo                    | Acento    |
| --------------- | ------------------------ | --------- |
| Fecha           | `var(--warm-brown-dark)` | `#C4956A` |
| Entrada del día | `#F9E0D9` (durazno)      | `#A65C4A` |
| Mood            | `#D4CAEE` (lavanda)      | `#8873B8` |
| Cita/quote      | `#C8D9C4` (salvia)       | `#4A6845` |

Si necesitas una card nueva sin precedente de color, elige un tono pastel desaturado que no choque con los de arriba (evita reusar durazno/lavanda/salvia/marrón) y calcula el acento oscureciendo/saturando ese mismo hue — no un color de otra familia.

**Anatomía estándar de una card:**

- Contenedor `.card` con `background`, `border-radius: var(--card-radius)`, padding `1rem` o `14px 16px`.
- Un `.card-label` opcional en mayúsculas o con `letter-spacing: 0.12em`, `font-size` entre `0.6rem` y `0.7rem`, color = acento de la card. Es la "etiqueta" que identifica qué card es (ej. "MOOD", "Today Entry").
- El contenido principal (texto, inputs, lista) en un tamaño de fuente algo mayor que el label.
- Metadatos secundarios (fecha, contador, autor) en `~0.65rem`, también con el color de acento.

Antes de dar por terminada una card nueva, compárala visualmente con las que ya existen (`DateCard`, `EntryCard`, `MoodCard`, `QuoteCard`) — si no tiene `.card-label` ni usa `var(--card-radius)` ni sigue la paleta, no está lista, aunque muestre el contenido correcto.

## 2. Modelo de datos de una entrada

Todo el diario gira en torno a una sola forma de dato: la entrada. Sin importar cuántas cards existan (mood, tags, contenido, streak...), todas leen y escriben sobre el **mismo objeto de entrada**, nunca sobre fragmentos sueltos en keys distintas de localStorage. Guardar el mood en una key y el contenido en otra rompe la primera vez que alguien quiera, por ejemplo, listar "todas las entradas tristes de esta semana": no hay un solo lugar de donde leer eso.

Campos obligatorios de una entrada:

- **fecha** — identifica el día al que pertenece la entrada.
- **contenido** — el texto que escribió el usuario.
- **estado de ánimo (mood)** — el valor seleccionado en el mood tracker.
- **tags** — lista de etiquetas asociadas.

Antes de escribir código que guarde o lea datos del diario, pregúntate: _¿este dato es parte de una entrada, o es un dato derivado (streak, tema recurrente) que se puede calcular a partir de las entradas guardadas?_ Los datos derivados (streak, temas frecuentes, "recientes") no se guardan por separado — se calculan leyendo el conjunto de entradas cada vez que se muestran. Si te encuentras guardando un contador de streak en su propia key, primero evalúa si se puede derivar recorriendo las entradas.

Si el proyecto aún no tiene un módulo/función central para leer y escribir entradas, prefiere crear una antes de que una card nueva reinvente su propia forma de tocar localStorage — así todas las cards comparten una sola fuente de verdad para la forma del objeto.

## 3. Buenas prácticas de JS/Astro en este proyecto

Estas son cosas concretas que rompen silenciosamente en componentes `.astro` con `<script>` inline, así que vale la pena revisarlas explícitamente antes de considerar un componente terminado:

- **Selector = lo que hay en el markup.** Si en el HTML pusiste `class="entry-box"`, el selector en CSS es `.entry-box` (con punto) y en JS es `document.querySelector('.entry-box')` — `getElementById` solo funciona si el elemento tiene `id="entry-box"` en el HTML. Revisa que el tipo de selector (clase vs id) coincida en los tres lugares: HTML, CSS y JS.
- **Nombres de clase deben coincidir letra por letra** entre el HTML y el CSS/JS que los referencian. Un typo en una clase CSS (ej. escribir `.quote-tet` en vez de `.quote-text`) no da error — el estilo simplemente no se aplica y es fácil no notarlo. Al terminar un componente, vale la pena releer cada nombre de clase usado en el `<style>` y el `<script>` contra los que aparecen en el markup.
- **Keys dinámicas de localStorage van en template literals**, con backticks: `` `entry-${fecha}` ``, no concatenación con guiones sueltos. Si la key no usa una variable, no hace falta el template literal.
- **Todo lo que se guarda en localStorage debe poder leerse de vuelta.** Si un componente cambia un estado visual (ej. seleccionar un mood, marcar un tag), pregúntate si ese cambio debería sobrevivir a un refresh de página — si sí, tiene que escribirse en localStorage como parte del objeto de la entrada, no solo quedar en una variable o clase CSS en memoria.
- **JSON.parse/stringify para objetos.** localStorage solo guarda strings — cualquier valor que no sea un string simple (la entrada completa, un array de tags) necesita `JSON.stringify` al guardar y `JSON.parse` al leer, con un fallback razonable (`[]` o `null`) si la key todavía no existe.

## 4. Checklist antes de dar por terminado un componente nuevo

- [ ] Usa la paleta Warm Bento (fondo + acento del mismo tono) y `var(--card-radius)`.
- [ ] Tiene `.card-label` si es el tipo de card que lo amerita, siguiendo el tamaño/letter-spacing estándar.
- [ ] Si lee o escribe datos del diario, usa el modelo de entrada compartido (fecha, contenido, mood, tags) — no una key/formato propio.
- [ ] Si el dato es derivado (streak, temas, recientes), se calcula desde las entradas guardadas en vez de guardarse aparte.
- [ ] Los nombres de clase en `<style>` y `<script>` coinciden exactamente con los del markup.
- [ ] Las keys dinámicas de localStorage usan template literals con backticks.
- [ ] Cualquier estado que el usuario espera que persista (mood elegido, tags marcados) se guarda en localStorage, no solo en el DOM.
