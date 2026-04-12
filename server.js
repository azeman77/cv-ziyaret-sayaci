// Bu projedeki tüm dosyalar ödev gereği Türkçe hazırlanmıştır.

const http = require("http");
const fs = require("fs");
const path = require("path");

const { trackView, getStats } = require("./analytics");

const PORT = Number(process.env.PORT) || 3000;
const cvPath = path.join(__dirname, "cv.html");

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

function sendHtml(res, html, extraHeaders = {}) {
  send(res, 200, { "Content-Type": "text/html; charset=utf-8", ...extraHeaders }, html);
}

function notFound(res) {
  send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "404 - Bulunamadı");
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Serve Static Files (CSS, JS)
  if (pathname.endsWith(".css") || pathname.endsWith(".js")) {
    const filePath = path.join(__dirname, pathname);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(pathname);
      const mimeTypes = {
        ".css": "text/css",
        ".js": "application/javascript"
      };
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
      return res.end(fs.readFileSync(filePath));
    }
  }

  // Dashboard (Root)
  if (pathname === "/") {
    const dashboardPath = path.join(__dirname, "index.html");
    if (fs.existsSync(dashboardPath)) {
      return sendHtml(res, fs.readFileSync(dashboardPath, "utf8"));
    }
  }

  // CV Page
  if (pathname === "/cv" || pathname === "/cv.html") {
    const track = trackView({ cookieHeader: req.headers.cookie, pathName: pathname });

    let html = "";
    try {
      html = fs.readFileSync(cvPath, "utf8");
    } catch {
      return send(res, 500, { "Content-Type": "text/plain; charset=utf-8" }, "cv.html okunamadı");
    }

    const nav = `\n<hr />\n<p><a href="/stats">Görüntüleme İstatistikleri</a> | <a href="/">Görev Paneli</a></p>\n`;
    if (html.includes("</body>")) {
      html = html.replace("</body>", `${nav}</body>`);
    } else {
      html += nav;
    }

    const headers = {};
    if (track.setCookieHeader) headers["Set-Cookie"] = track.setCookieHeader;

    return sendHtml(res, html, headers);
  }

  if (pathname === "/stats") {
    const stats = getStats();
    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>İstatistikler</title>
</head>
<body>
  <header>
    <h1>Görüntüleme İstatistikleri</h1>
    <p><a href="/cv">CV Sayfasına Dön</a> | <a href="/">Görev Paneli</a></p>
    <hr />
  </header>

  <main>
    <section>
      <h2>Sonuçlar</h2>
      <ul>
        <li><strong>Toplam görüntüleme:</strong> ${stats.totalViews}</li>
        <li><strong>Farklı kişi (unique):</strong> ${stats.uniqueViews}</li>
      </ul>
    </section>

    <section>
      <h2>Açıklama</h2>
      <p>
        Bu ödevde “farklı kişi” sayımı tarayıcıya bırakılan <em>cookie</em> ile yapılır.
        Aynı kişi sayfayı tekrar açsa bile cookie durduğu sürece unique sayısı artmaz.
      </p>
    </section>
  </main>

  <footer>
    <hr />
    <p><small>Son güncelleme: 15 Mart 2026</small></p>
  </footer>
</body>
</html>`;

    return sendHtml(res, html);
  }

  return notFound(res);
});

server.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}/`);
  console.log(`CV: http://localhost:${PORT}/cv`);
});
