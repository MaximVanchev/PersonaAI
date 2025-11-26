const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// Environment configuration
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Graceful shutdown handling
let server;

const gracefulShutdown = (signal) => {
  console.log(
    `\n${new Date().toISOString()} - Received ${signal}. Starting graceful shutdown...`
  );

  if (server) {
    server.close((err) => {
      if (err) {
        console.error(
          `${new Date().toISOString()} - Error during server shutdown:`,
          err
        );
        process.exit(1);
      }

      console.log(`${new Date().toISOString()} - Server closed successfully`);
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.log(`${new Date().toISOString()} - Forcing server shutdown`);
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle process signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`${new Date().toISOString()} - Uncaught Exception:`, err);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(
    `${new Date().toISOString()} - Unhandled Rejection at:`,
    promise,
    "reason:",
    reason
  );
  gracefulShutdown("unhandledRejection");
});

// Start the server
app
  .prepare()
  .then(() => {
    server = createServer(async (req, res) => {
      try {
        // Parse the URL
        const parsedUrl = parse(req.url, true);

        // Log requests in production for monitoring
        if (!dev) {
          const timestamp = new Date().toISOString();
          const userAgent = req.headers["user-agent"] || "unknown";
          const clientIP =
            req.headers["x-forwarded-for"] || req.connection.remoteAddress;
          console.log(
            `${timestamp} - ${req.method} ${req.url} - IP: ${clientIP} - UA: ${userAgent}`
          );
        }

        // Handle the request with Next.js
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error(
          `${new Date().toISOString()} - Error handling request:`,
          err
        );
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });

    server.listen(port, (err) => {
      if (err) {
        console.error(
          `${new Date().toISOString()} - Failed to start server:`,
          err
        );
        process.exit(1);
      }

      const timestamp = new Date().toISOString();
      console.log(`${timestamp} - 🚀 PersonaAI server ready!`);
      console.log(
        `${timestamp} - Environment: ${dev ? "development" : "production"}`
      );
      console.log(`${timestamp} - URL: http://${hostname}:${port}`);
      console.log(`${timestamp} - Process ID: ${process.pid}`);

      // Health check endpoint info
      console.log(
        `${timestamp} - Health check available at: http://${hostname}:${port}/api/health`
      );
    });

    // Set server timeout
    server.timeout = 30000; // 30 seconds
    server.keepAliveTimeout = 65000; // 65 seconds
    server.headersTimeout = 66000; // 66 seconds
  })
  .catch((ex) => {
    console.error(
      `${new Date().toISOString()} - Failed to prepare Next.js app:`,
      ex
    );
    process.exit(1);
  });

// Export server for testing purposes
module.exports = { server, gracefulShutdown };
