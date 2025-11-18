# 🧠 LexiPic

**LexiPic** es una aplicación web con inteligencia artificial diseñada para **facilitar la comunicación de personas con Trastorno del Espectro Autista (TEA)**.  
A través de un **chatbot inteligente**, los usuarios pueden ingresar frases simples y cotidianas, y recibir **pictogramas visuales** que representen el mensaje de la mejor manera posible.

---

## 🌍 Objetivo
Promover la **inclusión y accesibilidad comunicativa** mediante el uso de tecnologías modernas, ayudando a que las personas con TEA puedan **expresarse y comprender el lenguaje** de una forma más visual y sencilla.

---

## 💬 Características principales

- 🤖 **Chatbot con IA**: interpreta frases simples y genera el pictograma más adecuado.  
- 🎨 **Interfaz accesible y amigable**: diseñada con principios de usabilidad y empatía.  
- 📱 **Diseño responsive**: totalmente adaptable a dispositivos móviles y de escritorio.  
- 🌗 **Modo claro y oscuro**: pensado para comodidad visual y accesibilidad.  
- ⚙️ **Estructura modular**: fácilmente integrable con frameworks modernos como React o Next.js.

---

## ⚙️ Puesta en marcha rápida

```bash
npm install
npm run dev
```

1. Carga `http://localhost:5173` y visita `/chatbot`.
2. Ingresa una frase cotidiana (ej. *"tengo hambre"*).
3. El cliente infiere palabras clave con el dataset `src/data/frases_procesadas.csv` y consulta la API oficial de ARASAAC (`/pictograms/{language}/bestsearch/{searchText}`) para mostrar hasta seis pictogramas.

> **Nota:** El idioma predeterminado de búsqueda es español (`es`), pero se puede alternar a inglés directamente en la interfaz.

### Búsquedas sin resultados

- Si ARASAAC responde `404` (no hay pictogramas para la frase exacta), el cliente vuelve a intentar automáticamente con palabras individuales y sinónimos cercanos del dataset.  
- En la interfaz verás las "consultas enviadas" para saber qué términos se probaron.  
- Cuando ninguna variación tiene coincidencias, se muestra un aviso informativo en lugar de un error bloqueante.

---

## 🧠 Modelo semántico

- El dataset de frases procesa tokens, bigramas y trigramas. Un modelo ligero basado en coincidencias léxicas ponderadas identifica las frases más parecidas y construye las consultas para ARASAAC.  
- Para una versión entrenable recomendamos usar **`sentence-transformers/paraphrase-multilingual-mpnet-base-v2`** (o MiniLM equivalente) para generar embeddings semánticos multilingües; después basta con un **k-NN** sobre el mismo dataset para recuperar las frases más afines antes de llamar a la API de pictogramas.

---

## 🧩 Estructura del proyecto

- `/` → **Landing Page** con descripción, beneficios y CTA hacia el chatbot.  
- `/chatbot` → Interfaz principal del asistente con campo de texto y área de pictogramas.  

---

## 🛠️ Tecnologías sugeridas

- **Frontend:** React / Next.js + TailwindCSS  
- **Backend:** Node.js / Python (Flask o FastAPI)  
- **IA y pictogramas:** API de procesamiento de lenguaje natural e imágenes  
- **Accesibilidad:** pautas WCAG y buenas prácticas UX

---

## 💡 Visión
Convertir a **LexiPic** en una herramienta de apoyo comunicacional reconocida por su **impacto social y humano**, haciendo del lenguaje visual un puente hacia una mejor comprensión.

---

## 📬 Contacto
¿Tienes ideas o deseas contribuir?  
Abre un issue o envía tus sugerencias.  
🌐 [Proyecto LexiPic](#)

---
