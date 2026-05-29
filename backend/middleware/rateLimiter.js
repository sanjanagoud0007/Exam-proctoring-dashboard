const windowMs = 15 * 60 * 1000;
const max = 300;

const hits = new Map();

const cleanup = () => {
  const now = Date.now();
  for (const [key, entry] of hits.entries()) {
    if (now - entry.start > windowMs) hits.delete(key);
  }
};

setInterval(cleanup, 60 * 1000).unref?.();

export const rateLimiter = (req, res, next) => {
  const key = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  let entry = hits.get(key);

  if (!entry || now - entry.start > windowMs) {
    entry = { start: now, count: 0 };
    hits.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > max) {
    return res.status(429).json({
      message: "Too many requests. Please try again later.",
    });
  }

  next();
};
