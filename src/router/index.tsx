import App from "@/App";
import explore from "@/pages/explore";
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
            },
            {
                path: "explore",
                Component: explore
            },
            
        ]
    },
]);

export default router;