// Función para mostrar notificaciones bonitas
function showNotification(type, title, message) {
  const container = document.getElementById('notification-container');
  
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Icono según el tipo
  const icon = type === 'success' ? '✓' : '✕';
  
  notification.innerHTML = `
    <div class="notification-icon">${icon}</div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
  `;
  
  container.appendChild(notification);
  
  // Activar animación de entrada
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remover después de 4 segundos
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 4000);
}

// --- Manejo del modal de login (funciona en cualquier página) ---
document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');

  if (loginBtn && loginModal && closeModal) {
    loginBtn.onclick = function() {
      loginModal.style.display = 'block';
    };
    closeModal.onclick = function() {
      loginModal.style.display = 'none';
    };
    window.onclick = function(event) {
      if (event.target === loginModal) {
        loginModal.style.display = 'none';
      }
    };
  }
});

// Capturamos el formulario
const form = document.getElementById("formLogin");

// Escuchamos el evento "submit"
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // evita que la página se recargue

  // Obtener los valores escritos por el usuario
  const login = document.getElementById("login").value;
  const contrasena = document.getElementById("password").value;

  // Enviar los datos al servidor usando fetch + async/await
  try {
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cuenta: login, // nombre del campo esperado el backend
        contrasena: contrasena
      })
    });

    // Intentamos parsear el JSON (puede fallar si el servidor responde vacío)
    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      console.warn("Respuesta no JSON del servidor", parseErr);
      data = {};
    }

    // Revisar la respuesta
    if (res.ok) {
      const cuenta = data.usuario?.cuenta;
      if (cuenta) {
        // Notificación de éxito
        showNotification('success', 'Acceso Permitido', `Bienvenido, ${cuenta}!`);
        console.log("Usuario recibido:", data.usuario);
        
        // mostrar el nombre junto al candado
        const userNameSpan = document.getElementById('userName');
        if (userNameSpan) userNameSpan.textContent = cuenta;
        
        // cerrar modal automáticamente
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        
        // limpiar los campos del formulario
        const loginInput = document.getElementById("login");
        const passInput = document.getElementById("password");
        if (loginInput) loginInput.value = "";
        if (passInput) passInput.value = "";
      } else {
        // Caso inesperado: 200 OK pero sin usuario en body
        console.warn('200 OK sin usuario:', data);
        showNotification('error', 'Error del Servidor', 'Respuesta incompleta del servidor');
      }
    } else {
      // Respuesta de error: mostrar mensaje si viene en el body
      const errorMsg = data?.error || 'Credenciales incorrectas';
      showNotification('error', 'Acceso Denegado', errorMsg);
      
      // limpiar los campos del formulario tras error
      const loginInput = document.getElementById("login");
      const passInput = document.getElementById("password");
      if (loginInput) loginInput.value = "";
      if (passInput) passInput.value = "";
    }

  } catch (err) {
    console.error("Error al conectar con el servidor:", err);
    showNotification('error', 'Error de Conexión', 'No se pudo conectar con el servidor');
  }
});