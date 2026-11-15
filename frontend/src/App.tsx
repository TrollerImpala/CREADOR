/**
 * App.tsx — Configuración de rutas del frontend.
 *
 * Capa: routing (React Router).
 * Este archivo es el mapa de la SPA: qué URL muestra qué componente.
 *
 * Conceptos:
 * - createBrowserRouter define el árbol de rutas.
 * - RouterProvider monta ese árbol en la app.
 * - :param en una ruta se lee con useParams() en el componente.
 * - Outlet renderiza los hijos de una ruta padre.
 * - ProtectedRoute envuelve las rutas que requieren sesión.
 *
 * Ojo: ProtectedRoute solo comprueba que exista 'usuario' en localStorage.
 * No valida el token; la seguridad real la aplica el backend con los guards.
 */
import {
    createBrowserRouter, RouterProvider,
    Navigate, Outlet
 } from "react-router-dom";

import ProfilePage from "./components/App/User";
import Nav from './components/Reusable/Nav';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from "./components/auth/Register";

import UserProfile from "./components/App/UserProfile/UserProfile";

import GaleriaArte from "./components/App/GaleriaArte-app";
import ArtPost from "./components/App/Single/ArtePost-app";
import PostearArte from "./components/App/Posts/Postear-Arte";

import JobOffers from "./components/App/JobOffers";
import JobOfferPost from "./components/App/Single/JobOfferPost";
import PostJobOffer from "./components/App/Posts/Post-JobOffer";

import GaleriaMusica from "./components/App/GaleriaMusica-app";
import MusicPost from "./components/App/Single/MusicPost-app";
import PostSong from "./components/App/Posts/Post-Song";


import Amigos from "./components/App/Amigos-app";

import Teams from "./components/App/Teams-app";


/**
 * Componente de ruta protegida.
 * Si no hay usuario guardado, redirige a "/" (replace evita volver atrás).
 * Si hay usuario, <Outlet /> renderiza la ruta hija que corresponda.
 */
function ProtectedRoute() {
  const usuarioAutenticado = localStorage.getItem('usuario');

  if (!usuarioAutenticado) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

// Cada objeto es una ruta. Las públicas van primero; las de creación de
// posts están agrupadas como hijas de ProtectedRoute.
const Router = createBrowserRouter([
    {
        path : '/',
        element : <Home />
    },
    {
        path : '/User',
        element : <ProfilePage />
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
        path : '/Musica',
        element : <GaleriaMusica />
    },
    {
        path : '/Musica/:song_id',
        element : <MusicPost />
    },
    {
        path : '/Arte/:artpost_id',
        element : <ArtPost />
    },
    {
        path : '/JobOffers',
        element : <JobOffers />
    },
    {
        path : '/JobOffers/:project_id',
        element : <JobOfferPost />
    },
    {
        // Ruta padre sin path propio: solo aplica el guard a sus hijas.
        element : <ProtectedRoute />,
        children : [
            {
                path : 'Arte/PostearArte',
                element : <PostearArte />
            },
            {
                path : 'Musica/PostearCancion',
                element : <PostSong />
            },
            {
                path : 'JobOffers/PostJobOffer',
                element : <PostJobOffer />
            },
        ]
    },    
    {
        path : '/User/:user_id',
        element : <UserProfile />
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