# Katys Stempelfinder – Netlify-Version

Der Startbestand enthält **165 Stempelsets mit Coverbildern**. Neue Sets und Änderungen werden nach der Veröffentlichung in **Netlify Blobs** gespeichert und erscheinen für alle Besucher derselben Netlify-Webadresse. Beim Öffnen einer Datei auf dem PC gibt es keine gemeinsame Speicherung.

## Veröffentlichung

1. ZIP entpacken. **Den Inhalt des Projektordners** in die oberste Ebene des GitHub-Repositories laden: `netlify.toml`, `package.json`, `package-lock.json`, `web/`, `netlify/`, `scripts/` und diese `README.md`. Das Repository in Netlify unter **Add new project → Import an existing project** auswählen. Als Basisverzeichnis die Repository-Wurzel verwenden. Netlify erkennt `netlify.toml`, installiert die Abhängigkeiten und baut die Seite mit `npm run build`.
2. In Netlify unter **Project configuration → Environment variables** die Variable `NETLIFY_ADMIN_PASSWORD` mit einem selbst gewählten Passwort von mindestens 12 Zeichen für die Laufzeit der Funktionen anlegen. Das Passwort gehört **nicht** in `netlify.toml` und **nicht** in das Git-Repository.
3. Die Seite erneut veröffentlichen, falls die Umgebungsvariable erst nach der ersten Veröffentlichung angelegt wurde. Danach die Netlify-Adresse mit den Personen teilen, die den Bestand sehen sollen.

Alternativ im entpackten Ordner mit installiertem Node.js 22+ und Netlify CLI: `npm ci`, `npx netlify-cli login`, `npx netlify-cli init` und `npx netlify-cli deploy --prod --build`. Die Umgebungsvariable zuvor in der Netlify-Oberfläche setzen. **Eine fertige HTML-Datei per Drag-and-drop hochzuladen genügt nicht:** Die Serverfunktionen und die gemeinsame Bildablage benötigen den Projekt-Build.

## Benutzung

- Jeder mit der Webadresse kann Stempelsets und Cover ansehen und suchen.
- Für **Set hinzufügen** ist das Admin-Passwort nötig. Es bleibt nur während der Eingabe im Browser und wird nicht im Browser-Speicher abgelegt. Gib es nur Personen, die selbst Sets hinzufügen dürfen.
- Jedes Set kann mit Admin-Passwort bearbeitet oder gelöscht werden. Bei den 165 mitgelieferten Sets bleiben die Dateien im Git-Repository; Änderungen und Löschvermerke werden in Netlify Blobs gespeichert und für alle Besucher angewendet.
- Das Foto kann direkt aufgenommen werden. Große Fotos werden vor dem Hochladen verkleinert; die Bilddatei wird in Netlify Blobs gespeichert. Wenn die Texterkennung im Browser verfügbar ist, schlägt sie Artikelnummer und Set-Namen vor. Bitte die Vorschläge prüfen.
- Bei einer Artikelnummer kann der Name auf der Herstellerseite gesucht werden. Nicht mehr angebotene Sets lassen sich mit einem eigenen Coverfoto und manuell eingetragenen Angaben erfassen.
- Die Karten aktualisieren sich alle 30 Sekunden und sofort nach einem erfolgreichen Speichern.

## Hinweise

- Die Netlify-Version und eine andere veröffentlichte Version haben **getrennte** Speicher. Neue Einträge auf einer der beiden Seiten erscheinen nicht automatisch auf der anderen. Dieses ZIP bringt die 165 Ausgangssets mit. Bereits online in Netlify Blobs gespeicherte Sets werden beim bloßen GitHub-Import nicht automatisch in das neue Netlify-Projekt übertragen.
- Netlify Functions haben eine Größenbegrenzung für Uploads; Bilder werden hier auf höchstens 2 MB begrenzt. Die Originalfotos werden nicht dauerhaft auf dem Endgerät **durch diese Anwendung** gespeichert. Für die Anzeige müssen Browser Bilddaten vorübergehend empfangen; Cache-Header sind auf `no-store` gesetzt.
- Netlify Blobs gehören zur jeweiligen Netlify-Site und überstehen neue Veröffentlichungen derselben Site. Ein komplett neues Netlify-Projekt besitzt einen eigenen, zunächst leeren Speicher für spätere Einträge.
- Für die automatische Fotoerkennung wird Tesseract.js über ein CDN geladen. Wenn dieses nicht erreichbar ist, funktioniert die manuelle Erfassung weiterhin.
