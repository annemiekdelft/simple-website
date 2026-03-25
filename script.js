const resultsList = document.querySelector("#results-list");
const statusPill = document.querySelector("#status-pill");

function setStatus(label) {
  statusPill.textContent = label;
}

function appendResult(message, kind) {
  const item = document.createElement("li");
  item.textContent = message;

  if (kind === "success") {
    item.classList.add("result-success");
  }

  if (kind === "error") {
    item.classList.add("result-error");
  }

  if (
    resultsList.children.length === 1 &&
    resultsList.firstElementChild.textContent === "Survey tab script configured and loading automatically."
  ) {
    resultsList.innerHTML = "";
  }

  resultsList.appendChild(item);
}

function loadExternalScript(url, options = {}) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-external-src="${url}"]`);

    if (existing) {
      resolve("Already loaded");
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.dataset.externalSrc = url;
    if (options.integrity) {
      script.integrity = options.integrity;
    }
    if (options.crossOrigin) {
      script.crossOrigin = options.crossOrigin;
    }

    script.onload = () => resolve("Loaded");
    script.onerror = () => reject(new Error("Failed to load"));

    document.body.appendChild(script);
  });
}

async function initSurveyIntegration() {
  setStatus("Loading");

  try {
    await loadExternalScript("https://web-f.insocial.nl/survey-loader-3.0.4.min.js", {
      integrity: "sha384-Y+0fCbU8M3M6Lj3HCnsEiQtZbRMynG4l0odZ9JRrHXUIUF+BmSgw/hynVfLfl+X4",
      crossOrigin: "anonymous",
    });

    if (!window.surveyLoader) {
      throw new Error("surveyLoader is unavailable after script load");
    }

    window.surveyLoader.init({
      scriptId: "019d2446-2128-7bfb-a14a-18339d475df7",
      apiBaseUrl: "https://uat-api.insocial.nl",
      surveyBaseUrl: "https://uat-f.insocial.nl",
      metadata: {},
    });

    appendResult("Survey tab script loaded and initialized.", "success");
    setStatus("Active");
  } catch (error) {
    appendResult("Survey tab script failed to initialize.", "error");
    setStatus("Error");
  }
}

initSurveyIntegration();
