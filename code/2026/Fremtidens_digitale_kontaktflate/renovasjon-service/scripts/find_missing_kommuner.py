#!/usr/bin/env python3
"""
find_missing_kommuner.py

Fetches all current Norwegian municipalities from Kartverket and compares
against kommune_map.py. Prints missing kommunenummer with names.
"""
import sys
import os
import requests

# Allow importing kommune_map from repo root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.kommune_map import _MAP

API = "https://ws.geonorge.no/kommuneinfo/v1/kommuner"

def main():
    resp = requests.get(API, timeout=15)
    resp.raise_for_status()
    all_kommuner = resp.json()  # list of {kommunenummer, kommunenavnNorsk, ...}

    mapped = set(_MAP.keys())
    missing = [
        k for k in all_kommuner
        if k["kommunenummer"] not in mapped
    ]
    missing.sort(key=lambda k: k["kommunenummer"])

    print(f"Total municipalities from Kartverket: {len(all_kommuner)}")
    print(f"Currently mapped: {len(mapped)}")
    print(f"Missing: {len(missing)}\n")

    print("# --- Paste-ready entries (verify provider before committing) ---")
    for k in missing:
        nr = k["kommunenummer"]
        name = k["kommunenavnNorsk"]
        print(f'    "{nr}": "norkart",  # {name}  # NOTE: unverified')

if __name__ == "__main__":
    main()
