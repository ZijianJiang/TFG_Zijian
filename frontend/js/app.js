// Validation bubble helpers (global so generate() can use them)
function clearValidationBubbles() {
  // Fade-out bubbles before removing to avoid abrupt disappearance.
  document.querySelectorAll('.validation-bubble').forEach((n) => {
    try {
      n.style.opacity = '0'
      n.style.transform = 'translateY(4px)'
      setTimeout(() => { try { n.remove() } catch (e) {} }, 160)
    } catch (e) {
      try { n.remove() } catch (e2) {}
    }
  })
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'))
  document.querySelectorAll('.tags-box.error').forEach(el => el.classList.remove('error'))
}

function showValidationBubble(targetEl, message) {
  if (!targetEl) return
  clearValidationBubbles()
  // clear previous auto-close timer if any
  if (window.__validationAutoCloseId) { clearTimeout(window.__validationAutoCloseId); window.__validationAutoCloseId = null }
  // highlight element
  let anchorEl = targetEl
  if (targetEl.classList && targetEl.classList.contains('tags')) {
    // target is inner .tags; highlight and position using parent .tags-box
    const box = targetEl.closest('.tags-box')
    if (box) {
      box.classList.add('error')
      anchorEl = box
    }
  } else if (targetEl.tagName === 'SELECT' || targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA') {
    targetEl.classList.add('input-error')
  }
  // scroll anchor into view (center) then position bubble
  try { anchorEl.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch (e) { anchorEl.scrollIntoView() }
  const bubble = document.createElement('div')
  bubble.className = 'validation-bubble'
  bubble.textContent = message
  // Avoid a visible "flash" at (0,0) before we calculate the final position.
  bubble.style.visibility = 'hidden'
  bubble.style.opacity = '0'
  bubble.style.left = '0px'
  bubble.style.top = '0px'
  document.body.appendChild(bubble)
  // position after a short delay so smooth scroll can settle
  setTimeout(() => {
    const rect = anchorEl.getBoundingClientRect()
    const gap = 8
    const placeAboveTop = window.scrollY + rect.top - bubble.offsetHeight - 12
    const placeBelowTop = window.scrollY + rect.bottom + 10

    const viewportLeft = window.scrollX
    const viewportRight = window.scrollX + window.innerWidth

    let top = placeAboveTop
    let isBelow = false
    if (top < window.scrollY + 4) {
      top = placeBelowTop
      isBelow = true
    }

    // Start from the input's left edge, then clamp bubble inside viewport.
    let left = window.scrollX + rect.left
    const minLeft = viewportLeft + gap
    const maxLeft = viewportRight - bubble.offsetWidth - gap
    left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft))

    bubble.classList.toggle('below', isBelow)
    bubble.style.top = top + 'px'
    bubble.style.left = left + 'px'
    bubble.style.visibility = 'visible'
    bubble.style.opacity = '1'
  }, 220)

  // auto-close after 3s
  window.__validationAutoCloseId = setTimeout(() => {
    clearValidationBubbles()
    window.__validationAutoCloseId = null
  }, 3000)

  // remove on input/change (also clear auto-close)
  const remover = () => { clearValidationBubbles(); if (window.__validationAutoCloseId) { clearTimeout(window.__validationAutoCloseId); window.__validationAutoCloseId = null } }
  if (targetEl.addEventListener) {
    targetEl.addEventListener('input', remover, { once: true })
    targetEl.addEventListener('change', remover, { once: true })
  }
}

function getStepForElement(targetEl) {
  if (!targetEl) return null
  const mapById = {
    niche: 1,
    audience: 1,
    dominantType: 1,
    offer: 1,
    situations: 1,
    desiredResult: 1,
    duration: 2,
    tone: 2,
    style: 2,
    extraContext: 2,
    objectiveTags: 3,
    enfoqueTags: 3,
    platformTags: 3,
    numberOfIdeas: 3
  }
  return mapById[targetEl.id] || null
}

function getApiBaseUrl() {
  // Prefer an explicit override when the app is served through a proxy or custom host.
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    return String(window.__API_BASE_URL__).replace(/\/$/, '')
  }

  // If the frontend is opened from file://, relative URLs fail. Fall back to local backend.
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
    return 'http://127.0.0.1:3000'
  }

  // When frontend and backend share origin, use the current origin.
  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
    return window.location.origin.replace(/\/$/, '')
  }

  return 'http://127.0.0.1:3000'
}

function setGenerationButtonsDisabled(disabled) {
  document.querySelectorAll('button').forEach((button) => {
    if (button.id === 'generateBtn') return
    if (disabled) {
      if (button.dataset.prevDisabled === undefined) {
        button.dataset.prevDisabled = button.disabled ? '1' : '0'
      }
      button.disabled = true
      button.setAttribute('aria-disabled', 'true')
    } else if (button.dataset.prevDisabled !== undefined) {
      button.disabled = button.dataset.prevDisabled === '1'
      button.removeAttribute('aria-disabled')
      delete button.dataset.prevDisabled
    }
  })
}

function getCurrentFormState() {
  return {
    niche: document.getElementById('niche')?.value || '',
    audience: document.getElementById('audience')?.value || '',
    dominantType: document.getElementById('dominantType')?.value || '',
    offer: document.getElementById('offer')?.value || '',
    situations: document.getElementById('situations')?.value || '',
    desiredResult: document.getElementById('desiredResult')?.value || '',
    duration: document.getElementById('duration')?.value || '',
    tone: document.getElementById('tone')?.value || '',
    style: document.getElementById('style')?.value || '',
    extraContext: document.getElementById('extraContext')?.value || document.getElementById('notasAdicionales')?.value || document.getElementById('additionalNotes')?.value || '',
    objective: [...(window.__objectiveSelected || [])],
    enfoque: [...(window.__enfoqueSelected || [])],
    platform: [...(window.__platformSelected || [])],
    numberOfIdeas: document.getElementById('numberOfIdeas')?.value || '1'
  }
}

function restoreFormState(state) {
  if (!state) return
  const setValue = (id, value) => {
    const el = document.getElementById(id)
    if (el) el.value = value ?? ''
  }

  setValue('niche', state.niche)
  setValue('audience', state.audience)
  setValue('dominantType', state.dominantType)
  setValue('offer', state.offer)
  setValue('situations', state.situations)
  setValue('desiredResult', state.desiredResult)
  setValue('duration', state.duration)
  setValue('tone', state.tone)
  setValue('style', state.style)
  setValue('extraContext', state.extraContext)
  setValue('notasAdicionales', state.extraContext)
  setValue('additionalNotes', state.extraContext)
  setValue('numberOfIdeas', state.numberOfIdeas)

  window.__objectiveSelected = [...(state.objective || [])]
  window.__enfoqueSelected = [...(state.enfoque || [])]
  window.__platformSelected = [...(state.platform || [])]

  const platformTags = document.getElementById('platformTags')
  const objectiveTags = document.getElementById('objectiveTags')
  const enfoqueTags = document.getElementById('enfoqueTags')
  renderTags(platformTags, window.__platformSelected)
  renderTags(objectiveTags, window.__objectiveSelected)
  renderTags(enfoqueTags, window.__enfoqueSelected)
}

