import { useEffect } from 'react';
import Header from './App/Header'; // Ajusta la ruta según la carpeta donde guardes Header.tsx
import Nav from './App/Nav';
import '../styles/Home.css';

function Home() {
  useEffect(() => {
    // localStorage.clear();
    // refreshToken();
  }, []);

  return (
    <>
      <Header />

      <Nav />

      <section>
        <h1>¡Bienvenidos a la página!</h1>

        <h2>
          En la página principal, tendría que haber un tablón mostrando un poco de todas las creaciones
          (por ejemplo, dibujos, música, proyectos de teams, etc.)
        </h2>
      </section>

      <footer>
        <div>
          <h2>CREADOR</h2>
          <p>©CREADOR - Página hecha por el team 01</p>
        </div>
      </footer>
    </>
  );
}

export default Home;