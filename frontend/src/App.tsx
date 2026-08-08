import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Nav from './components/App/Nav-menu';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from "./components/auth/Register";
import Dashboard from "./components/App/Dashboard-app";
import Amigos from "./components/App/Amigos-app";
import Grupos from "./components/App/Grupos-app";


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
        path : '/Dashboard',
        element : <Dashboard />
    },
    {
        path : '/Amigos',
        element : <Amigos />
    },
    {
        path : '/Grupos',
        element : <Grupos />
    }
]);

function App(){
    return <RouterProvider router={Router} />;
}

export default App