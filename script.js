if (window.location.hostname === "annemiekdelft.github.io") {
  window.location.replace("https://simple-website-live.onrender.com");
  throw new Error("Redirecting to Render deployment.");
}

const insocialScriptId = "019ef977-1f10-7455-a046-7cced1c1655c";
const isDemo = /[?#&]surveyscript=demo([&#]|$)/.test(window.location.href);
const surveyBaseUrl = "https://f.insocial.nl";

function buildSurveyConfig(placement) {
  return {
    scriptId: insocialScriptId,
    apiBaseUrl: `${window.location.origin}/insocial-api`,
    surveyBaseUrl,
    metadata: { placement, demo: isDemo },
  };
}

const surveyConfigs = [
  buildSurveyConfig("tab"),
  buildSurveyConfig("custom"),
  buildSurveyConfig("embedded"),
];

async function fetchSurveyPayload(placement) {
  const response = await fetch(`${window.location.origin}/insocial-api/v2/advanced-pop-up-script/${insocialScriptId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scriptId: insocialScriptId,
      personalIdentifier: "",
      isDemo,
      metadata: { placement, demo: isDemo },
    }),
  });

  if (!response.ok) {
    throw new Error(`Survey config failed: ${response.status}`);
  }

  return response.json();
}

function buildSurveyUrl(payload, placement) {
  const params = new URLSearchParams({
    app_embedded: "true",
    scriptId: insocialScriptId,
    placement,
    pageUrl: window.location.href,
    pageTitle: document.title,
  });

  if (document.referrer) {
    params.set("referrer", document.referrer);
  }

  if (placement === "embedded") {
    params.set("app_injected", "true");
  }

  if (isDemo) {
    params.set("demo", "true");
  }

  return `${surveyBaseUrl.replace(/\/$/, "")}/${payload.flightId}?${params.toString()}`;
}

function createSurveyIframe(payload, placement, extraClassName = "") {
  const iframe = document.createElement("iframe");
  iframe.className = `js-webf-survey-load-iframe-element webf-survey-load-iframe-element ${extraClassName}`.trim();
  iframe.src = buildSurveyUrl(payload, placement);
  iframe.height = "100%";
  iframe.frameBorder = "0";
  iframe.title = "Insocial Survey";
  return iframe;
}

async function injectEmbeddedFallback() {
  const target = document.querySelector("#embedded-survey-block");
  if (!target || target.querySelector("iframe")) {
    return;
  }

  const payload = await fetchSurveyPayload("embedded");
  if (!payload.flightId || target.querySelector("iframe")) {
    return;
  }

  target.style.position = "relative";

  const wrapper = document.createElement("div");
  wrapper.className = "webf-injected-wrapper";
  wrapper.append(createSurveyIframe(payload, "embedded", "webf-survey-load-iframe-element--injected"));
  target.append(wrapper);
}

async function openCustomFallback() {
  if (document.querySelector(".js-webf-survey-load-iframe-container iframe")) {
    return;
  }

  const payload = await fetchSurveyPayload("custom");
  if (!payload.flightId || document.querySelector(".js-webf-survey-load-iframe-container iframe")) {
    return;
  }

  const container = document.createElement("div");
  container.className = "webf-survey-load-iframe-container js-webf-survey-load-iframe-container active";
  const iframe = createSurveyIframe(payload, "custom", "webf-survey-load-iframe-element--modal active");
  container.append(iframe);
  document.body.append(container);
}

function bindCustomFallback() {
  const button = document.querySelector("#survey-custom-element");
  if (!button) {
    return;
  }

  button.addEventListener("click", function () {
    window.setTimeout(function () {
      if (!document.querySelector(".js-webf-survey-load-iframe-container iframe")) {
        openCustomFallback().catch((error) => console.error(error.message, "custom survey fallback error"));
      }
    }, 350);
  });
}

function installSurveyFallbacks() {
  bindCustomFallback();
  window.setTimeout(function () {
    injectEmbeddedFallback().catch((error) => console.error(error.message, "embedded survey fallback error"));
  }, 1800);
}

(function () {
  const script = document.createElement("script");
  script.src = "https://web-f.insocial.nl/survey-loader-3.0.9.min.js";
  script.integrity = "sha384-gWv+tmDoPApw1aSy9AGQYBz3nYp9gkKoHaDxgepQOiAdT+d9zE8pXntVzPFVV8SQ";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.addEventListener("load", function () {
    if (!window.surveyLoader) {
      return;
    }

    window.surveyLoader.init(surveyConfigs);
    installSurveyFallbacks();
  });
  document.head.appendChild(script);
})();
