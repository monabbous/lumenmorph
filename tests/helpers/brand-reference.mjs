// Keep the frozen pre-integration fixtures intact. Compare their original paint
// mechanics with the new palette, not with historical blue/teal color values.
export async function useCurrentBrandReference(page) {
  const colors = { "#102a3166": "#29282366", "#203c46": "#34332e", "#1c3540": "#292823",
    "#e8f6fa": "#f6f1e5", "#5289a6": "#827b6c", "#063c5940": "#34332e40", "#f5fbff": "#f6f1e5" };
  await page.route("**/__slidebox-tests/legacy-*.css", async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/#(?:102a3166|203c46|1c3540|e8f6fa|5289a6|063c5940|f5fbff)\b/gi,
      color => colors[color.toLowerCase()]);
    await route.fulfill({ response, body });
  });
}
