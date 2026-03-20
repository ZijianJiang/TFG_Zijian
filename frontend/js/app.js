async function generate(){

const data = {
  niche: document.getElementById("niche").value,
  audience: document.getElementById("audience").value,
  platform: document.getElementById("platform").value,
  goal: document.getElementById("goal").value,
  style: document.getElementById("style").value
}

const response = await fetch("http://localhost:3000/generate-script",{
  method:"POST",
  headers:{
    "Content-Type":"application/json"
  },
  body: JSON.stringify(data)
})

const result = await response.json()

console.log(result) // para ver que llega

document.getElementById("result").innerText = result.script

}

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar')
  const sidebarToggle = document.getElementById('sidebarToggle')
  const newScript = document.getElementById('newScript')
  const registerBtn = document.getElementById('registerBtn')
  const loginBtn = document.getElementById('loginBtn')
  const sidebarLoginBtn = document.getElementById('sidebarLoginBtn')
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn')
  const sidebarFooterLoggedOut = document.getElementById('sidebarFooterLoggedOut')
  const sidebarFooterLogged = document.getElementById('sidebarFooterLogged')
  const usernameDisplay = document.getElementById('usernameDisplay')
  const unsavedModal = document.getElementById('unsavedModal')
  const modalLogin = document.getElementById('modalLogin')
  const modalRegister = document.getElementById('modalRegister')
  const modalDiscard = document.getElementById('modalDiscard')
  

  // Toggle between collapsed and open. Default is collapsed (sidebar has class 'collapsed').
  sidebarToggle.addEventListener('click', (e) => {
    e.stopPropagation()
    const wasOpen = sidebar.classList.contains('open')
    if (wasOpen) {
      sidebar.classList.remove('open')
      sidebar.classList.add('collapsed')
      sidebarToggle.setAttribute('aria-expanded', 'false')
      sidebar.setAttribute('aria-hidden', 'false')
    } else {
      sidebar.classList.add('open')
      sidebar.classList.remove('collapsed')
      sidebarToggle.setAttribute('aria-expanded', 'true')
      sidebar.setAttribute('aria-hidden', 'false')
    }
  })

  // --- Basic auth / session management (client-side simulation) ---
  function isLogged() {
    return !!localStorage.getItem('token')
  }

  function updateAuthUI() {
    const logged = isLogged()
    const username = localStorage.getItem('username')
    if (logged) {
      loginBtn.style.display = 'none'
      registerBtn.style.display = 'none'
      if (sidebarFooterLoggedOut) sidebarFooterLoggedOut.style.display = 'none'
      if (sidebarFooterLogged) sidebarFooterLogged.style.display = 'block'
      if (usernameDisplay) usernameDisplay.innerText = username
    } else {
      loginBtn.style.display = ''
      registerBtn.style.display = ''
      if (sidebarFooterLoggedOut) sidebarFooterLoggedOut.style.display = 'block'
      if (sidebarFooterLogged) sidebarFooterLogged.style.display = 'none'
    }
  }

  async function doLoginPayload(username, password) {
    try {
      const resp = await fetch('http://localhost:3000/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'login failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      updateAuthUI()
      return true
    } catch (e) {
      alert('Error de login: ' + e.message)
      return false
    }
  }

  async function doRegisterPayload(username, password) {
    try {
      const resp = await fetch('http://localhost:3000/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'register failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      updateAuthUI()
      return true
    } catch (e) {
      alert('Error de registro: ' + e.message)
      return false
    }
  }

  function doLogout() {
    localStorage.removeItem('username')
    localStorage.removeItem('token')
    updateAuthUI()
  }

  // Wire auth navigation buttons to dedicated pages
  loginBtn.addEventListener('click', (e) => { e.preventDefault(); location.href = 'login.html' })
  registerBtn.addEventListener('click', (e) => { e.preventDefault(); location.href = 'register.html' })
  if (sidebarLoginBtn) sidebarLoginBtn.addEventListener('click', (e) => { e.preventDefault(); location.href = 'login.html' })
  if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); doLogout() })

  // (Guardar eliminado — funcionalidad de guardar removida por ahora)

  // Initialize UI according to auth state
  updateAuthUI()

  function clearForNewScript() {
    ;['niche','audience','platform','goal','style'].forEach(id => {
      const el = document.getElementById(id)
      if (el) el.value = ''
    })
    const res = document.getElementById('result')
    if (res) res.innerText = ''
    sidebar.classList.remove('open')
    document.getElementById('niche')?.focus()
  }

  newScript.addEventListener('click', () => {
    // If there's a generated script and user is not logged, warn before clearing
    const res = document.getElementById('result')
    const hasScript = res && res.innerText && res.innerText.trim().length > 0
    if (hasScript && !isLogged()) {
      // show modal if present
      if (unsavedModal) {
        unsavedModal.classList.add('open')
        unsavedModal.setAttribute('aria-hidden', 'false')
      } else {
        // fallback: confirmation dialog
        const ok = confirm('Vas a perder el guión actual. Inicia sesión para que se guarde. ¿Quieres iniciar sesión ahora?')
        if (ok) location.href = 'login.html'
        else clearForNewScript()
      }
      return
    }
    clearForNewScript()
  })

  // Modal button handlers (if modal exists)
  if (modalLogin) modalLogin.addEventListener('click', () => { location.href = 'login.html' })
  if (modalRegister) modalRegister.addEventListener('click', () => { location.href = 'register.html' })
  if (modalDiscard) modalDiscard.addEventListener('click', () => {
    if (unsavedModal) {
      unsavedModal.classList.remove('open')
      unsavedModal.setAttribute('aria-hidden', 'true')
    }
    clearForNewScript()
  })
})
