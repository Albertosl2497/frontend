import React from "react";

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="row">
          <div className="col-md-4">
            <h3>Nuestras redes sociales</h3>
            <p>Facebook Sorteo Sonorense</p>
            <p>Facebook Trébol Sonorense</p>
            <p>Instagram</p>
          </div>
          <div className="col-md-4 col-md-6 center">
            <h3 className="white">Trébol Sonorense</h3>
            <h5>
              Somos un equipo dedicado a rifas entre amigos, desde el año 2019,
              teniendo hasta el día de hoy una comunidad de mas de 70 mil
              seguidores en nuestra página de facebook.
            </h5>
            <h4>Conoce mas sobre nosotros</h4>
          </div>
          <div className="col-md-4 end">
            <h3>Lineas de whatsapp</h3>
            <p>Linea de contacto #1</p>
            <p>Linea de contacto #2</p>
            <p>Linea de contacto #3</p>
            <p>Linea de contacto #4</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
