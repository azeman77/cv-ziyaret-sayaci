const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dataFile = path.join(__dirname, "analytics.json");

const VIEW_COOLDOWN_MS = 10 * 60 * 1000;

function readJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const txt = fs.readFileSync(filePath, "utf8");
    return JSON.parse(txt || "{}") || fallback;
  } catch {
    return fallback;
  }
}

function writeJsonSafe(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), "utf8");
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  cookieHeader.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function newId() {
  return crypto.randomBytes(16).toString("hex");
}

function trackView({ cookieHeader, pathName }) {
  const db = readJsonSafe(dataFile, { totalViews: 0, uniqueViews: 0, visitors: {} });
  if (!db.visitors) db.visitors = {};

  const cookies = parseCookies(cookieHeader);
  let vid = cookies.cv_vid;
  let isNewVisitor = false;

  if (!vid || typeof vid !== "string" || vid.length < 8) {
    vid = newId();
    isNewVisitor = true;
  }

  const now = Date.now();

  if (isNewVisitor && !db.visitors[vid]) {
    db.visitors[vid] = { firstSeenAt: new Date().toISOString(), lastCountedAt: 0 };
    db.uniqueViews += 1;
  }

  if (!db.visitors[vid]) {
    db.visitors[vid] = { firstSeenAt: new Date().toISOString(), lastCountedAt: 0 };
  }

  const last = Number(db.visitors[vid].lastCountedAt || 0);
  const canCount = now - last >= VIEW_COOLDOWN_MS;

  if (canCount && (pathName === "/cv" || pathName === "/" || pathName === "/cv.html")) {
    db.totalViews += 1;
    db.visitors[vid].lastCountedAt = now;
  }

  writeJsonSafe(dataFile, db);

  return {
    visitorId: vid,
    setCookieHeader: isNewVisitor
      ? `cv_vid=${encodeURIComponent(vid)}; Path=/; Max-Age=31536000; SameSite=Lax`
      : null,
    stats: {
      totalViews: db.totalViews,
      uniqueViews: db.uniqueViews,
    },
  };
}

function getStats() {
  const db = readJsonSafe(dataFile, { totalViews: 0, uniqueViews: 0, visitors: {} });
  const unique = typeof db.uniqueViews === "number" ? db.uniqueViews : Object.keys(db.visitors || {}).length;
  const total = typeof db.totalViews === "number" ? db.totalViews : 0;
  return { totalViews: total, uniqueViews: unique };
}

module.exports = { trackView, getStats };
