import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { registerRedirects } from "./redirects";
import { registerListingRedirects } from "./listing-redirect";
import { apiLimiter } from "./rate-limit";
import { serveStatic } from "./static";
import { createServer } from "http";
import { installProcessAlerts, sendAdminAlert } from "./alerts";

installProcessAlerts();

const app = express();
const httpServer = createServer(app);

// Security headers. CSP is only enforced in production — Vite dev requires
// 'unsafe-eval' and inline scripts that we don't want to allow in prod.
// Inline scripts are needed in prod for JSON-LD (SEO) and the gtag bootstrap
// in client/index.html, so script-src includes 'unsafe-inline'. Google Tag
// Manager / Analytics endpoints are explicitly allowed.
if (process.env.NODE_ENV === "production") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": [
            "'self'",
            "'unsafe-inline'",
            "https://www.googletagmanager.com",
            "https://www.google-analytics.com",
            "https://maps.googleapis.com",
            "https://maps.gstatic.com",
            "https://www.clarity.ms",
            "https://*.clarity.ms",
            "https://static.cloudflareinsights.com",
            "https://assets.calendly.com",
          ],
          "connect-src": [
            "'self'",
            "https://www.google-analytics.com",
            "https://*.supabase.co",
            "https://basemaps.cartocdn.com",
            "https://*.basemaps.cartocdn.com",
            "https://tiles.openfreemap.org",
            "https://nominatim.openstreetmap.org",
            "https://maps.googleapis.com",
            "https://places.googleapis.com",
            "https://www.clarity.ms",
            "https://*.clarity.ms",
            "https://calendly.com",
            "https://*.calendly.com",
          ],
          "worker-src": ["'self'", "blob:"],
          "img-src": ["'self'", "data:", "blob:", "https:"],
          "style-src": [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://assets.calendly.com",
          ],
          "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
          "frame-src": ["'self'", "https://calendly.com", "https://*.calendly.com"],
          "frame-ancestors": ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
} else {
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

registerRedirects(app);

// Trust Railway's reverse proxy so rate limiting keys on the real client IP
// (X-Forwarded-For) rather than every request appearing to come from the proxy.
app.set("trust proxy", 1);

app.use("/api", apiLimiter);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      // Never log response bodies for admin endpoints — they contain listing
      // data and signed URLs. Skip body logging entirely in production to avoid
      // leaking sensitive data into aggregated logs.
      const isAdmin = path.startsWith("/api/admin");
      if (capturedJsonResponse && !isAdmin && process.env.NODE_ENV !== "production") {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;

    console.error("Internal Server Error:", err);
    if (status >= 500) {
      void sendAdminAlert(`500 ${_req.method} ${_req.path}`, `Server error on ${_req.method} ${_req.path}`, String(err?.stack ?? err));
    }

    if (res.headersSent) {
      return next(err);
    }

    // Don't leak error messages to clients in production — internal errors can
    // expose stack details, library names, or query fragments. Client-facing
    // 4xx responses are constructed explicitly at the route level.
    const message =
      process.env.NODE_ENV === "production" && status >= 500
        ? "Internal Server Error"
        : err.message || "Internal Server Error";

    return res.status(status).json({ message });
  });

  // 301 retired listings to /listings before the static/SPA catch-all serves
  // their (now stale) prerendered HTML. Must come after API routes and before
  // serveStatic so it can intercept /listings/{id}-{slug} requests.
  registerListingRedirects(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "3001", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();

