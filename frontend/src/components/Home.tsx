import { useEffect } from 'react';
import Header from './Reusable/Header'; 
import Nav from './Reusable/Nav';
import '../styles/Home.css';

function Home() {
  useEffect(() => {
    // localStorage.clear();
    // refreshToken();
  }, []);

  return (
    <div className="home-container">
      <Header />
      <Nav />

      <main className="home-main">
        <section className="welcome-hero">
          <h1>¡Bienvenidos a la página!</h1>
          <p className="welcome-subtitle">
            En la página principal, tendría que haber un tablón mostrando un poco de todas las creaciones 
            <span>(por ejemplo, dibujos, música, proyectos de teams, etc.)</span>
          </p>
        </section>

        {/* Espacio reservado para cuando implementes el tablón */}
        <section className="dashboard-grid">
          <div className="placeholder-card">
            <p>🎨 Próximamente: Tablón de creaciones</p>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-content">
          <h2>CREADOR</h2>
          <p>© CREADOR - Página hecha por el team 01</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;