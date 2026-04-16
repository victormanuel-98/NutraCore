import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Dashboard } from "./components/Dashboard";
import { Catalog } from "./components/Catalog";
import { NutraCoreLab } from "./components/NutraCoreLab";
import { News } from "./components/News";
import { Profile } from "./components/Profile";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "dashboard", Component: Dashboard },
      { path: "catalog", Component: Catalog },
      { path: "lab", Component: NutraCoreLab },
      { path: "news", Component: News },
      { path: "profile", Component: Profile },
      { path: "*", Component: NotFound },
    ],
  },
]);