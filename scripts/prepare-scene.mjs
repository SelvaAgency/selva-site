#!/usr/bin/env node
/**
 * Gera as versões otimizadas de uma cena a partir dos brutos em assets-src/.
 * Uso: node scripts/prepare-scene.mjs --scene cena0 --in assets-src/cena0-T1.mp4 [--in assets-src/cena0-T2.mp4] [--out public/scenes]
 * Saída: public/scenes/<cena>/{video/*.mp4, frames/{desktop,mobile}/NNNN.webp, poster-*.jpg, manifest.json}
 * Requer ffmpeg/ffprobe com libx264, libx265 e libwebp.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const inputs = args.flatMap((a, i) => (a === '--in' ? [args[i + 1]] : []));
const scene = opt('--scene', 'cena0');
const outRoot = resolve(opt('--out', 'public/scenes'));
const fps = Number(opt('--fps', '30'));
if (!inputs.length) { console.error('informe ao menos um --in'); process.exit(1); }

const run = (bin, a) => execFileSync(bin, a, { stdio: ['ignore', 'pipe', 'inherit'] }).toString();
const probe = (f) => {
  const j = JSON.parse(run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', f]));
  const v = j.streams.find((s) => s.codec_type === 'video');
  const [n, d] = v.r_frame_rate.split('/').map(Number);
  return { file: f, width: v.width, height: v.height, fps: n / d, duration: Number(j.format.duration), codec: v.codec_name };
};

const out = join(outRoot, scene);
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'video'), { recursive: true });
mkdirSync(join(out, 'frames', 'desktop'), { recursive: true });
mkdirSync(join(out, 'frames', 'mobile'), { recursive: true });

// 1) concatena os trechos num bruto intermediário quase sem perdas, no quadro comum (maior largura, 16:9).
//    Trechos menores são ampliados; o manifest registra o tamanho nativo de cada um.
const sources = inputs.map(probe);
let src = resolve(inputs[0]);
if (inputs.length > 1) {
  const W = Math.min(1920, Math.max(...sources.map((s) => s.width)));
  const H = Math.round((W * 9) / 16 / 2) * 2;
  const inArgs = inputs.flatMap((f) => ['-i', resolve(f)]);
  const chain = sources.map((_, i) => `[${i}:v]fps=${fps},scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`).join(';');
  const concat = sources.map((_, i) => `[v${i}]`).join('') + `concat=n=${sources.length}:v=1:a=0[out]`;
  src = join(tmpdir(), `selva-${scene}-master.mp4`);
  run('ffmpeg', ['-y', '-v', 'error', ...inArgs, '-filter_complex', `${chain};${concat}`, '-map', '[out]', '-c:v', 'libx264', '-preset', 'fast', '-crf', '14', '-pix_fmt', 'yuv420p', '-an', src]);
}
const master = probe(src);
console.log('fonte', master);

// filtros: desktop mantém 16:9 (máx. 1920); mobile = recorte central vertical 9:16 (máx. 720 de largura)
const desktopVf = `fps=${fps},scale='min(1920,iw)':-2`;
const mobileVf = `fps=${fps},crop=ih*9/16:ih,scale='min(720,iw)':-2`;
const common = ['-an', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];

const videos = [];
const encode = (id, variant, vf, codecArgs, ext = 'mp4') => {
  const file = `${id}-${variant}.${ext}`;
  const path = join(out, 'video', file);
  run('ffmpeg', ['-y', '-v', 'error', '-i', src, '-vf', vf, ...codecArgs, ...common, path]);
  const p = probe(path);
  videos.push({ id, variant, path: `/scenes/${scene}/video/${file}`, bytes: statSync(path).size, width: p.width, height: p.height, codec: p.codec, fps: p.fps, duration: p.duration });
  console.log('vídeo', file, (statSync(path).size / 1e6).toFixed(2), 'MB');
};
for (const [variant, vf] of [['desktop', desktopVf], ['mobile', mobileVf]]) {
  // GOP curto: o Safari busca a partir do keyframe anterior; 6 quadros = 0,2 s a 30 fps
  encode('h264-gop6', variant, vf, ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-g', '6', '-keyint_min', '6', '-bf', '0', '-profile:v', 'high']);
  // todo quadro é keyframe: scrub exato, arquivo maior
  encode('h264-gop1', variant, vf, ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-g', '1', '-keyint_min', '1', '-bf', '0', '-profile:v', 'high']);
  // HEVC para Safari (hvc1), mesmo GOP curto
  encode('hevc-gop6', variant, vf, ['-c:v', 'libx265', '-preset', 'fast', '-crf', '26', '-x265-params', 'keyint=6:min-keyint=6:bframes=0', '-tag:v', 'hvc1']);
}

// 2) sequência de frames em WebP
const frames = [];
for (const [variant, width] of [['desktop', 1280], ['mobile', 540]]) {
  const dir = join(out, 'frames', variant);
  const vf = variant === 'desktop' ? `fps=${fps},scale='min(${width},iw)':-2` : `fps=${fps},crop=ih*9/16:ih,scale='min(${width},iw)':-2`;
  run('ffmpeg', ['-y', '-v', 'error', '-i', src, '-vf', vf, '-c:v', 'libwebp', '-lossless', '0', '-quality', '72', '-compression_level', '4', join(dir, '%04d.webp')]);
  const files = readdirSync(dir).filter((f) => f.endsWith('.webp')).sort();
  const bytes = files.reduce((s, f) => s + statSync(join(dir, f)).size, 0);
  const first = probe(join(dir, files[0]));
  frames.push({ variant, dir: `/scenes/${scene}/frames/${variant}/`, count: files.length, pad: 4, ext: 'webp', bytes, width: first.width, height: first.height });
  console.log('frames', variant, files.length, 'quadros', (bytes / 1e6).toFixed(2), 'MB');
}

// 3) pôsteres (primeiro quadro) para fallback estático
const posters = {};
for (const [variant, vf] of [['desktop', desktopVf], ['mobile', mobileVf]]) {
  const file = `poster-${variant}.jpg`;
  run('ffmpeg', ['-y', '-v', 'error', '-i', src, '-vf', vf, '-frames:v', '1', '-q:v', '3', join(out, file)]);
  posters[variant] = { path: `/scenes/${scene}/${file}`, bytes: statSync(join(out, file)).size };
}

const manifest = { scene, generatedAt: new Date().toISOString(), fps, sources: sources.map((s) => ({ ...s, file: s.file.split('/').pop() })), master: { ...master, file: undefined }, videos, frames, posters };
writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('manifest em', join(out, 'manifest.json'));
