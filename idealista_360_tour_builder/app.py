#!/usr/bin/env python3
import os
import sys
import json
import shutil
import datetime
import threading
import webbrowser
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

from flask import Flask, request, jsonify, send_from_directory, render_template
from PIL import Image

SOURCE_FOLDER = os.environ.get('SOURCE_FOLDER', '')
SUPPORTED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.dng', '.insp'}

app = Flask(__name__)


def get_paths():
    tb = Path(SOURCE_FOLDER) / '_TOUR_BUILDER'
    return {
        'tour_builder': tb,
        'app':          tb / 'app',
        'thumbnails':   tb / 'app' / 'thumbnails',
        'input_index':  tb / 'input_index',
        'ordered_images': tb / 'ordered_images',
        'exports':      tb / 'exports',
        'backups':      tb / 'backups',
        'project_json': tb / 'exports' / 'tour_project.json',
        'report':       tb / 'processing_report.txt',
    }


def ensure_dirs():
    paths = get_paths()
    for key, path in paths.items():
        if key not in ('project_json', 'report'):
            path.mkdir(parents=True, exist_ok=True)


def index_images():
    source = Path(SOURCE_FOLDER)
    images = []
    seen = set()
    duplicates = []
    for f in sorted(source.iterdir()):
        if f.suffix.lower() in SUPPORTED_EXTENSIONS and f.is_file():
            if f.name in seen:
                duplicates.append(f.name)
            else:
                seen.add(f.name)
                images.append(f)
    return images, duplicates


def is_equirectangular(img_path):
    try:
        with Image.open(img_path) as img:
            w, h = img.size
            return h > 0 and abs(w / h - 2.0) < 0.15
    except Exception:
        return False


def create_thumbnail(source_path, thumb_path, size=(320, 160)):
    try:
        with Image.open(source_path) as img:
            if img.mode in ('RGBA', 'P', 'CMYK'):
                img = img.convert('RGB')
            img.thumbnail(size, Image.LANCZOS)
            img.save(thumb_path, 'JPEG', quality=80)
        return True
    except Exception as e:
        print(f"  [AVISO] Thumbnail falhou para {source_path.name}: {e}")
        return False


def write_report(images, duplicates, non_equirect):
    paths = get_paths()
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    lines = [
        "RELATÓRIO DE PROCESSAMENTO",
        f"Gerado em: {now}",
        f"Pasta fonte: {SOURCE_FOLDER}",
        "",
        f"TOTAL DE IMAGENS ENCONTRADAS : {len(images)}",
        f"FICHEIROS DUPLICADOS         : {len(duplicates)}",
        f"IMAGENS NÃO EQUIRETANGULARES : {len(non_equirect)}",
        "",
    ]
    if duplicates:
        lines += ["DUPLICADOS:", *[f"  - {d}" for d in duplicates], ""]
    if non_equirect:
        lines += ["NÃO EQUIRETANGULARES (aviso, não bloqueante):",
                  *[f"  - {i}" for i in non_equirect], ""]
    lines += ["IMAGENS INDEXADAS:", *[f"  - {i}" for i in images]]
    paths['report'].write_text("\n".join(lines), encoding='utf-8')


# ── API ────────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/config')
def api_config():
    return jsonify({
        'source_folder': SOURCE_FOLDER,
        'project_name':  Path(SOURCE_FOLDER).name,
    })


@app.route('/api/images')
def api_images():
    if not SOURCE_FOLDER:
        return jsonify({'error': 'SOURCE_FOLDER não configurado.'}), 400

    images, duplicates = index_images()

    if not images:
        return jsonify({
            'error': 'Nenhuma imagem encontrada na pasta.',
            'images': [], 'duplicates': [],
        }), 404

    ensure_dirs()
    paths = get_paths()
    result = []
    non_equirect = []

    for img_path in images:
        thumb_name = img_path.stem + '_thumb.jpg'
        thumb_path = paths['thumbnails'] / thumb_name
        if not thumb_path.exists():
            create_thumbnail(img_path, thumb_path)

        eq = is_equirectangular(img_path)
        if not eq:
            non_equirect.append(img_path.name)

        try:
            with Image.open(img_path) as img:
                w, h = img.size
        except Exception:
            w, h = 0, 0

        result.append({
            'filename':          img_path.name,
            'stem':              img_path.stem,
            'extension':         img_path.suffix.lower(),
            'size':              img_path.stat().st_size,
            'width':             w,
            'height':            h,
            'is_equirectangular': eq,
            'thumbnail':         f'/api/thumbnail/{thumb_name}',
        })

    write_report([img.name for img in images], duplicates, non_equirect)

    return jsonify({
        'images':             result,
        'duplicates':         duplicates,
        'non_equirectangular': non_equirect,
        'total':              len(result),
    })


