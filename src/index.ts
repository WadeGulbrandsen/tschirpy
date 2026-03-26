import express from "express";
import { handlerMetrics, handlerReadiness, handlerReset } from "./handlers.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});