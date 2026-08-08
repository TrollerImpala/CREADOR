import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Nav from './components/App/Nav-menu';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from "./components/auth/Register";
import GaleriaArte from "./components/App/GaleriaArte-app";
import Amigos from "./components/App/Amigos-app";
import Teams from "./components/App/Teams-app";

const Router = createBrowserRouter([
    {
        path : '/',
        element : <Home />
    },
    {
        path : '/Login',
        element : <Login />
    },
    {
        path : '/Register',
        element : <Register />
    },
    {
        path : '/Nav',
        element : <Nav />
    },
    {
        path : '/Arte',
        element : <GaleriaArte />
    },
    {
        path : '/Amigos',
        element : <Amigos />
    },
    {
        path : '/Teams',
        element : <Teams />
    }
]);

function App(){
    return <RouterProvider router={Router} />;
}

export default App