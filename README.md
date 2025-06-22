# PuniSoft MP4-to-MP3 Batch Converter

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-v20.14.0-43853D" alt="Node.js version" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License" />
</div>

## 🔍 Descripción

Este proyecto es una **herramienta de línea de comandos** para convertir masivamente archivos **MP4** a **MP3**, preservando la estructura de carpetas y **omitindo** los que ya fueron convertidos. Además, genera un archivo ZIP con todos los MP3 resultantes.

<hr />

## 🛠️ Características

* Procesa **todos** los `*.mp4` dentro de la carpeta de entrada (`uploads/`) y sus subdirectorios.
* **Omite** los archivos que ya tienen su equivalente `.mp3` en la carpeta de salida (`converted/`).
* **Skip-on-error**: captura errores en archivos individuales y continúa con el siguiente.
* Control de **concurrencia** para optimizar el uso de CPU.
* **ZIP** final con toda la carpeta de salida.

<hr />

## 📁 Estructura del proyecto

```text
mp4/
├─ uploads/        ← Carpeta de entrada con tus .mp4 organizados en subcarpetas
├─ converted/      ← Carpeta de salida que se va llenando con .mp3
├─ convert.js      ← Script principal de conversión
├─ package.json    ← Configuración de dependencias y scripts
└─ README.md       ← Este archivo
```

<hr />

## ⚙️ Requisitos

* **Node.js** v16+ (probado en v20.14.0)
* **FFmpeg** instalado y disponible en tu `PATH` (ver `ffmpeg -version`)

<hr />

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/mp4-to-mp3-batch.git
cd mp4-to-mp3-batch

# Instalar dependencias (solo p-limit y archiver)
npm install
```

<hr />

## 🎯 Uso

```bash
# Coloca tus carpetas mp4 bajo uploads/
# Ejecuta la conversión con 2 procesos en paralelo:
npm run convert

# O especifica parámetros manualmente:
#   node convert.js <carpeta_entrada> <carpeta_salida> <concurrencia>
node convert.js "./uploads" "./converted" 4
```

Después de terminar, encontrarás:

1. Todos los archivos `.mp3` en `converted/` con la misma jerarquía.
2. Un ZIP `mp3_convertidos.zip` en la raíz del proyecto.

<hr />


## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Siéntete libre de abrir issues o enviar pull requests.

<hr />

## ⚖️ Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.
