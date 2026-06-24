# kai_data_geolake

bachelorprosjekt 2025

"KAI-data": Geografisk data og utveksling med Delta Lake og Delta Sharing

Denne readme er generert med chatgpt.

## 📘 Geodata-analyse med GeoPandas, DuckDB og Databricks

Dette prosjektet består av Jupyter Notebooks utviklet for behandling, filtrering og visualisering av geografiske data (AR50 og AIS). Verktøyene tar i bruk ulike teknologier som GeoPandas, DuckDB og Apache Spark (Databricks).

---

### 📂 Innhold

| Notebook | Datasett |
|----------|-----------|
| `u1_geopandas.ipynb`, `u2_geopandas.ipynb`, `DuckDB.ipynb` `Databricks.ipynb`, `Setup_AIS_Databricks.ipynb` | AIS |
| `Geopandas.ipynb`, `DuckDB.ipynb` `Databricks.ipynb`, `Setup_AR50_Databricks.ipynb` | AR50 | Spatial spørring og simulert strømming av AR50-data |


---

## 🚀 Kom i gang

### 📦 Avhengigheter

Installer nødvendige pakker for lokal kjøring:

```bash
pip install requirements.txt
```

Databricks-miljø krever:
- Apache Spark
- Sedona for geodata
- DASK-governance-modul (ved behov)

---

### 🗂️ Kjøring av notatbøker

1. Last opp nødvendige filer i mappen `data/raw`
2. Kjør alle celler i rekkefølge
3. Resultater og visualiseringer lagres i `data/processed` eller vises i kart/Tabell

---

## ✅ Brukerhistorier

Er beskrevet i alle notebookene.

---

## 📊 Visualisering

Verktøyene inkluderer interaktive kart (Folium) og widgets for brukervennlig datatilgang og filtrering.

---

## 📄 Lisens

Dette prosjektet er utviklet som del av et bachelorprosjekt og distribueres for utdanningsformål.
