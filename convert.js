#!/usr/bin/env node
// convert.js — Conversión masiva MP4→MP3 con resume, skip-on-error y estructura de carpetas

const fs        = require('fs');
const path      = require('path');
const { spawn } = require('child_process');
const archiver  = require('archiver');

;(async () => {
  // 1. Import dinámico de p-limit (ESM-only)
  const { default: pLimit } = await import('p-limit');

  // 2. Leer argumentos: carpeta de entrada, salida y concurrencia
  const [,, rawInput = './uploads', rawOutput = './converted', concArg = '2'] = process.argv;
  const concurrency = parseInt(concArg, 10);

  // 3. Resolver rutas absolutas
  const inputDir  = path.resolve(__dirname, rawInput);
  const outputDir = path.resolve(__dirname, rawOutput);

  // 4. Verificar carpeta de entrada
  if (!fs.existsSync(inputDir)) {
    console.error(`✋ Error: carpeta de entrada no existe:\n  ${inputDir}`);
    process.exit(1);
  }

  // 5. Crear carpeta de salida si no existe (no borra lo ya existente)
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`🔍 Escaneando:\n  ${inputDir}\n(concurrencia: ${concurrency})`);

  // 6. Función recursiva para listar todos los .mp4
  async function scanDir(dir, base) {
    const results = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        results.push(...await scanDir(full, base));
      } else if (ent.isFile() && /\.mp4$/i.test(ent.name)) {
        results.push({
          fullPath: full,
          relPath: path.relative(base, full)
        });
      }
    }
    return results;
  }

  // 7. Obtener todos los MP4
  const allEntries = await scanDir(inputDir, inputDir);
  const totalAll   = allEntries.length;
  if (totalAll === 0) {
    console.log('⚠️  No se encontraron archivos .mp4 en la carpeta de entrada.');
    process.exit(0);
  }

  // 8. Filtrar sólo los pendientes (sin su .mp3 correspondiente)
  const pending = allEntries.filter(({ relPath }) => {
    const mp3Rel  = relPath.replace(/\.mp4$/i, '.mp3');
    const mp3Full = path.join(outputDir, mp3Rel);
    return !fs.existsSync(mp3Full);
  });

  console.log(`🔎 Total MP4 encontrados:   ${totalAll}`);
  console.log(`⏭️  Saltados (ya convertidos): ${totalAll - pending.length}`);
  console.log(`⚙️  Pendientes de conversión:  ${pending.length}`);

  if (pending.length === 0) {
    console.log('✅ No hay nada pendiente de conversión. ¡Listo!');
    process.exit(0);
  }

  // 9. Preparar limitador de concurrencia y contador
  const limit   = pLimit(concurrency);
  let counter   = 0;

  // 10. Crear tareas de conversión con skip-on-error
  const tasks = pending.map(({ fullPath, relPath }) =>
    limit(async () => {
      const idx    = ++counter;
      console.log(`➡️  [${idx}/${pending.length}] Convirtiendo: ${relPath}`);
      const outRel = relPath.replace(/\.mp4$/i, '.mp3');
      const outFull= path.join(outputDir, outRel);
      fs.mkdirSync(path.dirname(outFull), { recursive: true });

      try {
        await convertOne(fullPath, outFull);
        console.log(`✅ [${idx}/${pending.length}] OK:   ${relPath}`);
      } catch (err) {
        console.error(`❌ [${idx}/${pending.length}] FAIL: ${relPath}\n    → ${err.message}`);
        // No se hace `throw`, así continúa con el siguiente
      }
    })
  );

  // 11. Ejecutar todas las tareas sin que un fallo individual detenga el proceso
  await Promise.all(tasks);
  console.log(`🎉 Conversión de pendientes finalizada (${pending.length} archivos)`);

  // 12. Empaquetar todo lo que hay en outputDir en un ZIP
  const zipName = 'mp3_convertidos.zip';
  const zipPath = path.join(__dirname, zipName);
  const output  = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.directory(outputDir, false);
  await archive.finalize();

  console.log(`📦 ZIP generado correctamente:\n  ${zipPath}`);
})();

// 13. Función que convierte un MP4 a MP3 usando ffmpeg
function convertOne(input, output) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-i', input,
      '-vn',                // sin video
      '-ar', '44100',       // sampling rate
      '-ac', '2',           // stereo
      '-b:a', '192k',       // bitrate
      output
    ], { stdio: 'ignore' });

    ff.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg falló (code ${code})`));
    });
  });
}
