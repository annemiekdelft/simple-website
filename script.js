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
          appendResult("Survey loader script loaded, but surveyLoader was not found.", "error");
          setStatus("Error");
          return;
        }

        window.surveyLoader.init({
          scriptId: "019d2446-2128-7bfb-a14a-18339d475df7",
          apiBaseUrl: "https://uat-api.insocial.nl",
          surveyBaseUrl: "https://uat-f.insocial.nl",
          metadata: {},
        });

        appendResult("Survey tab script loaded with the vendor init snippet.", "success");
        setStatus("Active");
      });
      a.addEventListener("error", function () {
        appendResult("Survey tab script failed to load from InSocial.", "error");
        setStatus("Error");
      });
      document.head.appendChild(a);
    })();
  } catch (error) {
    appendResult("Survey tab script failed before initialization.", "error");
    setStatus("Error");
  }
}

installFirstSurveyScript();
