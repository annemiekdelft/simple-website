const express = require("express");
const path = require("path");

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = __dirname;
const targetApiBase = "https://uat-api.insocial.nl";
const embeddedScriptId = "019d2440-d493-7bfb-9b96-e54a6a05b7c4";

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

    if (
      upstreamResponse.ok &&
      req.params.scriptId === embeddedScriptId &&
      contentType &&
      contentType.includes("application/json")
    ) {
      const payload = JSON.parse(text);
      payload.settings = payload.settings || {};
      payload.settings.trigger = ["inject"];
      payload.settings.targetElement = "#give-feedback-block";
      delete payload.settings.customBtnSelector;
      res.send(JSON.stringify(payload));
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