function capitalizeTagLabel(value) {
  if (!value || typeof value !== 'string') return value
  if (value === 'auto') return 'Auto'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function renderTags(container, list) {
  if (!container) return
  container.innerHTML = ''
  if (!list || list.length === 0) {
    const placeholder = document.createElement('div')
    placeholder.className = 'tag-placeholder'
    placeholder.textContent = 'Ninguna selección'
    container.appendChild(placeholder)
    if (typeof updateTagControls === 'function') updateTagControls()
    if (typeof window.__refreshWizardHeight === 'function') window.__refreshWizardHeight()
    return
  }

  list.forEach((value, i) => {
    const span = document.createElement('span')
    span.className = 'tag'
    span.setAttribute('role', 'listitem')
    span.setAttribute('tabindex', '0')

    if (i === 0) span.classList.add('primary')
    if (value === 'auto') span.classList.add('tag-auto')

    const label = document.createElement('span')
    label.className = 'tag-label'
    label.textContent = capitalizeTagLabel(value)

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'remove'
    btn.setAttribute('aria-label', `Eliminar ${value}`)
    btn.textContent = '×'

    span.appendChild(label)
    span.appendChild(btn)
    container.appendChild(span)
  })

  if (typeof updateTagControls === 'function') updateTagControls()
  if (typeof window.__refreshWizardHeight === 'function') window.__refreshWizardHeight()
}

function syncEditModeUI(isEditing) {
  window.__isEditingInputs = !!isEditing
  const cancelBtn = document.getElementById('cancelEditBtn')
  if (cancelBtn) cancelBtn.style.display = isEditing ? '' : 'none'
}

function enterEditInputsMode() {
  const snapshot = window.__lastGeneratedState?.form || getCurrentFormState()
  window.__editSnapshot = JSON.parse(JSON.stringify(snapshot))
  restoreFormState(window.__editSnapshot)
  // Use the existing view switcher so the wizard is guaranteed visible.
  exitScriptView()

  const wizard = document.getElementById('wizardShell')
  if (typeof window.__goToStep === 'function') window.__goToStep(1)

  if (wizard && wizard.scrollIntoView) {
    wizard.scrollIntoView({ behavior: 'auto', block: 'start' })
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  window.requestAnimationFrame(() => {
    document.getElementById('niche')?.focus()
  })

  syncEditModeUI(true)
}

function cancelEditInputsMode() {
  const lastState = window.__editSnapshot || window.__lastGeneratedState?.form
  if (lastState) restoreFormState(lastState)
  syncEditModeUI(false)
  window.__editSnapshot = null
  if (window.__lastGeneratedState) {
    window.__lastGeneratedState.form = lastState ? JSON.parse(JSON.stringify(lastState)) : window.__lastGeneratedState.form
  }
  enterScriptView(window.__lastGeneratedState?.script || '')
  setHtmlViewOpen(true)
  const resultView = document.getElementById('scriptView')
  if (resultView && resultView.scrollIntoView) {
    resultView.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

window.enterEditInputsMode = enterEditInputsMode
window.cancelEditInputsMode = cancelEditInputsMode

async function generate(){
  // clear old validation UI
  clearValidationBubbles()

  // required fields
  const nicheEl = document.getElementById('niche')
  const audienceEl = document.getElementById('audience')
  const objectiveTagsEl = document.getElementById('objectiveTags')
  const platformTagsEl = document.getElementById('platformTags')
  const nicheVal = (nicheEl?.value || '').trim()
  const audienceVal = (audienceEl?.value || '').trim()
  const objectiveArr = window.__objectiveSelected || []
  const platformArr = window.__platformSelected || []
  const missing = []
  if (!nicheVal) missing.push({el: nicheEl, msg: 'El campo "Nicho" es obligatorio.'})
  if (!audienceVal) missing.push({el: audienceEl, msg: 'El campo "Audiencia" es obligatorio.'})
  if (!objectiveArr || objectiveArr.length === 0) missing.push({el: objectiveTagsEl, msg: 'El campo "Objetivo global" es obligatorio.'})
  if (!platformArr || platformArr.length === 0) missing.push({el: platformTagsEl, msg: 'El campo "Plataforma" es obligatorio.'})
  if (missing.length) {
    const step = getStepForElement(missing[0].el)
    if (step && typeof window.__goToStep === 'function') {
      window.__goToStep(step)
    }
    // show only the first missing as bubble and center it
    setTimeout(() => showValidationBubble(missing[0].el, missing[0].msg), 220)
    // focus first missing
    if (missing[0].el && missing[0].el.focus) missing[0].el.focus()
    return
  }

  const data = {
    niche: document.getElementById("niche").value,
    audience: document.getElementById("audience").value,
    dominantType: document.getElementById("dominantType")?.value,
    offer: document.getElementById("offer")?.value,
    situations: document.getElementById("situations")?.value,
    desiredResult: document.getElementById("desiredResult")?.value,
    duration: document.getElementById("duration")?.value,
    tone: document.getElementById("tone")?.value,
    style: document.getElementById("style")?.value,
    extraContext: document.getElementById("extraContext")?.value || document.getElementById("notasAdicionales")?.value || document.getElementById("additionalNotes")?.value,
    objective: window.__objectiveSelected || [],
    enfoque: window.__enfoqueSelected || [],
    platform: window.__platformSelected || [],
    numberOfIdeas: parseInt(document.getElementById("numberOfIdeas")?.value || '1', 10),
    // backward compatibility
    goal: (window.__objectiveSelected && window.__objectiveSelected[0]) || ''
  }

  const generateBtn = document.getElementById('generateBtn') || document.querySelector('.form-row button.primary')
  const spinner = generateBtn ? generateBtn.querySelector('.btn-spinner') : null
  if (generateBtn) {
    generateBtn.disabled = true; generateBtn.setAttribute('aria-busy', 'true')
    if (spinner) { spinner.style.display = 'inline-block' }
  }
  setGenerationButtonsDisabled(true)
  syncEditModeUI(false)

  // Show script view and hide form rows so user can focus on the output
  enterScriptView('Generando…\n')

  const scriptEditorEl = document.getElementById('scriptEditor')
  if (scriptEditorEl) {
    scriptEditorEl.readOnly = true
    scriptEditorEl.style.fontFamily = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
  }

  // Chat-like UI: show user message and assistant typing bubble
  const resultContainer = document.getElementById('result')
  resultContainer.innerHTML = ''
  resultContainer.classList.add('chat')

  const userMsg = document.createElement('div')
  userMsg.className = 'message user'
  userMsg.textContent = `Generando guión — Nicho: ${data.niche || ''}`
  resultContainer.appendChild(userMsg)

  const assistantMsg = document.createElement('div')
  assistantMsg.className = 'message assistant'
  // header with avatar + meta
  const header = document.createElement('div')
  header.className = 'msg-header'
  const avatar = document.createElement('div')
  avatar.className = 'msg-avatar'
  avatar.textContent = 'A'
  const meta = document.createElement('div')
  meta.className = 'msg-meta'
  const role = document.createElement('div')
  role.className = 'msg-role'
  role.textContent = 'Asistente'
  const ts = document.createElement('div')
  ts.className = 'msg-timestamp'
  ts.textContent = new Date().toLocaleTimeString()
  meta.appendChild(role); meta.appendChild(ts)
  header.appendChild(avatar); header.appendChild(meta)
  assistantMsg.appendChild(header)
  const typing = document.createElement('span')
  typing.className = 'typing'
  typing.innerHTML = '<span></span><span></span><span></span>'
  assistantMsg.appendChild(typing)
  resultContainer.appendChild(assistantMsg)

  const scrollGenerationView = () => {
    try {
      if (scriptEditorEl) scriptEditorEl.scrollTop = scriptEditorEl.scrollHeight
      if (assistantMsg && assistantMsg.scrollIntoView) {
        assistantMsg.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
      if (resultContainer && resultContainer.scrollIntoView) {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    } catch (e) {
      try {
        if (scriptEditorEl) scriptEditorEl.scrollTop = scriptEditorEl.scrollHeight
      } catch (e2) {}
    }
  }

  try {
    const streamUrl = `${getApiBaseUrl()}/generate-script/stream`
    const resp = await fetch(streamUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    })

    if (!resp.ok) {
      const errText = await resp.text()
      assistantMsg.innerHTML = ''
      assistantMsg.textContent = 'Error al generar: ' + errText
      showToast('Error al generar: ' + errText, 'error')
      if (scriptEditorEl) scriptEditorEl.value = 'Error al generar:\n' + errText
      return
    }

    // If streaming isn't available (some environments), fallback to full text.
    const sanitizeOutput = (value) => (value || '')
      .replace(/^\s*---\s*$/gm, '')
      .replace(/\[object Object\]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trimStart()

    if (!resp.body || !resp.body.getReader) {
      const full = await resp.text()
      if (scriptEditorEl) {
        scriptEditorEl.value = sanitizeOutput(full)
        scrollGenerationView()
      }
      return
    }

    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let done = false
    // remove typing animation and prepare a container for streaming text (keep header)
    // remove typing element if present
    const existingTyping = assistantMsg.querySelector('.typing')
    if (existingTyping) existingTyping.remove()
    const streamDiv = document.createElement('div')
    streamDiv.style.whiteSpace = 'pre-wrap'
    assistantMsg.appendChild(streamDiv)

    // also update script editor in real-time
    const scriptEditor = document.getElementById('scriptEditor')
    let didClearEditor = false

    while (!done) {
      const { value, done: d } = await reader.read()
      done = d
      if (value) {
        const chunk = decoder.decode(value)
        streamDiv.textContent += chunk
        // append to editor if present
        if (scriptEditor) {
          if (!didClearEditor) {
            scriptEditor.value = ''
            didClearEditor = true
          }
          scriptEditor.value += chunk
          scriptEditor.scrollTop = scriptEditor.scrollHeight
        }
        // auto-scroll
        scrollGenerationView()
      }
    }

    // after streaming finishes, ensure script view shows full text
    const finalText = sanitizeOutput(document.getElementById('scriptEditor')?.value || streamDiv.textContent || '')
    // populate assistant bubble as final (keep for history)
    // (optional) assistantMsg.innerHTML = '<div style="white-space:pre-wrap">' + finalText + '</div>'
    // ensure editor has final content
    if (document.getElementById('scriptEditor')) document.getElementById('scriptEditor').value = finalText
    scrollGenerationView()
    window.__lastGeneratedState = {
      form: getCurrentFormState(),
      script: finalText
    }

    // Default to the block layout once generation is complete
    if (finalText.trim()) {
      setHtmlViewOpen(true)
    }

    saveCurrentScriptToHistory()

  } catch (err) {
    const message = err && err.message ? err.message : 'No se pudo conectar con el servidor'
    assistantMsg.innerHTML = ''
    assistantMsg.textContent = 'Error al generar: ' + message
    showToast('Error al generar: ' + message, 'error')
    if (scriptEditorEl) scriptEditorEl.value = 'Error al generar:\n' + message
  } finally {
    if (generateBtn) {
      generateBtn.disabled = false; generateBtn.setAttribute('aria-busy', 'false')
      if (spinner) spinner.style.display = 'none'
    }
    setGenerationButtonsDisabled(false)
  }

}

// Small toast helper
function showToast(message, type) {
  try {
    const container = document.getElementById('toasts') || (function(){ const c=document.createElement('div'); c.id='toasts'; c.className='toasts'; document.body.appendChild(c); return c })()
    const t = document.createElement('div')
    t.className = 'toast ' + (type === 'error' ? 'error' : (type === 'success' ? 'success' : ''))
    t.textContent = message
    container.appendChild(t)
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(6px)' }, 2800)
    setTimeout(() => { t.remove() }, 3200)
  } catch (e) { console.warn('toast failed', e) }
}

// downloadFile helper removed (download button was removed from UI)

// Show the script view (hide other form rows) and set initial text
function enterScriptView(initialText) {
  const wizard = document.getElementById('wizardShell')
  const cardActions = document.querySelector('.card-actions')
  if (wizard) wizard.style.display = 'none'
  if (cardActions) cardActions.style.display = 'none'
  const view = document.getElementById('scriptView')
  if (view) {
    view.style.display = 'block'
    view.classList.remove('is-open')
    requestAnimationFrame(() => view.classList.add('is-open'))
  }
  const editor = document.getElementById('scriptEditor')
  const htmlView = document.getElementById('scriptHtmlView')
  const toggleBtn = document.getElementById('toggleHtmlView')
  if (htmlView) htmlView.style.display = 'none'
  if (editor) {
    editor.readOnly = true
    editor.style.display = 'block'
    editor.value = initialText || ''
    editor.focus()
  }
  if (toggleBtn) {
    toggleBtn.textContent = 'Ver HTML'
    toggleBtn.setAttribute('aria-pressed', 'false')
  }
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function renderScriptHtml(text) {
  const root = document.getElementById('scriptHtmlView')
  if (!root) return
  const raw = (text || '')
    .replace(/^\s*---\s*$/gm, '')
    .replace(/\[object Object\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  if (!raw) {
    root.innerHTML = '<div class="script-grid"><div class="script-block"><div class="block-body">(Vacío)</div></div></div>'
    return
  }

  const labelToKey = {
    'TIPO': 'type',
    'OBJETIVO PRINCIPAL': 'mainObjective',
    'HOOK': 'hook',
    'IDEA': 'idea',
    'DESARROLLO': 'development',
    'ELEMENTOS DE DINAMISMO': 'dynamics',
    'CTA': 'cta',
    'FORMATO': 'format',
    'SCRIPT': 'script',
    'VISUALS': 'visuals',
    'TITLE': 'title',
    'HASHTAGS': 'hashtags'
  }

  const normalizeLabel = (label) => (label || '')
    .replace(/[\*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()

  const splitIdeaBlocks = (content) => {
    const lines = content.split(/\r?\n/)
    const headingRegex = /^#{2,6}\s*IDEA\s*\d+\s*:?.*$/i
    const blocks = []
    let current = { title: '', lines: [] }

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed === '---') continue
      if (headingRegex.test(trimmed)) {
        if (current.title || current.lines.length) blocks.push(current)
        current = {
          title: trimmed.replace(/^#{2,6}\s*/i, '').replace(/:\s*$/, '').trim(),
          lines: []
        }
        continue
      }
      current.lines.push(line)
    }

    if (current.title || current.lines.length) blocks.push(current)
    return blocks.length ? blocks : [{ title: '', lines: lines }]
  }

  const parseBlock = (blockLines) => {
    const sections = { type: [], mainObjective: [], hook: [], idea: [], development: [], dynamics: [], cta: [], format: [], script: [], visuals: [], title: [], hashtags: [] }
    let currentKey = null

    for (const line of blockLines) {
      const trimmed = line.trim()
      if (!trimmed) {
        if (currentKey) sections[currentKey].push('')
        continue
      }

      const match = trimmed.match(/^(?:[-*]\s*)?(?:\*\*|__)?([^:]+?)(?:\*\*|__)?\s*:\s*(.*)$/)
      if (match) {
        const key = labelToKey[normalizeLabel(match[1])]
        if (key) {
          currentKey = key
          if (match[2]) sections[key].push(match[2])
          continue
        }
      }

      if (currentKey) {
        sections[currentKey].push(line)
      } else {
        sections.script.push(line)
      }
    }

    return sections
  }

  const renderBody = (body) => escapeHtml((body || []).join('\n').trim())

  const renderCard = (label, body, opts = {}) => {
    const content = renderBody(body)
    if (!content) return ''
    const classes = ['script-block']
    if (opts.className) classes.push(opts.className)
    if (opts.emphasis) classes.push('is-emphasis')
    return `<section class="${classes.join(' ')}"><div class="block-label">${escapeHtml(label)}</div><div class="block-body">${content}</div></section>`
  }

  const renderHashtagCard = (body) => {
    const text = (body || []).join('\n').trim()
    if (!text) return ''
    const tags = (text.match(/#[^\s#]+/g) || []).map((t) => t.trim()).filter(Boolean)
    const unique = Array.from(new Set(tags))
    const chips = unique.map((t) => `<span class="hash">${escapeHtml(t)}</span>`).join('')
    const fallback = escapeHtml(text)
    return `<section class="script-block hashtags"><div class="block-label">HASHTAGS</div><div class="block-body">${unique.length ? `<div class="hash-list">${chips}</div>` : fallback}</div></section>`
  }

  const renderCardsForSections = (sections) => {
    return [
      renderCard('TIPO', sections.type),
      renderCard('OBJETIVO PRINCIPAL', sections.mainObjective, { emphasis: true }),
      renderCard('HOOK', sections.hook, { emphasis: true }),
      renderCard('IDEA', sections.idea),
      renderCard('DESARROLLO', sections.development, { className: 'script' }),
      renderCard('ELEMENTOS DE DINAMISMO', sections.dynamics),
      renderCard('CTA', sections.cta, { emphasis: true }),
      renderCard('FORMATO', sections.format),
      renderCard('SCRIPT', sections.script, { className: 'script' }),
      renderCard('VISUALS', sections.visuals),
      renderCard('TITLE', sections.title),
      renderHashtagCard(sections.hashtags)
    ].filter(Boolean).join('')
  }

  const ideaBlocks = splitIdeaBlocks(raw)
  const isMultiIdea = ideaBlocks.length > 1 || ideaBlocks.some((block) => block.title)

  if (isMultiIdea) {
    const html = ideaBlocks.map((block, index) => {
      const sections = parseBlock(block.lines)
      const cards = renderCardsForSections(sections)
      if (!cards) return ''
      const title = block.title || `Idea ${index + 1}`
      return `<article class="idea-group"><div class="idea-group-header"><div class="idea-group-title">${escapeHtml(title)}</div></div><div class="script-grid">${cards}</div></article>`
    }).filter(Boolean).join('')

    root.innerHTML = `<div class="ideas-stack">${html || '<div class="script-grid"><div class="script-block"><div class="block-body">(Vacío)</div></div></div>'}</div>`
    return
  }

  const sections = parseBlock(ideaBlocks[0].lines)
  const html = renderCardsForSections(sections)
  root.innerHTML = `<div class="script-grid">${html || '<div class="script-block"><div class="block-body">(Vacío)</div></div>'}</div>`
}

function getCurrentScriptText() {
  return (document.getElementById('scriptEditor')?.value || '').trim()
}

function setHtmlViewOpen(open) {
  const editor = document.getElementById('scriptEditor')
  const htmlView = document.getElementById('scriptHtmlView')
  const toggleBtn = document.getElementById('toggleHtmlView')
  if (!editor || !htmlView || !toggleBtn) return

  if (open) {
    renderScriptHtml(editor.value || '')
    editor.style.display = 'none'
    htmlView.style.display = 'block'
    toggleBtn.textContent = 'Ver texto'
    toggleBtn.setAttribute('aria-pressed', 'true')
  } else {
    htmlView.style.display = 'none'
    editor.style.display = 'block'
    toggleBtn.textContent = 'Ver HTML'
    toggleBtn.setAttribute('aria-pressed', 'false')
  }
}

async function downloadPdfFromScript() {
  const text = getCurrentScriptText()
  if (!text) {
    showToast('No hay guion para exportar.', 'error')
    return
  }

  const jsPdf = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null
  if (jsPdf) {
    const doc = new jsPdf({ unit: 'pt', format: 'a4' })
    const margin = 48
    const pageWidth = doc.internal.pageSize.getWidth()
    const maxWidth = pageWidth - margin * 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)

    const lines = doc.splitTextToSize(text, maxWidth)
    let y = margin
    const lineHeight = 16
    const pageHeight = doc.internal.pageSize.getHeight()
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += lineHeight
    }

    const safeName = ('ViralScript_' + new Date().toISOString().slice(0, 10)).replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    doc.save(safeName + '.pdf')
    return
  }

  // Fallback: open print dialog (user can Save as PDF)
  const w = window.open('', '_blank')
  if (!w) {
    showToast('Pop-up bloqueado. Permite pop-ups para guardar como PDF.', 'error')
    return
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>ViralScript</title>
  <style>body{font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.6;margin:24px;color:#111}</style>
  </head><body>${escapeHtml(text)}</body></html>`
  w.document.open(); w.document.write(html); w.document.close()
  w.focus()
  setTimeout(() => { try { w.print() } catch (e) {} }, 200)
}

// Restore form rows and hide script view
function exitScriptView() {
  const wizard = document.getElementById('wizardShell')
  const cardActions = document.querySelector('.card-actions')
  if (wizard) wizard.style.display = ''
  if (cardActions) cardActions.style.display = ''
  const view = document.getElementById('scriptView')
  if (view) {
    view.classList.remove('is-open')
    view.style.display = 'none'
  }
  // reset HTML/text toggle
  const htmlView = document.getElementById('scriptHtmlView')
  const editor = document.getElementById('scriptEditor')
  const toggleBtn = document.getElementById('toggleHtmlView')
  if (htmlView) htmlView.style.display = 'none'
  if (editor) editor.style.display = 'block'
  if (toggleBtn) {
    toggleBtn.textContent = 'Ver HTML'
    toggleBtn.setAttribute('aria-pressed', 'false')
  }
  if (typeof window.__goToStep === 'function') window.__goToStep(1)
  document.getElementById('niche')?.focus()
}

function getScriptHistoryStorageKey() {
  const username = (localStorage.getItem('username') || 'guest').trim().toLowerCase()
  return `viralScript_history_${username || 'guest'}`
}

function isUserLogged() {
  return !!localStorage.getItem('token')
}

function readScriptHistory() {
  try {
    const raw = localStorage.getItem(getScriptHistoryStorageKey())
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch (e) {
    return []
  }
}

function writeScriptHistory(items) {
  try {
    localStorage.setItem(getScriptHistoryStorageKey(), JSON.stringify(items.slice(0, 12)))
  } catch (e) {}
}

function buildScriptHistoryTitle(state, script) {
  const niche = (state?.niche || '').trim()
  const audience = (state?.audience || '').trim()
  const primaryObjective = Array.isArray(state?.objective) && state.objective.length ? String(state.objective[0]) : ''
  const platform = Array.isArray(state?.platform) && state.platform.length ? String(state.platform[0]) : ''
  const titleParts = []

  if (niche) titleParts.push(niche)
  else if (audience) titleParts.push(audience)
  if (primaryObjective) titleParts.push(primaryObjective)
  if (platform && titleParts.length < 2) titleParts.push(platform)

  const title = titleParts.filter(Boolean).join(' · ').trim()
  if (title) return title.slice(0, 70)

  const firstLine = String(script || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line)

  return (firstLine || 'Guión nuevo').slice(0, 70)
}

function renderScriptHistory() {
  const section = document.getElementById('scriptHistorySection')
  const listEl = document.getElementById('scriptHistoryList')
  if (!section || !listEl) return

  if (!isUserLogged()) {
    section.style.display = 'none'
    listEl.innerHTML = ''
    section.classList.add('empty')
    return
  }

  const emptyEl = document.getElementById('scriptHistoryEmpty')
  const history = readScriptHistory()
  section.style.display = ''
  listEl.innerHTML = ''
  section.classList.toggle('empty', history.length === 0)
  if (emptyEl) emptyEl.textContent = history.length ? '' : 'Aún no has generado guiones.'

  const activeId = window.__activeScriptHistoryId || null
  const editingId = window.__editingScriptHistoryId || null
  history.forEach((entry) => {
    const item = document.createElement('li')
    const isMenuOpen = String(entry.id) === String(window.__openHistoryMenuId || '')
    item.className = 'sidebar-history-item chat-item' + (String(entry.id) === String(activeId) ? ' active' : '') + (String(entry.id) === String(editingId) ? ' is-editing' : '') + (isMenuOpen ? ' menu-open' : '')
    item.dataset.historyId = String(entry.id)

    const main = document.createElement('button')
    main.type = 'button'
    main.className = 'sidebar-history-main chat-main'
    main.setAttribute('data-history-open', 'true')

    const titleWrap = document.createElement('div')
    titleWrap.className = 'sidebar-history-title-wrap'

    const title = document.createElement('span')
    title.className = 'sidebar-history-title chat-title'
    title.textContent = entry.title || 'Guión nuevo'

    const meta = document.createElement('span')
    meta.className = 'sidebar-history-meta chat-date'
    const createdAt = entry.createdAt ? new Date(entry.createdAt) : null
    meta.textContent = createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
      : 'Guión guardado'

    titleWrap.appendChild(title)
    titleWrap.appendChild(meta)
    main.appendChild(titleWrap)

    if (String(entry.id) === String(editingId)) {
      const input = document.createElement('input')
      input.type = 'text'
      input.className = 'sidebar-history-edit'
      input.value = entry.title || ''
      input.maxLength = 70
      input.setAttribute('aria-label', 'Renombrar guión')
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          finishHistoryRename(entry.id, input.value)
        } else if (e.key === 'Escape') {
          e.preventDefault()
          cancelHistoryRename()
        }
      })
      input.addEventListener('blur', () => {
        if (window.__editingScriptHistoryId !== String(entry.id)) return
        finishHistoryRename(entry.id, input.value)
      })
      item.appendChild(input)
      window.requestAnimationFrame(() => input.focus())
    } else {
      item.appendChild(main)
    }

    const actions = document.createElement('div')
    actions.className = 'sidebar-history-actions'

    const menuButton = document.createElement('button')
    menuButton.type = 'button'
    menuButton.className = 'sidebar-history-menu-btn chat-actions-button'
    menuButton.setAttribute('aria-label', 'Acciones del guión')
    menuButton.textContent = '⋯'

    actions.appendChild(menuButton)
    item.appendChild(actions)
    listEl.appendChild(item)
  })
}

function removeHistoryMenuPortal() {
  const existing = document.getElementById('sidebarHistoryMenuPortal')
  if (existing) existing.remove()
}

function buildHistoryMenuPortal(entryId, anchorButton) {
  removeHistoryMenuPortal()

  const menu = document.createElement('div')
  menu.id = 'sidebarHistoryMenuPortal'
  menu.className = 'sidebar-history-menu open'
  menu.setAttribute('role', 'menu')
  menu.dataset.historyId = String(entryId)

  const mkMenuBtn = (label, action) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'sidebar-history-menu-item' + (action === 'delete' ? ' delete' : '')
    btn.setAttribute('role', 'menuitem')
    btn.dataset.action = action
    btn.textContent = label
    return btn
  }

  menu.appendChild(mkMenuBtn('Renombrar', 'rename'))
  menu.appendChild(mkMenuBtn('Duplicar', 'duplicate'))
  menu.appendChild(mkMenuBtn('Eliminar', 'delete'))

  document.body.appendChild(menu)

  const rect = anchorButton.getBoundingClientRect()
  const menuWidth = 180
  const menuHeight = menu.getBoundingClientRect().height || 126
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const left = Math.min(Math.max(8, rect.right - menuWidth), viewportWidth - menuWidth - 8)
  let top = rect.bottom + 8
  if (top + menuHeight > viewportHeight - 8) {
    top = Math.max(8, rect.top - menuHeight - 8)
  }

  menu.style.left = `${left}px`
  menu.style.top = `${top}px`

  requestAnimationFrame(() => menu.classList.add('open'))
  return menu
}

function closeHistoryMenus() {
  window.__openHistoryMenuId = null
  removeHistoryMenuPortal()
  document.querySelectorAll('.sidebar-history-item.menu-open').forEach((node) => node.classList.remove('menu-open'))
}

function cancelHistoryRename() {
  window.__editingScriptHistoryId = null
  renderScriptHistory()
}

function finishHistoryRename(entryId, rawTitle) {
  const title = String(rawTitle || '').trim().replace(/\s+/g, ' ')
  const history = readScriptHistory()
  const idx = history.findIndex((item) => String(item.id) === String(entryId))
  if (idx === -1) {
    cancelHistoryRename()
    return
  }

  history[idx].title = (title || history[idx].title || 'Guión nuevo').slice(0, 70)
  writeScriptHistory(history)
  window.__editingScriptHistoryId = null
  renderScriptHistory()
}

function renameHistoryEntry(entryId) {
  closeHistoryMenus()
  window.__editingScriptHistoryId = String(entryId)
  renderScriptHistory()
}

function duplicateHistoryEntry(entryId) {
  const history = readScriptHistory()
  const idx = history.findIndex((item) => String(item.id) === String(entryId))
  if (idx === -1) return
  const source = history[idx]
  const copy = {
    ...source,
    id: Date.now(),
    title: `${source.title || 'Guión nuevo'} - copia`
  }
  history.unshift(copy)
  writeScriptHistory(history)
  window.__activeScriptHistoryId = String(copy.id)
  renderScriptHistory()
}

function deleteHistoryEntry(entryId) {
  const history = readScriptHistory().filter((item) => String(item.id) !== String(entryId))
  writeScriptHistory(history)
  if (String(window.__activeScriptHistoryId) === String(entryId)) {
    window.__activeScriptHistoryId = null
  }
  renderScriptHistory()
}

function saveCurrentScriptToHistory() {
  const snapshot = window.__lastGeneratedState
  const script = String(snapshot?.script || document.getElementById('scriptEditor')?.value || '').trim()
  if (!script || !isUserLogged()) return null

  const form = snapshot?.form ? JSON.parse(JSON.stringify(snapshot.form)) : getCurrentFormState()
  const history = readScriptHistory()
  const normalizedScript = script.replace(/\s+/g, ' ').trim()
  const existingIndex = history.findIndex((entry) => String(entry.script || '').replace(/\s+/g, ' ').trim() === normalizedScript)

  const entry = {
    id: existingIndex > -1 ? history[existingIndex].id : Date.now(),
    title: buildScriptHistoryTitle(form, script),
    script,
    form,
    createdAt: existingIndex > -1 ? history[existingIndex].createdAt : new Date().toISOString()
  }

  if (existingIndex > -1) history.splice(existingIndex, 1)
  history.unshift(entry)
  writeScriptHistory(history)
  window.__activeScriptHistoryId = String(entry.id)
  renderScriptHistory()
  return entry
}

function openScriptHistoryEntry(entryId) {
  const history = readScriptHistory()
  const entry = history.find((item) => String(item.id) === String(entryId))
  if (!entry) return

  window.__activeScriptHistoryId = String(entry.id)
  window.__lastGeneratedState = {
    form: entry.form ? JSON.parse(JSON.stringify(entry.form)) : getCurrentFormState(),
    script: entry.script || ''
  }
  window.__editSnapshot = null
  restoreFormState(window.__lastGeneratedState.form)
  enterScriptView(window.__lastGeneratedState.script || '')
  setHtmlViewOpen(true)
  syncEditModeUI(false)
  if (typeof window.__goToStep === 'function') window.__goToStep(1)
  renderScriptHistory()
}

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar')
  const appShell = document.getElementById('appShell')
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
  const logoutConfirmModal = document.getElementById('logoutConfirmModal')
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn')
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn')
  const scriptHistoryList = document.getElementById('scriptHistoryList')

  // Stepper + slide setup
  const stepsViewport = document.querySelector('.steps-viewport')
  const stepsTrack = document.getElementById('stepsTrack')
  const stepNodes = document.querySelectorAll('.step-node')
  const wizardActionRows = document.querySelectorAll('.wizard-actions-row')
  const totalSteps = document.querySelectorAll('.step-panel').length || 3
  let currentStep = 1

  function updateWizardActions(step) {
    if (!wizardActionRows || !wizardActionRows.length) return
    const s = Number(step)
    wizardActionRows.forEach((row) => {
      const rowStep = Number(row.getAttribute('data-step'))
      row.style.display = rowStep === s ? '' : 'none'
    })
  }

  function syncSidebarLayout() {
    const isExpanded = sidebar && sidebar.classList.contains('open')
    document.body.classList.toggle('sidebar-expanded', !!isExpanded)
    document.body.classList.toggle('sidebar-collapsed', !isExpanded)
    if (appShell) {
      appShell.classList.toggle('sidebar-expanded', !!isExpanded)
      appShell.classList.toggle('sidebar-collapsed', !isExpanded)
      // Inline track update guarantees smooth width animation even with legacy CSS overrides.
      appShell.style.gridTemplateColumns = isExpanded ? '260px minmax(0, 1fr)' : '72px minmax(0, 1fr)'
    }
  }

  function validateStep(stepNumber) {
    const step = Number(stepNumber)
    if (step === 1) {
      const nicheEl = document.getElementById('niche')
      const audienceEl = document.getElementById('audience')
      const nicheVal = (nicheEl?.value || '').trim()
      const audienceVal = (audienceEl?.value || '').trim()
      if (!nicheVal) return { ok: false, el: nicheEl, msg: 'El campo "Nicho" es obligatorio.' }
      if (!audienceVal) return { ok: false, el: audienceEl, msg: 'El campo "Audiencia" es obligatorio.' }
      return { ok: true }
    }

    if (step === 3) {
      const objectiveTagsEl = document.getElementById('objectiveTags')
      const platformTagsEl = document.getElementById('platformTags')
      const objectiveArr = window.__objectiveSelected || []
      const platformArr = window.__platformSelected || []
      if (!objectiveArr || objectiveArr.length === 0) return { ok: false, el: objectiveTagsEl, msg: 'El campo "Objetivo global" es obligatorio.' }
      if (!platformArr || platformArr.length === 0) return { ok: false, el: platformTagsEl, msg: 'El campo "Plataforma" es obligatorio.' }
      return { ok: true }
    }

    // step 2 has no required fields
    return { ok: true }
  }

  function adjustWizardHeight(step) {
    if (!stepsViewport) return
    const panel = document.querySelector(`.step-panel[data-step="${step}"]`)
    const inner = panel ? panel.querySelector('.panel-inner') : null
    const h = inner ? inner.scrollHeight : (panel ? panel.scrollHeight : 0)
    if (h) stepsViewport.style.height = h + 'px'
  }

  function goToStep(step) {
    const nextStep = Math.max(1, Math.min(totalSteps, Number(step) || 1))
    currentStep = nextStep
    if (stepsTrack) {
      stepsTrack.style.transform = `translateX(-${(nextStep - 1) * 100}%)`
    }
    stepNodes.forEach((node, index) => {
      const nodeStep = index + 1
      const isActive = nodeStep === nextStep
      const isCompleted = nodeStep < nextStep
      node.classList.toggle('active', isActive)
      node.classList.toggle('completed', isCompleted)
      node.setAttribute('aria-selected', isActive ? 'true' : 'false')
    })

    // Resize the viewport to the current panel so tab 3 doesn't force extra whitespace.
    // Delay a tick so layout has settled after transform.
    setTimeout(() => adjustWizardHeight(nextStep), 0)

    // Update the action bar (kept outside panels)
    updateWizardActions(nextStep)

    // update progress bar (33%, 66%, 100% for 3 steps or proportional)
    try {
      const bar = document.getElementById('stepProgressBar')
      if (bar) {
        const pct = Math.round((nextStep / totalSteps) * 100)
        bar.style.width = pct + '%'
        bar.setAttribute('aria-valuenow', String(pct))
        bar.setAttribute('aria-valuemin', '0')
        bar.setAttribute('aria-valuemax', '100')
      }
    } catch (e) { /* ignore */ }
  }

  window.__goToStep = goToStep
  window.__refreshWizardHeight = () => adjustWizardHeight(currentStep)

  document.querySelectorAll('[data-next-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const check = validateStep(currentStep)
      if (!check.ok) {
        setTimeout(() => showValidationBubble(check.el, check.msg), 0)
        if (check.el && check.el.focus) check.el.focus()
        return
      }
      goToStep(btn.getAttribute('data-next-step'))
    })
  })

  document.querySelectorAll('[data-prev-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      goToStep(btn.getAttribute('data-prev-step'))
    })
  })

  stepNodes.forEach((node) => {
    node.addEventListener('click', () => {
      const target = Number(node.getAttribute('data-step'))
      if (!target || target === currentStep) return
      if (target < currentStep) {
        goToStep(target)
        return
      }

      // Moving forward: validate each step on the way (so you can't skip required fields).
      for (let s = currentStep; s < target; s++) {
        const check = validateStep(s)
        if (!check.ok) {
          goToStep(s)
          setTimeout(() => showValidationBubble(check.el, check.msg), 220)
          if (check.el && check.el.focus) check.el.focus()
          return
        }
      }

      goToStep(target)
    })
  })

  goToStep(1)

  // Keep height correct on resize and when content changes (tags, etc.)
  window.addEventListener('resize', () => adjustWizardHeight(currentStep))
  

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
    syncSidebarLayout()
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
    renderScriptHistory()
  }

  async function doLoginPayload(username, password) {
    try {
      const resp = await fetch(`${getApiBaseUrl()}/auth/login`, {
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
      const resp = await fetch(`${getApiBaseUrl()}/auth/register`, {
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
    window.__activeScriptHistoryId = null
    updateAuthUI()
    window.location.reload()
  }

  function openLogoutConfirmModal() {
    if (!logoutConfirmModal) {
      doLogout()
      return
    }
    logoutConfirmModal.classList.add('open')
    logoutConfirmModal.setAttribute('aria-hidden', 'false')
    setTimeout(() => {
      if (confirmLogoutBtn) confirmLogoutBtn.focus()
    }, 80)
  }

  function closeLogoutConfirmModal() {
    if (!logoutConfirmModal) return
    logoutConfirmModal.classList.remove('open')
    logoutConfirmModal.setAttribute('aria-hidden', 'true')
  }

  // Wire auth navigation buttons to dedicated pages
  loginBtn.addEventListener('click', (e) => { e.preventDefault(); location.href = 'login.html' })
  registerBtn.addEventListener('click', (e) => { e.preventDefault(); location.href = 'register.html' })
  if (sidebarLoginBtn) sidebarLoginBtn.addEventListener('click', (e) => { e.preventDefault(); location.href = 'login.html' })
  if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); openLogoutConfirmModal() })
  if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); closeLogoutConfirmModal() })
  if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', (e) => {
    e.preventDefault()
    closeLogoutConfirmModal()
    doLogout()
  })
  if (logoutConfirmModal) {
    logoutConfirmModal.addEventListener('click', (e) => {
      if (e.target === logoutConfirmModal) closeLogoutConfirmModal()
    })
  }

  // (Guardar eliminado — funcionalidad de guardar removida por ahora)

  // Initialize UI according to auth state
  updateAuthUI()
  syncSidebarLayout()
  renderScriptHistory()

  if (scriptHistoryList) {
    scriptHistoryList.addEventListener('click', (e) => {
      const menuBtn = e.target.closest('.sidebar-history-menu-btn')
      if (menuBtn) {
        e.preventDefault()
        e.stopPropagation()
        const item = menuBtn.closest('.sidebar-history-item')
        const historyId = item?.dataset.historyId
        const isOpen = String(window.__openHistoryMenuId || '') === String(historyId)
        closeHistoryMenus()
        if (!isOpen && historyId) {
          window.__openHistoryMenuId = String(historyId)
          item.classList.add('menu-open')
          const menu = buildHistoryMenuPortal(historyId, menuBtn)
          const actionButton = menu.querySelector('[data-action="rename"]')
          if (actionButton) actionButton.focus()
        }
        return
      }

      const openTrigger = e.target.closest('[data-history-open]')
      if (openTrigger) {
        const item = openTrigger.closest('.sidebar-history-item')
        const historyId = item?.dataset.historyId
        closeHistoryMenus()
        if (historyId) openScriptHistoryEntry(historyId)
      }
    })
  }

  document.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('.sidebar-history-menu-item')
    if (actionBtn) {
      e.preventDefault()
      e.stopPropagation()
      const historyId = actionBtn.closest('.sidebar-history-menu')?.dataset.historyId
      closeHistoryMenus()
      if (actionBtn.dataset.action === 'rename') renameHistoryEntry(historyId)
      if (actionBtn.dataset.action === 'duplicate') duplicateHistoryEntry(historyId)
      if (actionBtn.dataset.action === 'delete') deleteHistoryEntry(historyId)
      return
    }

    if (!e.target.closest('#scriptHistorySection')) closeHistoryMenus()
  })

  document.querySelector('#scriptHistoryList')?.addEventListener('scroll', closeHistoryMenus, { passive: true })
  window.addEventListener('resize', closeHistoryMenus)

  // Tag selection state
  window.__platformSelected = []
  window.__objectiveSelected = []
  // default to 'auto' enfoque
  window.__enfoqueSelected = ['auto']

  const platformSelect = document.getElementById('platformSelect')
  const platformTags = document.getElementById('platformTags')
  const objectiveSelect = document.getElementById('objectiveSelect')
  const objectiveTags = document.getElementById('objectiveTags')
  const enfoqueSelect = document.getElementById('enfoque')
  const enfoqueTags = document.getElementById('enfoqueTags')

  

  // render initial tag state (enfoque starts as ['auto'])
  renderTags(platformTags, window.__platformSelected)
  renderTags(objectiveTags, window.__objectiveSelected)
  renderTags(enfoqueTags, window.__enfoqueSelected)
  console.debug('initial enfoqueSelected:', window.__enfoqueSelected)

  function capitalizeLabel(val) {
    if (!val || typeof val !== 'string') return val
    if (val === 'auto') return 'Auto'
    return val.charAt(0).toUpperCase() + val.slice(1)
  }

  function renderTags(container, list) {
    if (!container) return
    container.innerHTML = ''
    if (!list || list.length === 0) {
      const placeholder = document.createElement('div')
      placeholder.className = 'tag-placeholder'
      placeholder.textContent = 'Ninguna selección'
      container.appendChild(placeholder)
      updateTagControls()
      if (typeof window.__refreshWizardHeight === 'function') window.__refreshWizardHeight()
      return
    }
    list.forEach((value, i) => {
      const span = document.createElement('span')
      span.className = 'tag'
      span.setAttribute('role', 'listitem')
      span.setAttribute('tabindex', '0')

      // mark primary (first) tag
      if (i === 0) span.classList.add('primary')
      // mark auto tag with a dedicated class for styling
      if (value === 'auto') span.classList.add('tag-auto')

      const label = document.createElement('span')
      label.className = 'tag-label'
      // show a nicer display and capitalize first letter for labels
      label.textContent = capitalizeLabel(value)

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'remove'
      btn.setAttribute('aria-label', 'Eliminar ' + value)
      btn.textContent = '✕'

      // if this is the auto placeholder, don't allow removing it
      if (value === 'auto') {
        btn.style.display = 'none'
      }

      // create star button (promote to primary)
      const star = document.createElement('button')
      star.type = 'button'
      star.className = 'star'
      star.setAttribute('aria-label', (i === 0 ? 'Prioritario' : 'Marcar como prioritario') + ' ' + value)
      star.textContent = (i === 0 ? '★' : '☆')

      // clicking the star promotes it to primary (hide for 'auto')
      if (value === 'auto') {
        star.style.display = 'none'
      } else {
        star.addEventListener('click', (e) => {
          e.stopPropagation()
          addPriority(list, value)
          renderTags(container, list)
        })
      }

        // clicking the tag (excluding star/remove) also promotes
        span.addEventListener('click', (e) => {
          if (e.target === btn || e.target === star) return
          addPriority(list, value)
          renderTags(container, list)
        })

      // keyboard support: Enter or Space promotes
      span.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          addPriority(list, value)
          renderTags(container, list)
        }
      })

      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const idx = list.indexOf(value)
        if (idx > -1) list.splice(idx, 1)
        // if list emptied, restore 'auto'
        if (list.length === 0) list.push('auto')
        renderTags(container, list)
      })

        span.appendChild(star)
      span.appendChild(label)
      span.appendChild(btn)
      container.appendChild(span)
    })
    updateTagControls()
    if (typeof window.__refreshWizardHeight === 'function') window.__refreshWizardHeight()
  }

  function updateTagControls() {
    // No-op for now; placeholder kept for future UX updates
  }

  function addPriority(list, value) {
    const idx = list.indexOf(value)
    if (idx > -1) list.splice(idx, 1)
    list.unshift(value)
  }

  if (platformSelect) {
    platformSelect.addEventListener('change', (e) => {
      let v = (e.target.value || '').trim()
      if (!v) return
      // allow unicode letters/numbers, spaces, hyphen, underscore, dot, comma
      const valid = /^[\p{L}\p{N} _\-\.,]+$/u.test(v)
      if (!valid) { alert('Plataforma no válida. Usa sólo letras, números, espacios y -_. ,'); platformSelect.selectedIndex = 0; return }
      // prevent duplicates (promote if exists)
      addPriority(window.__platformSelected, v)
      renderTags(platformTags, window.__platformSelected)
      platformSelect.selectedIndex = 0
    })
  }

  if (objectiveSelect) {
    objectiveSelect.addEventListener('change', (e) => {
      let v = (e.target.value || '').trim()
      if (!v) return
      const valid = /^[\p{L}\p{N} _\-\.,]+$/u.test(v)
      if (!valid) { alert('Objetivo no válido. Usa sólo letras, números y espacios.'); objectiveSelect.selectedIndex = 0; return }
      addPriority(window.__objectiveSelected, v)
      renderTags(objectiveTags, window.__objectiveSelected)
      objectiveSelect.selectedIndex = 0
    })
  }

  if (enfoqueSelect) {
    enfoqueSelect.addEventListener('change', (e) => {
      let v = (e.target.value || '').trim()
      console.debug('enfoque select changed:', v)
      if (!v) return
      const valid = /^[\p{L}\p{N} _\-\.,]+$/u.test(v)
      if (!valid) { alert('Enfoque no válido. Usa sólo letras, números y espacios.'); enfoqueSelect.selectedIndex = 0; return }
      // if 'auto' placeholder exists, remove it when user adds a real enfoque
      const autoIdx = window.__enfoqueSelected.indexOf('auto')
      if (autoIdx > -1) window.__enfoqueSelected.splice(autoIdx, 1)
      addPriority(window.__enfoqueSelected, v)
      console.debug('enfoqueSelected now:', window.__enfoqueSelected)
      renderTags(enfoqueTags, window.__enfoqueSelected)
      enfoqueSelect.selectedIndex = 0
    })
  }

  function clearForNewScript() {
    ;[
      'niche','audience','dominantType','offer','situations','desiredResult','duration',
      'tone','style','extraContext','objectiveSelect','enfoque','platformSelect','numberOfIdeas'
    ].forEach(id => {
      const el = document.getElementById(id)
      if (el) {
        if (el.tagName === 'SELECT') el.selectedIndex = 0
        else el.value = ''
      }
    })
    const res = document.getElementById('result')
    if (res) res.innerText = ''
    exitScriptView()
    syncEditModeUI(false)
    window.__lastGeneratedState = null
    window.__activeScriptHistoryId = null
    window.__editingScriptHistoryId = null
    window.__openHistoryMenuId = null
    sidebar.classList.remove('open')
    sidebar.classList.add('collapsed')
    sidebar.setAttribute('aria-hidden', 'false')
    if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false')
    syncSidebarLayout()
    // clear tags
    window.__platformSelected = []
    window.__objectiveSelected = []
    window.__enfoqueSelected = ['auto']
    renderTags(platformTags, window.__platformSelected)
    renderTags(objectiveTags, window.__objectiveSelected)
    renderTags(enfoqueTags, window.__enfoqueSelected)
    updateTagControls()
    renderScriptHistory()
    if (typeof window.__goToStep === 'function') window.__goToStep(1)
    document.getElementById('niche')?.focus()
  }

  newScript.addEventListener('click', () => {
    // If there's a generated script and user is not logged, warn before clearing
    const res = document.getElementById('result')
    const hasScript = res && res.innerText && res.innerText.trim().length > 0
    if (hasScript && isLogged()) {
      saveCurrentScriptToHistory()
    }
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

  // Help modal logic
  const helpBtn = document.getElementById('helpBtn')
  const helpModal = document.getElementById('helpModal')
  const helpClose = document.getElementById('helpClose')
  if (helpBtn && helpModal) {
    helpBtn.addEventListener('click', (e) => {
      e.preventDefault()
      helpModal.classList.add('open')
      helpModal.setAttribute('aria-hidden', 'false')
      // focus close icon for accessibility so keyboard users can close immediately
      setTimeout(() => { const helpCloseIcon = document.getElementById('helpCloseIcon'); if (helpCloseIcon) helpCloseIcon.focus() }, 120)
    })
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        helpModal.classList.remove('open')
        helpModal.setAttribute('aria-hidden', 'true')
      }
    })
  }
  if (helpClose) helpClose.addEventListener('click', () => {
    if (helpModal) {
      helpModal.classList.remove('open')
      helpModal.setAttribute('aria-hidden', 'true')
    }
  })
  const helpCloseIcon = document.getElementById('helpCloseIcon')
  if (helpCloseIcon) helpCloseIcon.addEventListener('click', () => {
    if (helpModal) { helpModal.classList.remove('open'); helpModal.setAttribute('aria-hidden','true') }
  })

  // Help modal index wiring: load templates into details area
  const helpIndexItems = document.querySelectorAll('.help-index-item')
  const helpDetails = document.getElementById('helpDetails')
  const templatesRoot = document.getElementById('help-templates')
  function loadHelp(key) {
    if (!templatesRoot || !helpDetails) return
    const tpl = templatesRoot.querySelector('#t-' + key)
    if (!tpl) return
    // Wrap every help template into a consistent card layout for clarity
    const icon = {
      audiencia: '👥', nicho: '🎯', tipo: '🧭', oferta: '🏷️', situaciones: '⚠️', resultado: '🎯', duracion: '⏱️',
      tono: '🎙️', estilo: '🎬', objetivo: '📌', enfoque: '🧭', plataforma: '🌐', numero: '🔢'
    }[key] || '📚'

    helpDetails.innerHTML = `
      <div class="help-cards">
        <div class="help-item">
          <div class="hc-icon">${icon}</div>
          <div class="hc-body">${tpl.innerHTML}</div>
        </div>
      </div>`
    // mark active
    helpIndexItems.forEach(b => { b.classList.remove('active'); b.removeAttribute('aria-current') })
    const btn = Array.from(helpIndexItems).find(b => b.getAttribute('data-key') === key)
    if (btn) { btn.classList.add('active'); btn.setAttribute('aria-current','true'); btn.focus() }
  }
  if (helpIndexItems && helpIndexItems.length) {
    helpIndexItems.forEach(b => {
      b.addEventListener('click', (e) => {
        const k = b.getAttribute('data-key')
        loadHelp(k)
      })
    })
    // load default
    loadHelp('audiencia')
  }

  // Script view actions: copy and edit inputs
  const copyBtn = document.getElementById('copyScript')
  const editBtn = document.getElementById('editInputs')
  const toggleHtmlBtn = document.getElementById('toggleHtmlView')
  const downloadPdfBtn = document.getElementById('downloadPdf')
  const scriptEditor = document.getElementById('scriptEditor')
  if (copyBtn && scriptEditor) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(scriptEditor.value)
        copyBtn.textContent = 'Copiado'
        showToast('Copiado al portapapeles', 'success')
        setTimeout(() => { copyBtn.textContent = 'Copiar' }, 1500)
      } catch (e) {
        showToast('No se pudo copiar: ' + e.message, 'error')
      }
    })
  }
  if (editBtn) {
    editBtn.addEventListener('click', (e) => {
      e.preventDefault()
      enterEditInputsMode()
    })
  }

  const cancelEditBtn = document.getElementById('cancelEditBtn')
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', (e) => {
      e.preventDefault()
      cancelEditInputsMode()
    })
  }

  if (toggleHtmlBtn) {
    toggleHtmlBtn.addEventListener('click', (e) => {
      e.preventDefault()
      const htmlView = document.getElementById('scriptHtmlView')
      const isOpen = htmlView && htmlView.style.display === 'block'
      setHtmlViewOpen(!isOpen)
    })
  }

  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', async (e) => {
      e.preventDefault()
      await downloadPdfFromScript()
    })
  }

  // Close modals with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (unsavedModal) { unsavedModal.classList.remove('open'); unsavedModal.setAttribute('aria-hidden','true') }
      if (helpModal) { helpModal.classList.remove('open'); helpModal.setAttribute('aria-hidden','true') }
      if (logoutConfirmModal) { logoutConfirmModal.classList.remove('open'); logoutConfirmModal.setAttribute('aria-hidden','true') }
    }
  })
})
