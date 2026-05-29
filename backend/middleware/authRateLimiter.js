const windowMs = 15 * 60 * 1000;
const maxAttempts = 15;

const hits = new Map();

export const authRateLimiter = (req, res, next) => {
  const key = `${req.ip || "unknown"}:${req.path}`;
  const now = Date.now();
  let entry = hits.get(key);

  if (!entry || now - entry.start > windowMs) {
    entry = { start: now, count: 0 };
    hits.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > maxAttempts) {
    return res.status(429).json({
      message: "Too many attempts. Wait 15 minutes and try again.",
    });
  }

  next();
};
