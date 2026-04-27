#!/usr/bin/env python3
"""Servidor local de captação de leads. Sem dependências externas — apenas stdlib Python 3."""

import csv
import json
import os
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

PORT = 8000
CSV_FILE = Path(__file__).parent / 'leads.csv'


def ensure_csv():
    if not CSV_FILE.exists():
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
            csv.writer(f).writerow(['nome', 'telefone', 'data'])


def save_lead(nome: str, telefone: str):
    with open(CSV_FILE, 'a', newline='', encoding='utf-8') as f:
        csv.writer(f).writerow([nome, telefone, datetime.now().strftime('%Y-%m-%d %H:%M')])


class Handler(SimpleHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def do_POST(self):
        if self.path != '/submit':
            self.send_error(404)
            return

        length = int(self.headers.get('Content-Length', 0))
        try:
            data = json.loads(self.rfile.read(length))
        except (json.JSONDecodeError, ValueError):
            self._json(400, {'error': 'JSON inválido'})
            return

        nome = str(data.get('nome', '')).strip()
        telefone = str(data.get('telefone', '')).strip()

        if not nome or not telefone:
            self._json(400, {'error': 'Campos obrigatórios em falta'})
            return

        save_lead(nome, telefone)
        print(f'[+] Lead: {nome}  |  {telefone}')
        self._json(200, {'ok': True})

    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _json(self, code, payload):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self._cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        pass  # silencia logs HTTP por omissão


if __name__ == '__main__':
    ensure_csv()
    os.chdir(Path(__file__).parent)

    server = HTTPServer(('', PORT), Handler)
    print(f'\n  Servidor em execução → http://localhost:{PORT}\n')
    print('  Ctrl+C para parar.\n')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  Servidor parado.')
