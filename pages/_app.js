import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import GlobalContextAPIProvider from "../state-management/globalContext";
import LocationContextProvider from "../state-management/locationContext";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { customThemes } from "../styles/MUI_themes";

// Redux imports
import { Provider } from "react-redux"; // allows us to use provider tags
import store from "../state-management/store/index"; // import the store from step 3

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <GlobalContextAPIProvider>
        <Provider store={store}>
          <LocationContextProvider>
            <ThemeProvider theme={customThemes.light}>
              <CssBaseline>
                <Component {...pageProps} />
              </CssBaseline>
            </ThemeProvider>
          </LocationContextProvider>
        </Provider>
      </GlobalContextAPIProvider>
    </SessionProvider>
  );
}

export default MyApp;
