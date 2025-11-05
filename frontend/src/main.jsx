import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom'
import { Provider } from '@/components/ui/provider';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import './index.css'
import AppDataProvider from "./components/AppDataProvider";
import userAuthenticator from "./loaders/authenticator"
import loginRedirect from "./loaders/loginRedirect"
import portfolioLoader from "./loaders/portfolioLoader";
import stockLoader from "./loaders/stockLoader";
import Layout from "./components/layout";
import Portfolio from "./components/Portfolio";
import StockPage from "./components/StockPage";
import Login from "./components/Login";
import Register from "./components/Register";
import ErrorPage from "./components/ErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    loader: userAuthenticator,
    shouldRevalidate: () => true,
    element: <Layout />,
    errorElement: <ErrorPage />, 
    HydrateFallback: () => null,
    children: [
      {
        index: true,
        loader: () => redirect("/portfolio")
      },
      {
        path: "portfolio",
        loader: portfolioLoader,
        element: <Portfolio />
      },
      {
        path: "stocks/:stockSymbol",
        loader: stockLoader,
        element: <StockPage />
      }
    ]
  },
  {
    path: "/login",
    loader: loginRedirect,
    element: <Login />,
    errorElement: <ErrorPage />,
    HydrateFallback: () => null  
  },
  {
    path: "/register",
    loader: loginRedirect,
    element: <Register />,
    errorElement: <ErrorPage />,
    HydrateFallback: () => null
  }
]);

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider forcedTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AppDataProvider>
          <RouterProvider router={router} />
        </AppDataProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);