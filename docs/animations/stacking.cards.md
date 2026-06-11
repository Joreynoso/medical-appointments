# Stacking Cards on Scroll — GSAP + ScrollTrigger

Guía completa para replicar el efecto de tarjetas apiladas con inclinación al hacer scroll.

---

## Cómo funciona

Cada tarjeta vive dentro de un contenedor `position: sticky`. Mientras el usuario scrollea, GSAP anima la tarjeta activa hacia atrás (escala menor, opacidad reducida, rotación acentuada) justo cuando la siguiente entra en pantalla. La última tarjeta no se anima: queda arriba del stack como "ganadora".

```
Scroll ──►  [card-1 se encoge y rota más]
            [card-2 entra, se convierte en activa]
            [card-2 se encoge y rota más]
            [card-3 entra...]  →  y así hasta la última
```

---

## Dependencias

Cargar GSAP y el plugin ScrollTrigger desde CDN, **antes del cierre de `</body>`**:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

---

## HTML

La estructura es simple: una sección contenedora con N bloques `.card-sticky`, uno por tarjeta.

```html
<section class="cards-section">

  <div class="card-sticky">
    <div class="card" id="card-1">
      <!-- contenido de la tarjeta -->
    </div>
  </div>

  <div class="card-sticky">
    <div class="card" id="card-2">
      <!-- contenido de la tarjeta -->
    </div>
  </div>

  <div class="card-sticky">
    <div class="card" id="card-3">
      <!-- contenido de la tarjeta -->
    </div>
  </div>

  <div class="card-sticky">
    <div class="card" id="card-4">
      <!-- contenido de la tarjeta -->
    </div>
  </div>

</section>
```

> **Regla:** agregar o quitar tarjetas es solo añadir/quitar bloques `.card-sticky`. El JS se adapta automáticamente.

---

## CSS

### Reset y variables

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg:      #f5f4f0;
  --card-bg: #ffffff;
  --text:    #1a1a18;
  --muted:   #888780;
  --border:  rgba(0, 0, 0, 0.08);
}

html { scroll-behavior: auto; } /* importante: no smooth-scroll nativo */

body {
  background: var(--bg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--text);
}
```

### Contenedor sticky — la clave estructural

```css
.cards-section {
  position: relative; /* contexto para los sticky hijos */
}

.card-sticky {
  position: sticky;
  top: 0;
  height: 100vh;          /* cada bloque ocupa toda la pantalla */
  display: flex;
  align-items: center;
  justify-content: center;
}
```

> `position: sticky; top: 0; height: 100vh` hace que cada bloque "espere" en pantalla mientras el scroll avanza sobre él. Al apilar varios de estos bloques, el navegador los va reteniendo uno sobre otro de forma nativa — sin JS adicional para el posicionamiento.

### La tarjeta

```css
.card {
  width: 520px;
  max-width: 88vw;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2.5rem 2.75rem;
  will-change: transform, opacity; /* optimización GPU */
  transform-origin: center center; /* rotación desde el centro */
}
```

### Inclinaciones iniciales — cada tarjeta tiene su ángulo

```css
#card-1 { transform: rotate(-3deg); }
#card-2 { transform: rotate(2.5deg); }
#card-3 { transform: rotate(-2deg); }
#card-4 { transform: rotate(1.5deg); }
```

> Estas rotaciones CSS son solo el estado visual inicial. GSAP las sobreescribe inmediatamente con `gsap.set()` para tomar control del transform completo.

---

## JavaScript

```js
gsap.registerPlugin(ScrollTrigger);

// Rotación inicial de cada tarjeta (en grados)
const initialRotations = [-3, 2.5, -2, 1.5];

// Rotación destino cuando la tarjeta queda enterrada bajo el stack
const buriedRotations  = [-6, 5, -4.5, 3];

const cards = gsap.utils.toArray('.card');

cards.forEach((card, i) => {

  // GSAP toma control del transform desde el inicio
  gsap.set(card, { rotation: initialRotations[i] });

  // La última tarjeta no se anima (queda arriba del stack)
  if (i === cards.length - 1) return;

  gsap.to(card, {
    scale:    0.88 - (i * 0.02),   // cada tarjeta apilada es un poco más pequeña
    opacity:  0.55 - (i * 0.08),   // cada tarjeta apilada es un poco más opaca
    rotation: buriedRotations[i],  // exagera la inclinación al quedar enterrada
    ease: 'none',                  // lineal: el scroll ES la animación

    scrollTrigger: {
      trigger: card.closest('.card-sticky'), // se activa cuando este bloque llega al top
      start: 'top top',   // cuando el bloque sticky toca el borde superior de la ventana
      end:   'bottom top', // hasta que el bloque sale por arriba
      scrub: true,         // la animación sigue 1:1 al scroll (sin timing fijo)
    }
  });

});
```

---

## Tabla de valores de animación

| Tarjeta | Rotación inicial | Rotación enterrada | Scale final | Opacity final |
|---------|------------------|--------------------|-------------|---------------|
| card-1  | -3°              | -6°                | 0.88        | 0.55          |
| card-2  | +2.5°            | +5°                | 0.86        | 0.47          |
| card-3  | -2°              | -4.5°              | 0.84        | 0.39          |
| card-4  | +1.5°            | no se anima        | —           | —             |

---

## Cómo ajustar

**Más/menos inclinación** → cambiar los valores en `initialRotations` y `buriedRotations`.

**Más/menos tarjetas** → agregar bloques `.card-sticky` en el HTML y extender los arrays con un valor más cada uno.

**Velocidad del scrub** → cambiar `scrub: true` por `scrub: 1.5` (número = segundos de lag/suavizado).

**Escala mínima** → ajustar `0.88 - (i * 0.02)`. Si hay muchas tarjetas, reducir el `0.02` para que no lleguen a cero.

**Opacidad mínima** → ajustar `0.55 - (i * 0.08)`. Mismo criterio.

---

## Estructura de archivos

```
proyecto/
└── index.html   ← todo en un solo archivo (HTML + CSS + JS)
```

No se necesita ningún bundler, npm, ni configuración. Solo abrir `index.html` en el navegador.