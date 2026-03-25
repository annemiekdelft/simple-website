if (window.location.hostname === "annemiekdelft.github.io") {
  window.location.replace("https://simple-website-live.onrender.com");
  throw new Error("Redirecting to Render deployment.");
}

const secondSurveyId = "019d2440-d493-7bfb-9b96-e54a6a05b7c4";

const surveyConfigs = [
  {
    scriptId: "019d2446-2128-7bfb-a14a-18339d475df7",
    apiBaseUrl: `${window.location.origin}/insocial-api`,
    surveyBaseUrl: "https://uat-f.insocial.nl",
    metadata: {},
  },
  {
    scriptId: secondSurveyId,
    apiBaseUrl: `${window.location.origin}/insocial-api`,
    surveyBaseUrl: "https://uat-f.insocial.nl",
    metadata: {},
  },
  {
    scriptId: "019d243b-d171-7983-834c-61b3fd54bbe5",
    apiBaseUrl: `${window.location.origin}/insocial-api`,
    surveyBaseUrl: "https://uat-f.insocial.nl",
    metadata: {},
  },
];

function connectCustomButtonFallback() {
  const trigger = document.querySelector("#survey-custom-element");
  if (!trigger || !window.surveyLoader) {
    return;
  }

  trigger.addEventListener("click", () => {
    try {
      window.surveyLoader.open(secondSurveyId);
    } catch (_error) {
      // The vendor config already binds this button. This fallback only exists
      // in case that binding does not attach for some reason.
    }
  });
}

(function () {
  const script = document.createElement("script");
  script.src = "https://web-f.insocial.nl/survey-loader-3.0.4.min.js";
  script.integrity = "sha384-Y+0fCbU8M3M6Lj3HCnsEiQtZbRMynG4l0odZ9JRrHXUIUF+BmSgw/hynVfLfl+X4";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.addEventListener("load", function () {
    if (!window.surveyLoader) {
      return;
    }

    window.surveyLoader.init(surveyConfigs);
    connectCustomButtonFallback();
  });
  document.head.appendChild(script);
})();
