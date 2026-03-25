if (window.location.hostname === "annemiekdelft.github.io") {
  window.location.replace("https://simple-website-live.onrender.com");
  throw new Error("Redirecting to Render deployment.");
}

const resultsList = document.querySelector("#results-list");
const statusPill = document.querySelector("#status-pill");
const feedbackHost = document.querySelector("#give-feedback-block");

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

function collectFeedbackElements() {
  return new Set(
    Array.from(
      document.querySelectorAll(
        ".js-webf-survey-load-iframe-trigger-btn, .webf-injected-wrapper, .js-webf-survey-load-iframe-container"
      )
    )
  );
}

function moveNewFeedbackElements(beforeElements) {
  if (!feedbackHost) {
    return false;
  }

  const currentElements = Array.from(
    document.querySelectorAll(
      ".js-webf-survey-load-iframe-trigger-btn, .webf-injected-wrapper, .js-webf-survey-load-iframe-container"
    )
  );

  const newElements = currentElements.filter((element) => !beforeElements.has(element));
  if (newElements.length === 0) {
    return false;
  }

  const placeholder = feedbackHost.querySelector(".feedback-placeholder");
  if (placeholder) {
    placeholder.remove();
  }

  for (const element of newElements) {
    if (element.classList.contains("js-webf-survey-load-iframe-trigger-btn")) {
      element.classList.add("embedded-feedback-trigger");
    }
    feedbackHost.appendChild(element);
  }

  return true;
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

function installSecondSurveyScript() {
  const existingElements = collectFeedbackElements();
  let placed = false;
  const observer = new MutationObserver(() => {
    if (!placed) {
      placed = moveNewFeedbackElements(existingElements);
      if (placed) {
        debug("Give Feedback block connected.");
        observer.disconnect();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 15000);

  (function() {
      var a = document.createElement('script');
      a.src = 'https://web-f.insocial.nl/survey-loader-3.0.4.min.js';
      a.integrity = 'sha384-Y+0fCbU8M3M6Lj3HCnsEiQtZbRMynG4l0odZ9JRrHXUIUF+BmSgw/hynVfLfl+X4';
      a.async = 'true';
      a.crossOrigin = 'anonymous';
      a.addEventListener('load', function() {
          surveyLoader.init({
          scriptId: "019d2440-d493-7bfb-9b96-e54a6a05b7c4",
          apiBaseUrl: `${window.location.origin}/insocial-api`,
          surveyBaseUrl: "https://uat-f.insocial.nl",
          metadata: {
          }
      });
      });
      document.head.appendChild(a);
  })();
}

installFirstSurveyScript();
installSecondSurveyScript();
