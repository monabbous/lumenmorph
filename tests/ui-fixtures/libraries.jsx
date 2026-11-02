import React from "react";
import { createRoot } from "react-dom/client";
import { createTheme, ThemeProvider, Paper, Button } from "@mui/material";
import { createTheme as createMantineTheme, MantineProvider, Paper as MantinePaper, Button as MantineButton } from "@mantine/core";
import "@mantine/core/styles.css";
import "../../dist/css/mui.css";
import "../../dist/css/mantine.css";

const mui = createTheme({ cssVariables: true, palette: { primary: { main: "#00b2b2" } }, components: {
  MuiPaper: { defaultProps: { classes: { root: "lumenmorph-mui" }, elevation: 0 } },
  MuiButton: { defaultProps: { classes: { outlined: "lumenmorph-mui" } } },
} });
const mantine = createMantineTheme({ components: {
  Paper: MantinePaper.extend({ classNames: { root: "lumenmorph-mantine lumenmorph-mantine-border" } }),
  Button: MantineButton.extend({ defaultProps: { variant: "default" }, classNames: { root: "lumenmorph-mantine" } }),
} });
function App() {
  const [clicks, setClicks] = React.useState(0);
  return <><ThemeProvider theme={mui}><Paper data-testid="mui-paper" sx={{ p: 3 }}>
    <Button variant="outlined" onClick={() => setClicks(value => value + 1)}>MUI action</Button>
    <Button variant="outlined" disabled>MUI disabled</Button>
  </Paper></ThemeProvider>
  <MantineProvider theme={mantine}><MantinePaper data-testid="mantine-paper" p="xl" radius="lg">
    <MantineButton onClick={() => setClicks(value => value + 1)}>Mantine action</MantineButton>
    <MantineButton loading>Mantine loading</MantineButton>
    <MantineButton disabled>Mantine disabled</MantineButton>
  </MantinePaper></MantineProvider><output>{clicks}</output></>;
}
createRoot(document.querySelector("#app")).render(<App />);
