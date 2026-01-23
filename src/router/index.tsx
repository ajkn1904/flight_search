import App from "@/App";
import home from "@/pages/home";
import { createBrowserRouter } from "react-router";

const router = createBrowserRouter([
    {
        path: "/",
        Component: App,
        children: [
            {
                path: "/",
                Component: home
            }
            
        ]
    },
]);

export default router;