@app.route('/api/thumbnail/<path:filename>')
def serve_thumbnail(filename):
    paths = get_paths()
    return send_from_directory(str(paths['thumbnails']), filename)


@app.route('/api/source/<path:filename>')
def serve_source(filename):
    return send_from_directory(SOURCE_FOLDER, filename)


@app.route('/api/project', methods=['GET'])
def get_project():
    paths = get_paths()
    if paths['project_json'].exists():
        return jsonify(json.loads(paths['project_json'].read_text(encoding='utf-8')))
    return jsonify({})


@app.route('/api/project', methods=['POST'])
def save_project():
    ensure_dirs()
    paths = get_paths()
    data = request.get_json()
    data['updated_at'] = datetime.datetime.now().isoformat()

    if paths['project_json'].exists():
        stamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        shutil.copy2(paths['project_json'],
                     paths['backups'] / f'tour_project_{stamp}.json')

    paths['project_json'].write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    return jsonify({'success': True, 'message': 'Projeto guardado com sucesso.'})


@app.route('/api/export/xml', methods=['POST'])
def export_xml():
    ensure_dirs()
    paths = get_paths()

    if not paths['project_json'].exists():
        return jsonify({'error': 'Guarda o projeto primeiro.'}), 400

    data = json.loads(paths['project_json'].read_text(encoding='utf-8'))

    root = Element('virtualTour')
    meta = SubElement(root, 'metadata')
    SubElement(meta, 'projectName').text  = data.get('project_name', '')
    SubElement(meta, 'sourceFolder').text = data.get('source_folder', '')
    SubElement(meta, 'createdAt').text    = data.get('created_at', '')
    SubElement(meta, 'updatedAt').text    = data.get('updated_at', '')

    rooms_el = SubElement(root, 'rooms')
    for room in sorted(data.get('rooms', []), key=lambda r: r.get('order', 0)):
        re = SubElement(rooms_el, 'room',
                        id=str(room.get('id', '')),
                        order=str(room.get('order', '')))
        SubElement(re, 'title').text        = room.get('title', '')
        SubElement(re, 'floor').text        = room.get('floor', '')
        SubElement(re, 'description').text  = room.get('description', '')
        SubElement(re, 'image').text        = room.get('exported_filename', room.get('original_filename', ''))
        conns_el = SubElement(re, 'connections')
        for c in room.get('connections', []):
            SubElement(conns_el, 'connection',
                       target=c.get('target_room_id', ''),
                       label=c.get('label', ''),
                       directionHint=c.get('direction_hint', ''))

    raw = tostring(root, encoding='unicode')
    pretty = minidom.parseString(raw).toprettyxml(indent='  ')
    lines = pretty.split('\n')
    lines[0] = '<?xml version="1.0" encoding="UTF-8"?>'
    xml_str = '\n'.join(lines)

    xml_path = paths['exports'] / 'tour_export.xml'
    xml_path.write_text(xml_str, encoding='utf-8')
    return jsonify({'success': True, 'path': str(xml_path)})


