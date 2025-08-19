# yt-media-kit

## 🔹 Instalación

Clona el proyecto y luego instala dependencias:

```sh
git clone --depth 1 https://github.com/Ubiufboeuf/yt-media-kit
cd yt-media-kit
bun install
```

## 🔹 Ejecución

El CLI se puede ejecutar de varias maneras:

1. **Directamente desde el binario del proyecto:**

```sh
./bin/yt-media-kit
```

2. **Usando Bun:**

```sh
bun start # Modo normal
bun dev   # Modo desarrollo, omite ciertas comprobaciones como la validación del id del video
```

3. **Linkeando el CLI globalmente con Bun:**

```sh
bun link
yt-media-kit
```

Esto registra el comando `yt-media-kit` globalmente, permitiendo ejecutarlo desde cualquier carpeta.  
Útil para desarrollo local o si querés usarlo sin entrar a la carpeta del proyecto.

---

## 🔹 Modos de ejecución

### Iterar lista

Procesa todos los videos de la **misma lista** que también se usa para mostrar los IDs predefinidos.  
Al elegir un ID, podés usar un video rápido o uno que quieras específicamente.

### Completo

Permite seleccionar un video y ejecutar el flujo completo de procesamiento.

---

## 🔹 Flujo de procesamiento de un video

### Descargar video

Descarga según las resoluciones que quieras, para ahorrar datos.
Lógica:
  - Si ya existe la resolución exacta → no hace nada.
  - Si no existe → descarga.
  - Si existe una resolución diferente → descarga la nueva y borra la anterior.
  - Si se fuerza la descarga → borra y luego descarga nuevamente.

### Descargar audio

Si ya existe audio → se omite.
Si no existe o se fuerza → se descarga y reemplaza si es necesario.

### Unir audio y video

- Para sincronizar correctamente antes de crear resoluciones.

### Separar audio/video

- Para crear resoluciones inferiores usando solo el video.
- Evita generar resoluciones innecesarias.

### Crear resoluciones

- Se generan versiones inferiores a partir del video mayor usando FFmpeg.

### Crear streams segmentados

- Prepara versiones para streaming (DASH).

### Obtener información y assets

- Descarga metadatos y thumbnails para uso posterior.

### Mover y organizar datos

- Archivos descargados y generados se guardan en `storage/` organizado por tipo.

---

## 🔹 Configuración de la lista de videos

La lista de videos se encuentra en `src/lib/list.json`.  
Se usa tanto para **iterar como para mostrar IDs predefinidos**.

Ejemplo:

```json
[
  {
    "id": "p461V9fy4jo",
    "title": "Video 1"
  },
  {
    "id": "c4mHDmvrn4M",
    "title": "Video 2"
  }
]
```

Podés editar esta lista para agregar o quitar videos a procesar.

---

## 🔹 Estructura de carpetas

```txt
yt-media-kit/
├── bin/        # Ejecutables CLI
├── config/     # Configuración y schemas YAML/JSON
├── docs/       # Notas y documentación
├── src/        # Código fuente TypeScript
│   ├── cli/
│   ├── lib/
│   ├── patched/
│   └── utils/
├── storage/    # Videos, audios, resoluciones, streams, assets
├── tests/      # Archivos de prueba
├── .vscode/    # Configuración VS Code útil para el proyecto
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔹 Requisitos

- **Bun v1.2+**  
- **FFmpeg** (para unir, separar y crear resoluciones)  
- **MP4Box** (para segmentar streams)  
- **Node.js** (v16+ recomendado)  
- **yt-dlp** (actualizado a la versión más reciente)  
- **Python 3.13+** (opcional, usado internamente si se necesitan scripts auxiliares)

> Opcional: pnpm/npm si querés instalar dependencias con ellos, pero Bun es suficiente.  

---

## 🔹 Contribuciones

Si querés colaborar:  

1. Hacé un fork del repositorio.  
2. Creá una rama para tu feature o bug fix.  
3. Asegurate de probar los cambios antes de enviar el PR.  
4. Enviá un pull request con una descripción clara de los cambios.  

> Siempre da atribución y explicá si tu PR corrige un error o agrega funcionalidad.


---
> Readme hecho con ChatGPT y revisado por mAngo