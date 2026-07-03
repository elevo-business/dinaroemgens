# Auto-Deploy (GitHub → Coolify)

Ziel: Jeder Push auf den `main`-Branch deployt die Website automatisch über Coolify —
kein manuelles „Redeploy" mehr. Ideal, damit Dina die Seite aus ihrem Claude Code
bearbeiten kann und die Änderungen sofort live gehen.

Es gibt zwei Wege. **Weg A** (GitHub Actions) ist bereits im Repo vorbereitet und
funktioniert unabhängig davon, wie die Coolify-App angebunden ist. **Weg B** ist
Coolify-nativ und noch einfacher, falls die GitHub-App in Coolify verbunden ist.

---

## Weg A — GitHub Actions (im Repo bereits eingerichtet)

Die Datei `.github/workflows/deploy.yml` ruft bei jedem Push auf `main` das
Coolify-Deploy-API auf. Es fehlen nur noch **zwei Secrets** (Tokens gehören aus
Sicherheitsgründen nicht ins Repo):

### 1. Coolify API-Token erstellen
Coolify → linkes Menü **Keys & Tokens** → **API tokens** → *Create New Token*
(Berechtigung: Deploy / read+write). Token kopieren.

### 2. Secrets in GitHub hinterlegen
GitHub-Repo **elevo-business/dinaroemgens** → **Settings** →
**Secrets and variables** → **Actions** → *New repository secret*:

| Name            | Wert (Beispiel)                          |
|-----------------|------------------------------------------|
| `COOLIFY_URL`   | `https://coolify.deine-domain.tld` (ohne `/` am Ende) |
| `COOLIFY_TOKEN` | *(das eben erstellte API-Token)*         |

Die **App-UUID** ist bereits im Workflow vorbelegt (`twxo2a3mbh47r5pwim0xzf5c`,
aus dem letzten Deploy-Log). Falls sie abweicht: in Coolify die App öffnen und die
UUID aus der Browser-URL (`…/application/<UUID>`) nehmen und als **Variable**
`COOLIFY_APP_UUID` hinterlegen (Reiter *Variables* statt *Secrets*).

### 3. Fertig
Ab jetzt: Push auf `main` → Actions-Tab zeigt „Deploy to Coolify" grün → Coolify baut
neu (nginx-Container aus dem `Dockerfile`) und veröffentlicht.
Solange die Secrets fehlen, läuft der Workflow grün durch und überspringt den Deploy
(kein roter Fehler).

> Hinweis: In Coolify muss unter der App **Settings → „Auto Deploy"** nicht zwingend
> aktiv sein — der API-Aufruf löst den Deploy direkt aus.

---

## Weg B — Coolify-nativer Webhook (ohne GitHub Action)

Falls die App in Coolify über die **GitHub-App** verbunden ist:

1. Coolify → App → **Settings** → **Auto Deploy** aktivieren.
2. Coolify registriert dann automatisch einen Webhook im Repo; jeder Push auf den
   konfigurierten Branch (`main`) deployt automatisch.

Falls die App über *Public Repository* / Deploy-Key läuft:

1. Coolify → App → Reiter **Webhooks** → die **Deploy-Webhook-URL** kopieren.
2. GitHub-Repo → **Settings** → **Webhooks** → *Add webhook* → URL einfügen,
   Content-Type `application/json`, Event „Just the push event".

Wird Weg B genutzt, kann `.github/workflows/deploy.yml` gelöscht werden (oder bleibt
als Backup liegen — er überspringt sich selbst, wenn keine Secrets gesetzt sind).

---

## Dinas Arbeitsablauf danach

1. Änderung in ihrem Claude Code / lokal machen.
2. Nach `main` pushen (`git push origin main`).
3. Automatischer Deploy → nach ~1–2 Min ist die Seite aktualisiert.

Cache-Hinweis: CSS/JS werden mit `?v=…` versioniert. Bei Design-Änderungen die
Versionsnummer in den HTML-Dateien hochzählen, dann sehen Besucher sofort die neue
Version (kein Browser-Cache).
