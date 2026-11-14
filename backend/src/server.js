import app from "./app.js";
import config from "./config/env.js";

const server = app.listen(config.port, () => {
  console.log(`EventFlow API server running on port ${config.port} in ${config.nodeEnv} mode`);
});

const handleShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down EventFlow server gracefully...`);
  server.close(() => {
    console.log("EventFlow HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

export default server;
