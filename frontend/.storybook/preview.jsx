import "../src/index.css";
import "bootstrap/dist/css/bootstrap.css";
import 'react-toastify/dist/ReactToastify.css';

import { mswLoader } from 'msw-storybook-addon/csf3'
import { setupWorker } from 'msw/browser'

import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import {withRouter} from "storybook-addon-remix-react-router";

const queryClient = new QueryClient();

const currentUrl = window.location.href;
const isLocalhost = currentUrl.startsWith("http://localhost:6006/");
const mockServiceWorkerUrl = isLocalhost ? "mockServiceWorker.js" : "https://" + window.location.hostname + "/mockServiceWorker.js";

// Set up MSW with a custom service worker URL (needed when Storybook is
// deployed somewhere other than localhost, e.g. GitHub Pages / Chromatic)

const mswWorkerSetup = async () => {
  const worker = setupWorker();
  await worker.start({
    quiet: true,
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: mockServiceWorkerUrl,
    },
  });
  return worker;
};

// Per https://storybook.js.org/docs/react/writing-stories/decorators#context-for-mocking
// Here, we provide the context needed for some of the components,
// e.g. the ones that rely on currentUser

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <Story />
      </QueryClientProvider>
    ),
    withRouter,
  ],

  loaders: [mswLoader(mswWorkerSetup)],
  tags: ["autodocs"]
};

export default preview;