@app.route('/api/export/package', methods=['POST'])
def export_package():
    ensure_dirs()
    paths = get_paths()

    if not paths['project_json'].exists():
        return jsonify({'error': 'Guarda o projeto primeiro.'}), 400

    data  = json.loads(paths['project_json'].read_text(encoding='utf-8'))
    rooms = sorted(data.get('rooms', []), key=lambda r: r.get('order', 0))

    if not rooms:
        return jsonify({'error': 'Sem divisões definidas.'}), 400

    # limpa destino
    for f in paths['ordered_images'].iterdir():
        if f.is_file():
            f.unlink()

    copied = []
    errors = []

    for room in rooms:
        src = Path(SOURCE_FOLDER) / room['original_filename']
        if not src.exists():
            errors.append(f"Não encontrado: {room['original_filename']}")
            continue
        dst_name = room.get('exported_filename') or \
                   f"{str(room.get('order', 0)).zfill(3)}_{room.get('title', 'room').lower().replace(' ', '_')}.jpg"
        dst = paths['ordered_images'] / dst_name
        try:
            with Image.open(src) as img:
                if img.mode in ('RGBA', 'P', 'CMYK'):
                    img = img.convert('RGB')
                img.save(dst, 'JPEG', quality=95)
            copied.append(dst_name)
        except Exception as e:
            errors.append(f"Erro em {room['original_filename']}: {e}")

    # README
    readme = _build_readme(data, rooms)
    (paths['exports'] / 'README_IDEALISTA.txt').write_text(readme, encoding='utf-8')

    return jsonify({
        'success': True,
        'copied':  copied,
        'errors':  errors,
        'message': f'{len(copied)} imagens exportadas, {len(errors)} erros.',
    })


def _build_readme(data, rooms):
    now   = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    lines = []
    for r in rooms:
        ef = r.get('exported_filename', '')
        t  = r.get('title', '')
        lines.append(f'   {ef}  →  {t}')
    room_list = '\n'.join(lines) if lines else '   (sem divisões)'

    return f"""README - TOUR 360 PARA IDEALISTA
Gerado em: {now}
Projeto: {data.get('project_name', '')}
{'='*50}

COMO USAR ESTE PACOTE NO IDEALISTA
{'='*50}

1. FOTOS ORDENADAS
   As imagens em /ordered_images/ estão numeradas e nomeadas:
{room_list}

2. CARREGAR NO IDEALISTA
   - Acede à ficha do imóvel no Idealista
   - Vai à secção de Fotos / Multimédia
   - Carrega as imagens por esta ordem
   - O Idealista tem um criador de tour 360 onde podes reorganizar
     e nomear cada foto manualmente dentro da plataforma.

3. REORGANIZAÇÃO MANUAL
   Embora as fotos venham ordenadas, o Idealista pode exigir
   reorganização manual dentro da plataforma deles.
   A ordem e os nomes preparados aqui servem de guia.

4. TOUR EXTERNO (se aplicável)
   Se usares uma plataforma externa de tour 360 (ex: Matterport,
   Kuula, Round.me, etc.), o link do tour deve ser colocado no
   campo "Multimedia link" / "Link de multimédia" da ficha.

5. AVISO IMPORTANTE — FORMATO XML
   O ficheiro tour_export.xml é um pacote estruturado interno
   para organização e referência futura.
   NÃO é um feed oficial Idealista nem deve ser tratado como tal,
   salvo confirmação documental ou API oficial da Idealista.
   Este XML serve para referência, backup e eventual integração.

{'='*50}
FICHEIROS NESTE PACOTE:
  /ordered_images/       → Imagens finais ordenadas e nomeadas
  tour_project.json      → Projeto completo editável
  tour_export.xml        → Estrutura XML do tour (referência interna)
  README_IDEALISTA.txt   → Este ficheiro
{'='*50}
"""


@app.route('/api/report')
def api_report():
    paths = get_paths()
    if paths['report'].exists():
        txt = paths['report'].read_text(encoding='utf-8')
        return txt, 200, {'Content-Type': 'text/plain; charset=utf-8'}
    return 'Relatório não disponível. Indexa as imagens primeiro.', 200


# ── Arranque ───────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    if not SOURCE_FOLDER:
        print("\nERRO: Define SOURCE_FOLDER antes de arrancar.")
        print("Exemplo:")
        print("  SOURCE_FOLDER='/Volumes/Extreme 2TB/Insta360 x3/2026/...' python app.py\n")
        sys.exit(1)

    source = Path(SOURCE_FOLDER)
    if not source.exists():
        print(f"\nERRO: Pasta não encontrada:\n  {SOURCE_FOLDER}\n")
        sys.exit(1)

    ensure_dirs()
    url = 'http://localhost:5050'
    print(f"\n{'='*52}")
    print("  IDEALISTA 360 TOUR BUILDER")
    print(f"{'='*52}")
    print(f"  Pasta: {SOURCE_FOLDER}")
    print(f"  URL  : {url}")
    print(f"{'='*52}\n")
    threading.Timer(1.5, lambda: webbrowser.open(url)).start()
    app.run(host='127.0.0.1', port=5050, debug=False)
