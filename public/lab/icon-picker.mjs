export function setupIconPicker(onChange, initialIcon) {
  const root = document.querySelector("#icon-controls");
  const pathInput = root.querySelector("#icon-path");
  const boxInput = root.querySelector("#icon-viewbox");
  const status = root.querySelector("#icon-status");
  const dialog = root.querySelector("#icon-picker");
  const choose = root.querySelector("#choose-icon");
  const search = root.querySelector("#icon-search");
  const style = root.querySelector("#icon-style");
  const results = root.querySelector("#icon-results");
  const resultStatus = root.querySelector("#icon-results-status");
  const previous = root.querySelector("#icon-previous"), next = root.querySelector("#icon-next");
  const controller = new AbortController();
  const { signal } = controller;
  let catalog, loading, timer, page = 0, selected;
  const pageSize = 24;
  if (initialIcon) {
    pathInput.value = initialIcon.paths;
    boxInput.value = initialIcon.viewBox;
    root.querySelector("#icon-name").textContent = initialIcon.label;
    selected = "brands/github";
  }

  function apply(label = "Custom SVG path") {
    const path = pathInput.value.trim();
    const numbers = boxInput.value.trim().split(/[\s,]+/).map(Number);
    const validBox = numbers.length === 4 && numbers.every(Number.isFinite) && numbers[2] > 0 && numbers[3] > 0;
    boxInput.setAttribute("aria-invalid", String(!validBox));
    if (!validBox) { status.textContent = "Use four view-box numbers with positive width and height. The last valid icon is still shown."; return; }
    try {
      if (!path || path.length > 50000 || !/^[Mm]/.test(path) || /[^\sMmZzLlHhVvCcSsQqTtAa\d.,+\-eE]/.test(path)) throw new Error();
      new Path2D(path);
    } catch {
      pathInput.setAttribute("aria-invalid", "true");
      status.textContent = "Enter SVG path data starting with M, not SVG markup. The last valid icon is still shown.";
      return;
    }
    pathInput.setAttribute("aria-invalid", "false");
    root.querySelector("#icon-name").textContent = label;
    status.textContent = "Icon updated. The SVG preview and adapter code use this path.";
    onChange({ paths: path, viewBox: numbers.join(" "), label });
  }
  for (const input of [pathInput, boxInput]) input.addEventListener("input", () => {
    selected = undefined;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => apply(), 180);
  }, { signal });

  function render() {
    if (!catalog) return;
    const terms = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const matches = catalog.filter(icon => (style.value === "all" || icon.style === style.value) && terms.every(term => `${icon.name} ${icon.label} ${icon.terms}`.toLowerCase().includes(term)));
    page = Math.min(page, Math.max(0, Math.ceil(matches.length / pageSize) - 1));
    const visible = matches.slice(page * pageSize, (page + 1) * pageSize);
    resultStatus.textContent = matches.length ? `${page * pageSize + 1}–${page * pageSize + visible.length} of ${matches.length} icons` : "No matching icons. Try another name or style.";
    previous.disabled = page === 0;
    next.disabled = (page + 1) * pageSize >= matches.length;
    results.replaceChildren(...visible.map(icon => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lumenmorph lumenmorph-border";
      button.title = `${icon.label} (${icon.style})`;
      button.setAttribute("aria-label", `Use ${icon.label} (${icon.style})`);
      button.setAttribute("aria-pressed", String(selected === icon.id));
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", icon.viewBox);
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", icon.path);
      svg.append(path);
      const label = document.createElement("span");
      label.textContent = icon.label;
      const family = document.createElement("small");
      family.textContent = icon.style;
      button.append(svg, label, family);
      button.addEventListener("click", () => {
        window.clearTimeout(timer);
        selected = icon.id;
        pathInput.value = icon.path;
        boxInput.value = icon.viewBox;
        apply(`${icon.label} (${icon.style})`);
        dialog.close();
        render();
      });
      item.append(button);
      return item;
    }));
  }
  choose.addEventListener("click", async () => {
    dialog.showModal();
    search.focus({ preventScroll: true });
    if (catalog || loading) return;
    resultStatus.textContent = "Loading all Font Awesome Free icons…";
    loading = true;
    try {
      const response = await fetch(new URL("./assets/fontawesome-icons.json", import.meta.url), { signal });
      if (!response.ok) throw new Error();
      catalog = (await response.json()).icons;
      render();
    } catch {
      if (!signal.aborted) resultStatus.textContent = "Could not load the catalog. Close and reopen to retry; custom paths still work.";
    } finally { loading = false; }
  }, { signal });
  root.querySelector("#close-icon-picker").addEventListener("click", () => dialog.close(), { signal });
  // Search inputs consume Escape to clear themselves in several engines.
  // Keep one-press dialog dismissal consistent while preserving native selects.
  dialog.addEventListener("keydown", event => {
    if (event.key === "Escape" && event.target.tagName !== "SELECT") {
      event.preventDefault();
      dialog.close();
    }
  }, { signal, capture: true });
  search.addEventListener("input", () => { page = 0; render(); }, { signal });
  style.addEventListener("change", () => { page = 0; render(); }, { signal });
  previous.addEventListener("click", () => { page--; render(); }, { signal });
  next.addEventListener("click", () => { page++; render(); }, { signal });
  choose.disabled = false;
  return () => { controller.abort(); window.clearTimeout(timer); };
}
