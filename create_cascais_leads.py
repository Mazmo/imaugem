#!/usr/bin/env python3
"""
Create Mais Consultores Cascais (#RealEstateCascais) leads export.

Data sources:
- Agent names confirmed from multiple Google search results linking each
  to maisconsultores.pt/agencias/realestatecascais
- Phones: only included where verified in Google-indexed public sources
  (e.g., LinkedIn page title snippets) — no inferred/hallucinated data
"""

import csv
import os
import sys

try:
    from openpyxl import Workbook
except ImportError:
    print("openpyxl not found, installing...")
    os.system(f"{sys.executable} -m pip install openpyxl --quiet")
    from openpyxl import Workbook

OUTPUT_DIR = "/home/user/imaugem"
CSV_PATH = os.path.join(OUTPUT_DIR, "mais_consultores_cascais_nome_telefone.csv")
XLSX_PATH = os.path.join(OUTPUT_DIR, "mais_consultores_cascais_nome_telefone.xlsx")

# Confirmed agents at MaisConsultores #RealEstateCascais (Cascais only)
# Phone sources:
#   Miguel Bicho: +351932530005 — verified in Google-indexed LinkedIn title snippet
#                 "Miguel Bicho - Consultor Imobiliario +351932530005"
#                 https://pt.linkedin.com/in/miguel-bicho-92478521
#   Others: phone could not be verified through any accessible source
#           (maisconsultores.pt blocked by proxy + CloudFlare, all other .pt
#            portals blocked; phone numbers on the site are behind JS
#            "Ver telefone" interactions not indexable by search engines)
AGENTS = [
    {"nome": "Miguel Bicho",     "telefone": "+351932530005"},
    {"nome": "João Vicente",     "telefone": ""},
    {"nome": "Georgina Silva",   "telefone": ""},
    {"nome": "Georgina Antigo",  "telefone": ""},
    {"nome": "Bruno Ferreira",   "telefone": ""},
    {"nome": "Veronica Iacob",   "telefone": ""},
]


def normalize_phone(phone: str) -> str:
    """Remove spaces and formatting from phone; keep country code."""
    if not phone:
        return ""
    return phone.replace(" ", "").replace("-", "").replace(".", "")


def build_rows():
    rows = []
    seen = set()
    for a in AGENTS:
        name = a["nome"].strip()
        phone = normalize_phone(a["telefone"])
        key = (name.lower(), phone)
        if key in seen:
            continue
        seen.add(key)
        rows.append({"nome": name, "telefone": phone})
    return rows


def write_csv(rows):
    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["nome", "telefone"])
        writer.writeheader()
        writer.writerows(rows)


def write_xlsx(rows):
    wb = Workbook()
    ws = wb.active
    ws.title = "Cascais Leads"
    ws.append(["nome", "telefone"])
    for r in rows:
        ws.append([r["nome"], r["telefone"]])
    wb.save(XLSX_PATH)


def validate(rows):
    errors = []
    col_names = ["nome", "telefone"]

    # Check columns
    for r in rows:
        if set(r.keys()) != set(col_names):
            errors.append(f"Wrong columns: {r.keys()}")
            break

    # Check for duplicates
    keys = [(r["nome"].lower(), r["telefone"]) for r in rows]
    if len(keys) != len(set(keys)):
        errors.append("Duplicate rows found")

    # Check phone normalization (no spaces)
    for r in rows:
        if r["telefone"] and " " in r["telefone"]:
            errors.append(f"Phone has spaces: {r['telefone']}")

    # Check all names are non-empty
    for r in rows:
        if not r["nome"]:
            errors.append("Empty name found")

    return errors


def main():
    rows = build_rows()

    errors = validate(rows)
    if errors:
        print("VALIDATION ERRORS:")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)

    write_csv(rows)
    write_xlsx(rows)

    print("=" * 60)
    print("VALIDATION PASSED")
    print(f"Columns: nome, telefone (only)")
    print(f"Source: MaisConsultores #RealEstateCascais (Cascais only)")
    print(f"Duplicates removed: yes")
    print(f"Phone normalization: spaces/dashes removed, country code kept")
    print("=" * 60)
    print(f"\nFiles created:")
    print(f"  {CSV_PATH}")
    print(f"  {XLSX_PATH}")
    print(f"\nTotal contacts: {len(rows)}")
    print(f"\nFirst {min(10, len(rows))} rows:")
    print(f"  {'nome':<25} {'telefone'}")
    print(f"  {'-'*25} {'-'*20}")
    for r in rows[:10]:
        phone_display = r["telefone"] if r["telefone"] else "(não disponível)"
        print(f"  {r['nome']:<25} {phone_display}")


if __name__ == "__main__":
    main()
