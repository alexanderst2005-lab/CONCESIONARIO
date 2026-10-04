export const metadata = {
  title: "Política de Privacidad - AutosElPatron",
  description: "Cómo AutosElPatron recopila, usa y protege tus datos personales.",
};

export default function PrivacidadPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px", lineHeight: 1.7 }}>
      <h1>Política de Privacidad</h1>
      <p>Última actualización: octubre de 2026</p>

      <h2>Datos que recopilamos</h2>
      <p>
        Al registrarte o iniciar sesión con Google recopilamos tu nombre, correo
        electrónico y foto de perfil. También guardamos los datos de los
        vehículos que publiques y tus favoritos.
      </p>

      <h2>Cómo usamos tus datos</h2>
      <p>
        Usamos tus datos para crear y administrar tu cuenta, permitirte publicar
        vehículos, enviarte correos de recuperación de contraseña y mejorar el
        servicio. No vendemos tu información a terceros.
      </p>

      <h2>Inicio de sesión con Google</h2>
      <p>
        Solo accedemos a tu nombre, correo y foto de perfil. No accedemos a tus
        correos, contactos ni archivos de Google.
      </p>

      <h2>Seguridad y conservación</h2>
      <p>
        Protegemos tus datos con medidas técnicas razonables y los conservamos
        mientras tu cuenta esté activa.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes solicitar acceso, corrección o eliminación de tus datos
        escribiendo al correo de contacto del sitio.
      </p>
    </main>
  );
}
