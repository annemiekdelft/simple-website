const express = require("express");
const path = require("path");

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = __dirname;
const targetApiBase = "https://uat-api.insocial.nl";

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.post("/insocial-api/v2/advanced-pop-up-script/:scriptId", async (req, res) => {
  const upstreamUrl = `${targetApiBase}/v2/advanced-pop-up-script/${encodeURIComponent(req.params.scriptId)}`;

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body ?? {}),
    });

    res.status(upstreamResponse.status);

    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) {
      res.set("content-type", contentType);
    }

    const text = await upstreamResponse.text();
    if (!text) {
      res.end();
      return;
    }

    res.send(text);
  } catch (error) {
    res.status(502).json({
      error: "insocial_proxy_failed",
      message: error.message,
    });
  }
});

app.use(express.static(rootDir));

app.get("*", (_req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Simple Website listening on ${port}`);
});
