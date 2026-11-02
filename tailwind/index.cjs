const plugin = require("tailwindcss/plugin");
const rules = require("./rules.json");

module.exports = plugin(function ({ addUtilities, matchUtilities, theme }) {
  addUtilities(rules);
  const values = {
    "glow-size": ["--lumen-glow-size", theme("spacing")],
    "blur": ["--lumen-blur", theme("blur")],
    "radius": ["--lumen-radius", theme("borderRadius")],
    "border-width": ["--lumen-border-width", theme("borderWidth")],
    "glow-opacity": ["--lumen-glow-opacity", theme("opacity")],
    "border-opacity": ["--lumen-border-opacity", theme("opacity")],
    "saturation": ["--lumen-saturation", {}],
    "text-glow-size": ["--lumen-text-glow-size", theme("spacing")],
    "text-glow-opacity": ["--lumen-text-glow-opacity", theme("opacity")],
    "text-stroke-width": ["--lumen-text-stroke-width", theme("borderWidth")],
  };
  for (const [name, [property, options]] of Object.entries(values)) {
    matchUtilities({ [`lumen-${name}`]: value => ({ [property]: value }) }, { values: options });
  }
  function flatten(object, prefix = "") {
    return Object.fromEntries(Object.entries(object).flatMap(([key, value]) => {
      const name = key === "DEFAULT" ? prefix : [prefix, key].filter(Boolean).join("-");
      return typeof value === "object" && value !== null ? Object.entries(flatten(value, name)) : [[name, value]];
    }));
  }
  const colors = { ember: "#ffaa71", lagoon: "#00b2b2", lilac: "#c4a1ff", ...flatten(theme("colors")) };
  for (const [name, property] of Object.entries({
    "glow": "--lumen-glow-color", "glow-color": "--lumen-glow-color", "solid-bg": "--lumen-solid-bg", "bg": "--lumen-bg", "border-color": "--lumen-border-color",
    "border-glow": "--lumen-border-glow-color", "text-color": "--lumen-text-color",
  })) {
    matchUtilities({ [`lumen-${name}`]: value => ({ [property]: value }) }, { values: colors, type: "color" });
  }
});
