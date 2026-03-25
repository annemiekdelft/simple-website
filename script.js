const textarea = document.querySelector("#script-urls");
const loadButton = document.querySelector("#load-scripts");
const clearButton = document.querySelector("#clear-results");
const resultsList = document.querySelector("#results-list");
const statusPill = document.querySelector("#status-pill");

function setStatus(label) {
  statusPill.textContent = label;
}

function clearResults() {
  resultsList.innerHTML = "<li>No scripts loaded yet.</li>";
  setStatus("Waiting");
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

  if (resultsList.children.length === 1 && resultsList.firstElementChild.textContent === "No scripts loaded yet.") {
    resultsList.innerHTML = "";
  }

  resultsList.appendChild(item);
}

function parseUrls(rawValue) {
  return rawValue
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function validateUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch (error) {
    return false;
  }
}

function loadExternalScript(url) {
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

    script.onload = () => resolve("Loaded");
    script.onerror = () => reject(new Error("Failed to load"));

    document.body.appendChild(script);
  });
}

async function handleLoadScripts() {
  const urls = parseUrls(textarea.value);

  clearResults();

  if (urls.length === 0) {
    appendResult("Please add at least one JavaScript URL.", "error");
    setStatus("Needs Input");
    return;
  }

  setStatus("Loading");

  for (const url of urls) {
    if (!validateUrl(url)) {
      appendResult(`Invalid URL skipped: ${url}`, "error");
      continue;
    }

    try {
      const result = await loadExternalScript(url);
      appendResult(`${result}: ${url}`, "success");
    } catch (error) {
      appendResult(`Failed: ${url}`, "error");
    }
  }

  const hasErrors = resultsList.querySelector(".result-error");
  setStatus(hasErrors ? "Loaded With Issues" : "Complete");
}

loadButton.addEventListener("click", handleLoadScripts);
clearButton.addEventListener("click", clearResults);
