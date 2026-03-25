if (window.location.hostname === "annemiekdelft.github.io") {
  window.location.replace("https://simple-website-live.onrender.com");
}

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

function debug(message, kind = "success") {
  appendResult(message, kind);
}

function installFirstSurveyScript() {
  setStatus("Loading");

  try {
    (function () {
      const a = document.createElement("script");
      a.src = "https://web-f.insocial.nl/survey-loader-3.0.4.min.js";
      a.integrity = "sha384-Y+0fCbU8M3M6Lj3HCnsEiQtZbRMynG4l0odZ9JRrHXUIUF+BmSgw/hynVfLfl+X4";
      a.async = true;
      a.crossOrigin = "anonymous";
      a.addEventListener("load", function () {
        if (!window.surveyLoader) {
          debug("Survey loader script loaded, but surveyLoader was not found.", "error");
          setStatus("Error");
          return;
        }

        try {
          window.surveyLoader.init({
            scriptId: "019d2446-2128-7bfb-a14a-18339d475df7",
            apiBaseUrl: `${window.location.origin}/insocial-api`,
            surveyBaseUrl: "https://uat-f.insocial.nl",
            metadata: {},
          });
        } catch (error) {
          debug(`surveyLoader.init() threw: ${error.message}`, "error");
          setStatus("Error");
          return;
        }

        debug("Survey tab script initialized.");
        setStatus("Active");
      });
      a.addEventListener("error", function () {
        debug("Survey tab script failed to load from InSocial.", "error");
        setStatus("Error");
      });
      document.head.appendChild(a);
    })();
  } catch (error) {
    debug(`Survey tab script failed before initialization: ${error.message}`, "error");
    setStatus("Error");
  }
}

installFirstSurveyScript();
