# yt-media-kit – Guía de funcionamiento

Este documento describe **cómo funciona internamente** yt-media-kit, desde la descarga hasta la organización de datos, incluyendo la lógica de audio/video y generación de resoluciones y streams.

---

## 🔹 Modos de ejecución

- **Iterar lista**: procesa todos los videos en `src/lib/list.json`.  
- **Completo**: permite seleccionar un video específico y ejecutar el flujo completo de procesamiento.

---

## 🔹 Flujo de procesamiento de un video

### 1. Descargar video
- Descarga la **mayor resolución disponible** para minimizar el uso de datos.  
- Lógica de control:
  - Si ya existe la resolución exacta → **no hace nada**.  
  - Si no existe → **descarga**.  
  - Si existe una resolución diferente → **descarga la nueva y borra la anterior**.  
  - Si se fuerza → **borra y descarga nuevamente**.

### 2. Descargar audio
- Solo si no existe o si se fuerza.  
- Si ya existe audio → **se omite**.  
- Si se fuerza → **se borra y descarga nuevamente**.

### 3. Unir audio y video
- Combina audio y video para garantizar **sincronización exacta** antes de generar resoluciones inferiores.

### 4. Separar audio y video
- Una vez unidos, se separan para:
  - **Reutilizar el video** para crear resoluciones inferiores sin tener que unirlo nuevamente.  
  - Evitar errores y desincronización.

### 5. Crear resoluciones
- Genera versiones inferiores usando FFmpeg a partir del video mayor.  
- Se aprovecha el video separado para no recrear resoluciones innecesarias.

### 6. Crear streams segmentados
- Prepara versiones segmentadas tipo DASH/HLS a partir de las resoluciones generadas.

### 7. Obtener información
- Descarga metadatos del video usando `yt-dlp`.

### 8. Conseguir assets
- Descarga thumbnails y otros recursos relacionados para uso posterior.

### 9. Mover a producción
- Mueve los datos en `storage/` del video a nexora o la ruta especificada en `constants.ts`
- Archivos descargados y generados se guardan en `storage/` organizados por tipo:  
  `videos/`, `audios/`, `resoluciones/`, `streams/`, `assets/`.

---

## 🔹 Principios clave

- **Sincronización**: unir y separar audio/video asegura que todas las resoluciones derivadas estén perfectamente alineadas.  
- **Eficiencia**: se reutiliza el video mayor para crear resoluciones inferiores, evitando reprocesamientos innecesarios.  
- **Control de descargas**: solo se reemplazan archivos si es necesario o si se fuerza la descarga.  
- **Ahorro de recursos**: minimiza ancho de banda y tiempo de procesamiento, especialmente en videos largos o de alta resolución.

---

## 🔹 Flujo resumido (diagrama textual)

```markdown
Descargar video mayor resolución
           │
           ▼
Descargar audio si es necesario
           │
           ▼
     Unir audio + video
           │
           ▼
     Separar audio/video
           │
           ▼
   Crear resoluciones inferiores
           │
           ▼
 Crear streams segmentados (DASH)
           │
           ▼
   Obtener info y assets
           │
           ▼
  Organizar todo en storage/
```
