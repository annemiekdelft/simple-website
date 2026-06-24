const express = require("express");
const path = require("path");

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = __dirname;
const targetApiBase = "https://api.insocial.nl";
const insocialScriptId = "019ef977-1f10-7455-a046-7cced1c1655c";
const placementOverrides = {
  custom: {
    customBtnSelector: "#survey-custom-element",
    triggerConfig: { visible: false },
  },
  embedded: {
    trigger: ["inject"],
    targetElement: "#embedded-survey-block",
    triggerConfig: { visible: false },
  },
};

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.post("/insocial-api/v2/advanced-pop-up-script/:scriptId", async (req, res) => {
  const upstreamUrl = `${targetApiBase}/v2/advanced-pop-up-script/${encodeURIComponent(req.params.scriptId)}`;

  try {
    const upstreamBody = {
      ...(req.body ?? {}),
      isDemo: Boolean(req.body?.isDemo || req.body?.metadata?.demo),
    };

    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(upstreamBody),
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

    if (upstreamResponse.ok && req.params.scriptId === insocialScriptId && contentType && contentType.includes("application/json")) {
      const payload = JSON.parse(text);
      const placement = req.body?.metadata?.placement;
      const override = placementOverrides[placement];

      if (!override) {
        res.send(JSON.stringify(payload));
        return;
      }

      payload.id = `${payload.id}-${placement}`;
      payload.settings = payload.settings || {};
      payload.settings = {
        ...payload.settings,
        ...override,
        triggerConfig: {
          ...(payload.settings.triggerConfig || {}),
          ...(override.triggerConfig || {}),
        },
      };

      if (placement === "custom") {
        delete payload.settings.targetElement;
      }

      if (placement === "embedded") {
        delete payload.settings.customBtnSelector;
      }

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
