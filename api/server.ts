import express, { Request, Response } from "express";
import client from "prom-client";

const collectDefaultMetrics = client.collectDefaultMetrics;
const register = new client.Registry();
collectDefaultMetrics({ register });

const counter = new client.Counter({
  name: "advice",
  help: "new_advice_receive",
  labelNames: ["method", "scheme"] as const,
  registers: [register],
});

const app = express();
const port = 3001;

app.get("/", (request: Request, response: Response) => {
  counter.inc({ method: "purchase", scheme: "mc" });
  counter.inc({ method: "void", scheme: "visa" });
  counter.inc({ method: "void", scheme: "mc" });

  response.json({ hello: "world" });
});

app.get("/metrics", async (request: Request, response: Response) => {
  try {
    response.set("Content-Type", register.contentType);
    response.end(await register.metrics());
  } catch (ex) {
    response.status(500).end(ex);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
