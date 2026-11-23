import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { App as AntApp, ConfigProvider } from "antd";
import { store } from "./store";
import defaultTheme from "@styles/themes/default";
import App from "./App";
import "./styles/main.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={defaultTheme}>
        <AntApp>
          <App />
        </AntApp>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);
