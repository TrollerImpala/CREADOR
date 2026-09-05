import {
    createBrowserRouter, RouterProvider,
    Navigate, Outlet
 } from "react-router-dom";

import Nav from './components/App/Nav';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from "./components/auth/Register";

import GaleriaArte from "./components/App/GaleriaArte-app";
import ArtPost from "./components/App/Single/ArtePost-app";
import PostearArte from "./components/App/Posts/Postear-Arte";

import Amigos from "./components/App/Amigos-app";

import Teams from "./components/App/Teams-app";

function ProtectedRoute() {
  const usuarioAutenticado = localStorage.getItem('usuario');

  if (!usuarioAutenticado) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

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
        path : '/Arte/:artpost_id',
        element : <ArtPost />
    },
    {
        element : <ProtectedRoute />,
        children : [
            {
                path : 'Arte/PostearArte',
                element : <PostearArte />
            },
        ]
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