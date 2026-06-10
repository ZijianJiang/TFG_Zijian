# Generador de ideas y guiones para contenido corto con IA

Aplicación web orientada a la generación asistida de ideas y guiones para contenido corto en plataformas como TikTok, Instagram Reels y YouTube Shorts.

El objetivo del proyecto es ayudar a creadores de contenido a obtener propuestas más útiles, menos genéricas y mejor adaptadas a su contexto mediante el uso de modelos de lenguaje (LLM) y técnicas de prompt engineering.

---

## Descripción

Esta aplicación permite introducir información contextual sobre el contenido que se quiere crear, como el nicho, la audiencia, el objetivo o el estilo, y transformar esos datos en ideas y guiones más estructurados y aplicables.

A diferencia de un prompt libre en un chat generalista, el sistema organiza la información de entrada antes de enviarla al modelo, con el fin de mejorar la calidad, relevancia y utilidad del resultado generado.

---

## Funcionalidades principales

- Generación asistida de ideas y guiones para contenido corto
- Formulario guiado por pasos para estructurar el contexto
- Adaptación del resultado según objetivo, plataforma y tipo de contenido
- Generación de hooks, ideas, desarrollo, dinamismo y CTA
- Visualización del resultado en formato estructurado
- Exportación del contenido generado en PDF
- Posibilidad de copiar y reutilizar resultados
- Gestión básica de sesión de usuario
- Guardado de contenido generado

---

## Objetivo del proyecto

El proyecto nace de una necesidad real dentro del proceso de creación de contenido digital: muchas ideas generadas manualmente o con IA resultan demasiado genéricas, repetitivas o poco adaptadas al contexto concreto del creador.

La aplicación busca resolver este problema mediante una mejor estructuración del contexto y una lógica de generación más orientada a casos de uso reales.

---

## Tecnologías utilizadas


- Frontend web
- Backend Node.js
- OpenAI API
- Base de datos SQLite
- Exportación a PDF
- Sistema de prompts dinámicos
- Respuesta en streaming

---

## Estructura general del sistema

El funcionamiento general de la aplicación sigue este flujo:

1. El usuario introduce los datos del contenido mediante un formulario guiado.
2. El sistema valida los campos obligatorios.
3. El backend construye un prompt estructurado a partir del contexto introducido.
4. El prompt se envía a un modelo de lenguaje.
5. El modelo genera la respuesta.
6. La aplicación muestra el resultado al usuario en formato reutilizable.
7. El usuario puede copiar, descargar o guardar el contenido generado.

---

## Instalación

### Requisitos previos

- Node.js
- npm
- Clave de OpenAI API

### Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_REPOSITORIO>

cd backend
npm install
npm start
```

