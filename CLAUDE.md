# CLAUDE.md — Apollo Cars Hagenow (Website)

> Arbeits- und Projektdokumentation für Claude Code. **Diese Datei bei jeder inhaltlichen
> Änderung (Struktur, Inhalte, Tech-Stack, Deploy, offene Punkte) im selben Zug aktualisieren
> und mit committen.** Stand unten im Abschnitt „Änderungsprotokoll" pflegen.

## 1. Überblick

- **Kunde:** Apollo Cars Hagenow · Inhaber: Maik Mohamed Atta
- **Was:** moderne, mobil-first **statische One-Pager-Website** mit drei Geschäftsbereichen:
  1. **KFZ-Werkstatt** (Meisterbetrieb)
  2. **Vermietung** (PKW, Transporter, Quad)
  3. **Baumaschinenservice**
- **Ziel:** Zusammenführung der bisher getrennten Bereiche unter **einer** Domain
  `www.apollocars.de`, kostenlos & wartungsarm über GitHub Pages gehostet.
- **Betreuung:** Benn Neujahr (Zukunft mit KI).

## 2. Tech-Stack & harte Vorgaben

- **Reines statisches HTML + CSS**, etwas Vanilla-JS (Burger-Menü, aktiver Nav-Zustand,
  Footer-Jahr). **Kein** Build-Tool, **kein** Framework, **kein** npm.
- **`index.html` liegt im Repo-Root** (Startseite des One-Pagers).
- **Schriften self-hosted** (DSGVO-konform, kein Google-CDN): Oswald (Headlines) + Inter
  (Fließtext) als `.woff2` in `assets/fonts/`, eingebunden per `@font-face` in `style.css`.
- **Relative Pfade** für alle Assets (`assets/...`) — funktioniert auf Root- und Subpfad.
- **Mobile-first**, Breakpoints 600 / 900 / 1000–1200 px. Bilder `loading="lazy"`.
- **Barrierefreiheit:** semantisches HTML5, genau **eine `<h1>`**, `alt`-Texte, sichtbarer
  Fokus, ausreichende Kontraste, `prefers-reduced-motion` respektiert.
- **SEO:** Title/Description, Open Graph, `LocalBusiness`-JSON-LD, `robots.txt`, Favicons.

## 3. Projektstruktur (veröffentlicht)

```
/index.html              One-Pager (alle Sektionen)
/impressum.html          Rechtsseite (Platzhalter, rechtlich zu prüfen)
/datenschutz.html        Rechtsseite (Platzhalter, rechtlich zu prüfen)
/CNAME                   www.apollocars.de  (Custom Domain für Pages)
/.nojekyll               verhindert Jekyll-Verarbeitung
/robots.txt
/CLAUDE.md               diese Datei
/assets/css/style.css    gesamtes CSS (Design-Tokens als CSS-Variablen)
/assets/js/main.js       Burger-Menü, Smooth-Scroll-Offset, aktive Nav, Footer-Jahr
/assets/img/             logo-header.png (transparent), logo-full.jpg (og:image),
                         favicon.png, apple-touch-icon.png
/assets/img/vermietung/  5 Fahrzeug-Titelbilder (siehe Abschnitt 5)
/assets/fonts/           oswald-600/700, inter-400/500/700 (.woff2)
```

**Nicht veröffentlicht** (lokal vorhanden, via `.gitignore` ausgeschlossen):
`assets/Recherche Apollo Cars/` (Kleinanzeigen-Quelldaten + Originalbilder — **enthält die
Steuernummer, daher NICHT publizieren**), `Projektplan_…md`, `Claude_Code_Prompt_…md`,
`Logo Apollo Cars.jpeg`, `.DS_Store`.

## 4. Branding (aus dem Logo abgeleitet)

CSS-Variablen in `assets/css/style.css` (`:root`):

| Token | Wert | Einsatz |
|---|---|---|
| `--red` | `#D81F26` | Akzente, Buttons, Linien |
| `--red-bright` | `#ED1C24` | Verläufe (Logo-Oberkante) |
| `--black` / `--anthracite` | `#0E0E0E` / `#1A1A1A` | Header, Hero, Footer, dunkle Karten |
| `--white` | `#FFFFFF` | Text auf Dunkel |
| `--silver` | `#C9CDD2` | Sekundär-Text, Sub-Headlines |
| `--light` | `#F4F5F6` | helle Sektions-Flächen |

