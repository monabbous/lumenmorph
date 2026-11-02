[← Documentation](README.md)

## Sass / SCSS

Import the mixin-only entry point when you want your own class names:

```scss
@use "@monabbous/lumenmorph/scss/mixins" as lumen;

.card {
  @include lumen.lumenmorph((glow-size: 440px, bg: #102333bb));
  @include lumen.border((border-width: 2px));
  padding: 2rem;
}

.heading {
  @include lumen.text((glow-color: #fca675));
}
```

The map keys omit `--lumen-`. `lumenmorph()`, `border()`, and `text()` accept an optional map. You can configure shared defaults with `@use ... with ($defaults: (...))`.

Import `@monabbous/lumenmorph/scss` instead if you want the ready-made classes. Your Sass bundler must resolve package imports, or you must add `node_modules` to Sass load paths. Don't also import the vanilla stylesheet.


## Less

```less
@import "@monabbous/lumenmorph/less";

.card {
  .lumenmorph(@glow-size: 440px; @bg: #102333bb);
  .lumenmorph-border(@border-width: 2px);
  padding: 2rem;
}

.heading {
  .lumenmorph-text(@glow-color: #fca675);
}
```

The Less import defines mixins only. Named parameters match the control table, without `--lumen-`. Configure your Less bundler to resolve package imports. Don't also import the vanilla stylesheet.

For the ready-made classes instead of mixins, import `@monabbous/lumenmorph/less/classes`. That entry also supplies the internal surface class needed by optional SVG components.

