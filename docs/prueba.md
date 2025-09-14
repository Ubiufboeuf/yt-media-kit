# yt-media-kit – Guía de ejecución, store y estructura

Este documento describe **cómo funciona internamente** yt-media-kit, la organización de la store global, jobs y steps, el flujo completo de procesamiento de videos y la estructura de carpetas. También incluye la API sugerida para interactuar con el estado del pipeline y mantenerlo escalable.

---

## 1️⃣ Estructura de carpetas

```markdown
src/
├── cli/                  # Entrada para CLI y comandos interactivos
│   ├── commands/
│   │   ├── fullProcess.ts
│   │   └── resetAndClean.ts
│   └── index.ts          # Barrel para CLI
├── core/                 # Lógica central, independiente de CLI
│   ├── pipeline/         # Secuencia de steps
│   │   ├── runBatch.ts
│   │   ├── runJob.ts
│   │   └── steps/        # Acciones específicas por video
│   │       ├── createDirectories.ts
│   │       ├── downloadAudio.ts
│   │       ├── downloadVideo.ts
│   │       ├── muxing.ts
│   │       ├── demuxing.ts
│   │       ├── generateResolutions.ts
│   │       ├── streams.ts
│   │       ├── fetchAssets.ts
│   │       └── fetchInfo.ts
│   └── store/            # Store global y API
│       ├── processStore.ts
│       ├── jobStore.ts
│       ├── types.ts
│       └── helpers.ts
├── lib/                  # Constantes, schemas y utils compartidas
│   ├── cli_arguments.ts
│   ├── constants.ts
│   └── videos-to-suggest.json
├── utils/                # Funciones utilitarias
│   ├── download.ts
│   ├── errorHandler.ts
│   ├── spawnAsync.ts
│   └── videoMetadata.ts
├── env.d.ts
└── index.ts              # Entrada principal para Node/Bun

storage/
├── audios_descargados/
├── videos_descargados/
├── videos_con_audio/
├── videos/
├── completos/
├── info/
└── assets/
```

---

## 2️⃣ Conceptos de store

- **Process**: representa la ejecución completa del programa (ej: fullProcess, iterar lista, resetAndClean).  
  Contiene información global del estado del programa y control de errores.
- **Job**: representa un video específico dentro de un process.  
  Contiene estado del video, paths de archivos, flags de steps completados, resoluciones generadas y logs propios.
- **Step**: representa un sub-paso dentro de un job (ej: downloadVideo, downloadAudio, muxing, demuxing, generateResolutions, streams, fetchAssets, fetchInfo).  
  Cada step mantiene su propio estado (pendiente, en progreso, completado, fallido) y logs/metadatos específicos.

---

## 3️⃣ Qué almacenar

### Process:
- id
- modo (fullProcess, iterar lista, resetAndClean, solo descargar video, solo audio, video+audio, etc)
- fecha de inicio/fin
- estado global
- logs globales

### Job:
- id del video
- paths de archivos (descargados, temporales, finales)
- resoluciones generadas
- flags de steps completados
- errores/local logs
- metadatos del video (duración, tamaño, resolución original)

### Step:
- nombre del step
- estado (pendiente, en progreso, completado, fallido)
- logs propios
- metadata específica (ej: tamaño video, duración, duración audio, checksum)

---

## 4️⃣ API sugerida

```javascript
// processStore.ts
processStore.createProcess({ mode: 'fullProcess' })
processStore.getProcess(id)
processStore.updateProcess(id, { ... })
processStore.listProcesses()

// jobStore.ts
jobStore.createJob(processId, videoId)
jobStore.getJob(processId, videoId)
jobStore.updateJob(processId, videoId, { ... })
jobStore.listJobs(processId)

// step updates
jobStore.updateStep(processId, videoId, stepName, { state, logs, metadata })
jobStore.getStep(processId, videoId, stepName)
```

---

## 5️⃣ Flujo de ejecución de un video

1. Descargar video
   - Si ya existe la resolución exacta → no hace nada
   - Si no existe → descarga
   - Si existe resolución diferente → descarga nueva y borra anterior
   - Si se fuerza → borra y descarga nuevamente

2. Descargar audio
   - Solo si no existe o si se fuerza
   - Si ya existe audio → se omite
   - Si se fuerza → borra y descarga nuevamente

3. Unir audio + video (muxing)
   - Garantiza sincronización exacta antes de crear resoluciones

4. Separar audio + video (demuxing)
   - Permite reutilizar video para resoluciones inferiores
   - Evita desincronización

5. Crear resoluciones inferiores
   - Genera versiones más pequeñas usando FFmpeg
   - Se aprovecha video separado para no recrear resoluciones innecesarias

6. Crear streams segmentados (DASH/HLS)
   - Prepara versiones segmentadas a partir de las resoluciones generadas

7. Obtener información del video
   - Descarga metadatos usando yt-dlp

8. Conseguir assets
   - Descarga thumbnails y otros recursos

9. Mover a producción
   - Archivos se organizan en storage/ por tipo: videos, audios, resoluciones, streams, assets

---

## 6️⃣ Principios clave

```markdown
- Sincronización: unir y separar audio/video asegura que todas las resoluciones derivadas estén perfectamente alineadas.
- Eficiencia: se reutiliza el video mayor para crear resoluciones inferiores, evitando reprocesamientos innecesarios.
- Control de descargas: solo se reemplazan archivos si es necesario o si se fuerza la descarga.
- Ahorro de recursos: minimiza ancho de banda y tiempo de procesamiento.
- CLI y API: todas las acciones pueden ejecutarse desde CLI o mediante la store y la API de jobs y steps.
```

---

## 7️⃣ Notas de implementación

```markdown
- Todos los prompts y preguntas del usuario se hacen **al inicio del fullProcess** para no interrumpir el flujo de descarga y procesamiento.
- Se separan modos de ejecución: fullProcess, iterar lista, resetAndClean, solo descargar audio/video, video+audio, etc.
- Se pueden ejecutar múltiples jobs dentro de un process.
- La store mantiene estado local por process y job; si se abren varios procesos en terminales distintas, cada uno tendrá su propia store (no se comparte entre procesos).
- Cada step registra su propio estado, logs y metadatos, permitiendo reintentos o debugging por separado.
- La API de la store permite **crear, leer y actualizar** process, jobs y steps de forma escalable y sencilla.
```