- Schrift: `--font-head` = Oswald, `--font-body` = Inter (mit System-Fallback).
- Stil: abwechselnd dunkle/helle Sektionen, rote Akzentlinie über Sektions-Titeln.
- Header-Logo: transparenter Crop der Wortmarke (rote Punkte in „AP•LLO / C•RS" erhalten).

## 5. Inhalte je Sektion

- **Hero / Werkstatt / „Warum wir?":** finale Texte (1:1 aus Auftrag), 8 Leistungs-Karten,
  4 Vertrauens-Argumente. **Fertig.**
- **Vermietung:** 5 **echte** Fahrzeuge mit Fotos & Preisen (Quelle: Kleinanzeigen-Bestand,
  Profil „Apollo Cars", userId 51517725 — Rohdaten im Recherche-Ordner). Bilder unter
  `assets/img/vermietung/`, Titelbild = jeweils `01.jpg` der Anzeige (unkomprimiert kopiert):

  | Fahrzeug | Badge | Preis (ab) | Bilddatei |
  |---|---|---|---|
  | Seat Leon Kombi | PKW | 44 €/Tag (200 km) | `seat-leon-kombi.jpg` |
  | Mercedes V-Klasse, 8-Sitzer | 8-Sitzer | 120 €/Tag (200 km) | `mercedes-v-klasse.jpg` |
  | Mercedes Sprinter 214 CDI | Transporter | 70 €/Tag (200 km) | `mercedes-sprinter.jpg` |
  | Mercedes Koffer-Transporter | Transporter | 82 €/Tag (200 km) | `mercedes-transporter-koffer.jpg` |
  | CFMoto 850 Quad (4x4) | Quad | 100 €/Tag (150 km) | `cfmoto-850-quad.jpg` |

  Karten-Layout: `.rent-grid` (1→2→3 Spalten), `.rent-media` Seitenverhältnis 4/5,
  `object-fit:cover`. Preis-Hinweiszeile (`.rent-note`) unter dem Raster.
- **Baumaschinenservice:** weiterhin **Platzhalter** (`[Leistung 1–4]` + Foto-Plätze) —
  noch keine echten Inhalte geliefert.
- **Kontakt:** Adresse, `tel:`/`mailto:`, Öffnungszeiten, mailto-Formular (kein Backend).

## 6. Kontaktdaten (überall identisch)

- Adresse: Rudolf-Diesel-Straße 8, 19230 Hagenow
- Telefon: **+49 1520 4156629** → Link `tel:+4915204156629`
- E-Mail: **info@apollocars.de** → `mailto:info@apollocars.de`  ⚠️ siehe offener Punkt
- Öffnungszeiten: Montag–Samstag, 07:00–18:00 Uhr

## 7. Hosting & Deployment

- **Repo:** `github.com/bennneujahr/apollo-cars-hagenow` (public). GitHub-User **bennneujahr**.
- **GitHub Pages:** aktiviert, Source `main` / `/ (root)`, Build erfolgreich.
- **Custom Domain:** `www.apollocars.de` (aus `CNAME` automatisch übernommen).
- **DNS bei IONOS** (stellt der Kunde um — damit geht die Seite live):
  ```
  CNAME  www  → bennneujahr.github.io
  A      @    → 185.199.108.153 / .109.153 / .110.153 / .111.153
  ```
  Alte abweichende A-/CNAME-Einträge für `@`/`www` löschen.
  ⚠️ **MX / SPF / TXT unverändert lassen** (E-Mail an info@apollocars.de).
- Nach DNS-Ausbreitung: in GitHub **Settings → Pages → „Enforce HTTPS"** aktivieren.
- Hinweis: Solange DNS nicht steht, leitet `bennneujahr.github.io/apollo-cars-hagenow`
  bereits auf die (noch nicht aufgelöste) Custom Domain um → Test-URL zeigt erst nach
  DNS etwas an. Für eine Vorschau vorab könnte man die `CNAME`-Datei temporär entfernen.

### Workflow für Änderungen
1. Dateien im Root/`assets/` bearbeiten.
2. Lokal testen: `python3 -m http.server` im Projektordner → `http://localhost:8000`.
3. `git add -A && git commit && git push` → Pages baut automatisch neu (~1 Min).
4. **Diese `CLAUDE.md` mit aktualisieren** (Abschnitt 5/8 + Änderungsprotokoll).

## 8. Offene Punkte (vom Kunden zu liefern/prüfen)

- [ ] **E-Mail final bestätigen:** Seite nutzt `info@apollocars.de`; das alte Logo nannte
      `info@apollocars-werkstatt.de`. Vor Live-Gang klären.
- [ ] **Baumaschinenservice:** echte Leistungen (4) + Fotos liefern → Platzhalter ersetzen.
- [ ] **Impressum/Datenschutz:** Pflichtangaben einsetzen (USt-IdNr. falls vorhanden, Kammer,
      Berufsbezeichnung, Aufsichtsbehörde, Stand-Datum) und **rechtlich prüfen lassen**.
      Hinweis: **Steuernummer gehört NICHT ins Impressum** (nur ggf. USt-IdNr.).
- [ ] **DNS bei IONOS** umstellen + **HTTPS erzwingen** (siehe Abschnitt 7).
- [ ] Optional: echte Werkstatt-/Team-/Baumaschinen-Fotos statt CSS-Flächen.

## 9. Änderungsprotokoll

- **2026-06-18** — Vermietung mit 5 echten Fahrzeugen + Fotos gefüllt; `.gitignore` (Recherche-
  Ordner/Interna ausgeschlossen); GitHub-Repo `apollo-cars-hagenow` angelegt, gepusht, Pages
  aktiviert (Build ok); Custom Domain www.apollocars.de gesetzt. CLAUDE.md angelegt.
- **2026-06-17** — Erstaufbau: index/impressum/datenschutz, style.css, main.js, Logo-Crop,
  self-hosted Fonts, Favicons, CNAME/.nojekyll/robots.txt. Werkstatt-Inhalte final;
  Vermietung & Baumaschinen als Platzhalter.
