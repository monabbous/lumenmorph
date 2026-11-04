# SVG baseline regression font

`noto-kufi-arabic-fallback.woff2` is a test-only subset of Noto Kufi Arabic Regular, version 2.110 (copyright 2019–2022 Google LLC). It retains U+0627 and the original font metrics, but no Latin glyphs. The font is licensed under the SIL Open Font License in `OFL.txt`; original copyright and license metadata remain embedded.

The fixture reproduces Firefox's use of Arabic fallback metrics for `dominant-baseline="central"` when a later monospace fallback supplies the Latin glyphs. Loading it explicitly avoids dependence on the test machine's installed fonts. It is not a lab or package runtime asset.

Generate it from the upstream `NotoKufiArabic-Regular.ttf` version 2.110 with fontTools:

```sh
pyftsubset NotoKufiArabic-Regular.ttf --unicodes=U+0627 --flavor=woff2 \
  --name-IDs='*' --name-legacy --name-languages='*' \
  --output-file=noto-kufi-arabic-fallback.woff2
```
