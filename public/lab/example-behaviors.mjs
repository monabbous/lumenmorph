export const examples = {
  spotlight(demo, signal) {
    const button = demo.querySelector("[data-save]");
    button.addEventListener("click", () => {
      const saved = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(saved));
      button.querySelector("span").textContent = saved ? "Thought saved" : "Save this thought";
      button.querySelector("i").className = `fa-solid fa-${saved ? "check" : "arrow-right"}`;
    }, { signal });
  },
  player(demo, signal) {
    const button = demo.querySelector("[data-play]");
    button.addEventListener("click", () => {
      const playing = demo.toggleAttribute("data-playing");
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", playing ? "Pause waveform" : "Animate waveform");
      button.querySelector("i").className = `fa-solid fa-${playing ? "pause" : "play"}`;
    }, { signal });
  },
  beam(demo, signal) {
    const button = demo.querySelector("[data-signal]");
    button.addEventListener("click", () => {
      const off = demo.toggleAttribute("data-off");
      button.setAttribute("aria-pressed", String(!off));
      button.textContent = off ? "Signal off" : "Signal on";
    }, { signal });
  },
  dock(demo, signal) {
    const buttons = [...demo.querySelectorAll("[data-dock]")];
    for (const button of buttons) button.addEventListener("change", () => {
      if (!button.checked) return;
      demo.querySelector(".dock-selection").textContent = button.dataset.dock;
    }, { signal });
  },
  climate(demo, signal) {
    const input = demo.querySelector("[data-warmth]");
    const render = () => {
      const value = Number(input.value);
      demo.querySelector("output").textContent = `${value}°`;
      demo.querySelector(".climate-face span").textContent = value < 21 ? "a little cooler" : value > 24 ? "warm & cozy" : "just right";
      const progress = (value - 16) / 14;
      const stops = [[126, 196, 255], [112, 213, 197], [255, 170, 113]];
      const half = progress < .5 ? 0 : 1;
      const blend = progress < .5 ? progress * 2 : (progress - .5) * 2;
      const color = stops[half].map((channel, index) => Math.round(channel + (stops[half + 1][index] - channel) * blend));
      demo.style.setProperty("--temperature-color", `rgb(${color.join(" ")})`);
      demo.style.setProperty("--temperature-tint", `rgb(${color.join(" ")} / .16)`);
      demo.style.setProperty("--warmth", `${progress * 75}%`);
      input.setAttribute("aria-valuetext", `${value} degrees Celsius`);
    };
    input.addEventListener("input", render, { signal });
    render();
  },
  foil(demo, signal) {
    const input = demo.querySelector("[data-foil]");
    input.addEventListener("change", () => demo.toggleAttribute("data-holographic", input.checked), { signal });
  },
  ignite(demo, signal) {
    const button = demo.querySelector("[data-ignite]");
    button.addEventListener("click", () => {
      const on = demo.toggleAttribute("data-ignited");
      button.setAttribute("aria-pressed", String(on));
      demo.querySelector(".ignite-message").textContent = on ? "Keep it glowing." : "An idea starts here.";
    }, { signal });
  },
  notifications(demo, signal) {
    const cards = [...demo.querySelectorAll(".notification")];
    const restore = demo.querySelector("[data-restore]");
    const status = () => {
      const count = cards.filter(card => !card.hidden).length;
      demo.querySelector(".notification-status").textContent = count ? `${count} sample notification${count === 1 ? "" : "s"}` : "All clear. Enjoy the quiet.";
    };
    for (const card of cards) card.querySelector("[data-dismiss]").addEventListener("click", () => {
      card.hidden = true;
      status();
      (cards.find(item => !item.hidden)?.querySelector("[data-dismiss]") ?? restore).focus({ preventScroll: true });
    }, { signal });
    restore.addEventListener("click", () => { for (const card of cards) card.hidden = false; status(); }, { signal });
  },
  command(demo, signal) {
    const input = demo.querySelector("[data-search]");
    const buttons = [...demo.querySelectorAll("[data-material]")];
    const colors = { Ember: "#ffaa71", Lagoon: "#70d5c5", Moonstone: "#d5c7ec" };
    input.addEventListener("input", () => {
      for (const button of buttons) button.hidden = !button.dataset.material.toLowerCase().includes(input.value.trim().toLowerCase());
      demo.querySelector("[data-no-results]").hidden = buttons.some(button => !button.hidden);
    }, { signal });
    for (const button of buttons) button.addEventListener("click", () => {
      for (const other of buttons) other.setAttribute("aria-pressed", String(button === other));
      demo.style.setProperty("--lumen-glow-color", colors[button.dataset.material]);
      demo.querySelector(".command-status").textContent = `${button.dataset.material} selected`;
    }, { signal });
  },
  weather(demo, signal) {
    const button = demo.querySelector("[data-night]");
    button.addEventListener("click", () => {
      const night = demo.toggleAttribute("data-night");
      button.setAttribute("aria-pressed", String(night));
      button.textContent = night ? "Switch to day" : "Switch to night";
      demo.querySelector("[data-temperature]").textContent = night ? "18°" : "24°";
      demo.querySelector("[data-condition]").textContent = night ? "Clear skies" : "Golden hour";
    }, { signal });
  },
  marbles(demo, signal) {
    for (const input of demo.querySelectorAll("[name=marble-finish]")) input.addEventListener("change", () => {
      if (input.checked) demo.dataset.finish = input.value;
    }, { signal });
  },
  neon(demo, signal) {
    const button = demo.querySelector("[data-neon]");
    button.addEventListener("click", () => {
      const off = demo.toggleAttribute("data-off");
      button.setAttribute("aria-pressed", String(!off));
      button.textContent = off ? "Turn sign on" : "Turn sign off";
    }, { signal });
  },
  steps(demo, signal) {
    let current = 0;
    const items = [...demo.querySelectorAll(".glass-steps li")];
    const messages = ["Imagine something new.", "Give your idea a shape.", "Make the details count."];
    const button = demo.querySelector("[data-next]");
    button.addEventListener("click", () => {
      current = (current + 1) % items.length;
      items.forEach((item, index) => {
        if (index === current) item.setAttribute("aria-current", "step"); else item.removeAttribute("aria-current");
        item.toggleAttribute("data-complete", index < current);
      });
      demo.querySelector(".steps-status").textContent = messages[current];
      button.querySelector("span").textContent = current === items.length - 1 ? "Start again" : "Next step";
      button.querySelector("i").className = `fa-solid fa-${current === items.length - 1 ? "rotate-left" : "arrow-right"}`;
    }, { signal });
  },
  pricing(demo, signal) {
    const button = demo.querySelector("[data-billing]");
    button.addEventListener("click", () => {
      const yearly = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(yearly));
      button.textContent = yearly ? "Switch to monthly" : "Switch to yearly";
      demo.querySelector("[data-price]").textContent = yearly ? "$9" : "$12";
      demo.querySelector("[data-billing-note]").textContent = yearly ? "$108 billed yearly. An illustrative plan." : "Billed monthly. An illustrative plan.";
    }, { signal });
  },
  terminal(demo, signal) {
    demo.querySelector("[data-terminal]").addEventListener("click", () => {
      demo.querySelector("[data-terminal-output]").textContent = "✓ Surface ready\n✓ Shared light connected\n✓ Curiosity encouraged\n\nAll systems glowing.";
    }, { signal });
  },
  profile(demo, signal) {
    const button = demo.querySelector("[data-follow]");
    button.addEventListener("click", () => {
      const following = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(following));
      button.querySelector("span").textContent = following ? "Following demo profile" : "Follow this demo profile";
      button.querySelector("i").className = `fa-solid fa-${following ? "check" : "user-plus"}`;
    }, { signal });
  },
  checklist(demo, signal) {
    const inputs = [...demo.querySelectorAll("[data-task]")];
    for (const input of inputs) input.addEventListener("change", () => {
      for (const item of inputs) item.parentElement.toggleAttribute("data-complete", item.checked);
      const count = inputs.filter(item => item.checked).length;
      demo.querySelector("progress").value = count;
      demo.querySelector("[data-task-status]").textContent = `${count} of 3 complete${count === 3 ? " · A little well done." : ""}`;
    }, { signal });
  },
  analytics(demo, signal) {
    const button = demo.querySelector("[data-chart]");
    const chart = demo.querySelector(".light-chart");
    button.addEventListener("click", () => {
      const previous = button.getAttribute("aria-pressed") !== "true";
      const values = previous ? [330, 240, 480, 390, 520, 290, 450] : [180, 420, 310, 540, 380, 610, 400];
      button.setAttribute("aria-pressed", String(previous));
      button.textContent = previous ? "Show this week" : "Show previous week";
      chart.setAttribute("aria-label", `Sample visits: ${values.join(", ")}`);
      [...chart.children].forEach((bar, index) => bar.style.setProperty("--bar", `${values[index] / Math.max(...values) * 100}%`));
      demo.querySelector("[data-chart-total]").textContent = `${values.reduce((sum, value) => sum + value, 0).toLocaleString("en-US")} visits`;
    }, { signal });
  },
  ticket(demo, signal) {
    const button = demo.querySelector("[data-ticket]");
    button.addEventListener("click", () => {
      const details = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(details));
      button.querySelector("span").textContent = details ? "Back to the ticket" : "See the details";
      button.querySelector("i").className = `fa-solid fa-${details ? "arrow-left" : "arrow-right"}`;
      demo.querySelector("[data-ticket-front]").hidden = details;
      demo.querySelector("[data-ticket-back]").hidden = !details;
    }, { signal });
  },
  palette(demo, signal) {
    const colors = { Lagoon: "#70d5c5", Ember: "#ffaa71", Lilac: "#d5b7ed" };
    const buttons = [...demo.querySelectorAll("[data-palette]")];
    for (const button of buttons) button.addEventListener("change", () => {
      if (!button.checked) return;
      demo.style.setProperty("--palette-color", colors[button.dataset.palette]);
      demo.querySelector("[data-palette-name]").textContent = button.dataset.palette;
    }, { signal });
  },
  rating(demo, signal) {
    const inputs = [...demo.querySelectorAll(".spark-rating input")];
    for (const input of inputs) input.addEventListener("change", () => {
      for (const other of inputs) other.parentElement.toggleAttribute("data-lit", Number(other.value) <= Number(input.value));
      demo.style.setProperty("--spark-strength", String(Number(input.value) / 5));
      demo.style.setProperty("--spark-glow", `${6 + Number(input.value) * 6}px`);
      demo.querySelector("[data-rating-status]").textContent = `${input.value} of 5 sparks. Thanks for trying it.`;
    }, { signal });
  },
};
