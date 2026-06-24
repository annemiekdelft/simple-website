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
  });
  document.head.appendChild(script);
})();
