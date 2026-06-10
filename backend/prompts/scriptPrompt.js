export function buildPrompt(data){
const count = parseInt(data.numberOfIdeas || data.numIdeas || data.count || 3, 10) || 1
const niche = data.niche || '[ESPECIFICAR]'
const audience = data.audience || data.audiencia || ''
const dominantType = data.dominantType || data.tipoDominante || data.type || 'auto'
const offer = data.offer || data.oferta || 'no aplica'
const situations = data.situations || data.situaciones || ''
const desiredResult = data.desiredResult || data.resultadoDeseado || ''
const duration = data.duration || data.duracion || ''
const extraContext = data.extraContext || data.notasAdicionales || data.additionalNotes || ''
const tone = data.tone || data.tono || 'cercano'
const style = data.style || data.estilo || 'auto'
const objectiveRaw = data.objective || data.objetivo || 'crecer'
const objectiveArr = Array.isArray(objectiveRaw) ? objectiveRaw : (typeof objectiveRaw === 'string' ? [objectiveRaw] : [])
const objectivePrimary = objectiveArr.length ? objectiveArr[0] : 'crecer'
const objectiveSecondary = objectiveArr.length > 1 ? objectiveArr.slice(1).join(', ') : ''

const enfoqueRaw = data.enfoque || data.focus || 'auto'
const enfoqueArr = Array.isArray(enfoqueRaw) ? enfoqueRaw : (typeof enfoqueRaw === 'string' ? [enfoqueRaw] : [])
const enfoquePrimary = enfoqueArr.length ? enfoqueArr[0] : 'auto'
const enfoqueSecondary = enfoqueArr.length > 1 ? enfoqueArr.slice(1).join(', ') : ''

const platformRaw = data.platform || data.plataforma || 'TikTok'
const platformArr = Array.isArray(platformRaw) ? platformRaw : (typeof platformRaw === 'string' ? [platformRaw] : [])
const platformPrimary = platformArr.length ? platformArr[0] : 'TikTok'
const platformSecondary = platformArr.length > 1 ? platformArr.slice(1).join(', ') : ''

return `
CONTEXTO:
Nicho: ${niche}
Audiencia: ${audience}
Tipo dominante: ${dominantType}
Oferta: ${offer}
Situaciones: ${situations}
Resultado deseado: ${desiredResult}
Duración del video: ${duration}
Notas adicionales: ${extraContext}

CREADOR:
Tono: ${tone}
Estilo: ${style}

OBJETIVO:
Objetivo global: ${objectivePrimary}
Enfoque: ${enfoquePrimary}

PLATAFORMA:
Plataforma principal: ${platformPrimary}

GENERACIÓN:
Número de ideas: ${count}

REGLAS:
- Obligatorios: nicho, audiencia, objetivo global, enfoque, plataforma principal y número de ideas.
- Si faltan campos opcionales, adaptar la respuesta al resto del contexto sin pedir aclaraciones.
- Si "Tipo dominante" está vacío o en "auto", inferirlo según el nicho:
  - ENTRETENIMIENTO: humor, lifestyle, trends, gaming, emocional, relaciones
  - EDUCATIVO / VALOR: fitness, negocio, marketing, cocina, productividad, aprendizaje
  - HÍBRIDO: mezcla de valor + entretenimiento + personal
  - Si hay duda → HÍBRIDO
- Si "Oferta" está vacía, asumir que no aplica y no inventar ventas.
- Si "Situaciones" o "Resultado deseado" están vacíos, inferir lo más típico y lógico para esa audiencia dentro del nicho.
- Si "Duración del video" está vacía, ajustar la longitud del guion a lo más natural según plataforma, formato y objetivo.
- Si "Duración del video" está definida, respetarla de forma realista.
- Si "Tono" o "Estilo" están vacíos, inferirlos según contexto, objetivo y plataforma.
- Si "Notas adicionales" aporta entorno, recursos, limitaciones, compañía, localización o intención creativa, adaptar las ideas a ello.
- Si "Enfoque" = auto:
  - crecer → alcance
  - autoridad → autoridad / valor
  - monetizar → conversión
  - comunidad → comunidad / engagement

REGLAS POR OBJETIVO:
- Alcance: hook fuerte, ritmo rápido, fácil de consumir, sin venta
- Engagement: pregunta o debate, identificación clara, provocar comentarios o shares
- Autoridad: enseñanza clara, explicación concreta, utilidad real
- Comunidad: experiencia personal, emoción, cercanía
- Conversión: problema + solución + resultado + CTA claro
- Retención: intriga, progresión, cambios constantes, cierre que recompense quedarse

ESTRUCTURA:
- Hook
- Desarrollo:
  - Explicación breve
  - Guion completo del vídeo
- Elementos de dinamismo (mínimo 2)
- CTA solo si aplica; si no, escribir "Sin CTA"

REGLAS DEL DESARROLLO:
- El desarrollo debe incluir:
  1. Explicación breve de cómo funciona la idea
  2. Guion completo del vídeo con frases literales
- El guion debe cubrir inicio, desarrollo y cierre.
- Debe sonar natural, humano y grabable.
- Debe tener longitud suficiente para la duración indicada o, si no existe, la más efectiva para la idea.
- No entregar solo fragmentos, frases sueltas o ideas resumidas como si fueran el guion completo.

REGLAS SOBRE CTA:
- El CTA no es obligatorio.
- Solo incluirlo si mejora la pieza de forma natural.
- En conversión, incluir CTA claro.
- En alcance o engagement, usar CTA solo si suma.
- En entretenimiento, trend, baile, remate visual o formatos donde no encaje, omitirlo.
- Si no aplica, escribir: "Sin CTA".

INSTRUCCIONES:
- Genera ${count} ideas adaptadas al contexto.
- Respeta el tipo dominante, el objetivo de cada idea, la audiencia, la plataforma principal y el contexto disponible.
- No inventes ventas si no hay oferta.
- Evita ideas genéricas.
- Cada idea debe ser ejecutable, fácil de grabar y claramente distinta de las demás en ángulo, hook o ejecución.

FORMATO:
- Tipo:
- Objetivo principal:
- Hook:
- Idea:
- Desarrollo:
  - Explicación breve
  - Guion completo del vídeo
- Elementos de dinamismo:
- CTA:
- Formato:

REGLAS DE CALIDAD DEL OUTPUT:
- Evitar hooks genéricos, robóticos o poco nativos de contenido corto.
- Evitar ideas demasiado amplias, abstractas o difíciles de grabar.
- El guion debe ser claro, específico, natural y adaptado a la duración.
- El formato debe encajar con el estilo del creador, la plataforma y el tipo de idea.
- Cada idea debe poder grabarse fácilmente por una sola persona, salvo que el contexto indique claramente otro formato.
- Los ejemplos de output solo definen formato y nivel de detalle.
- No copiar ni sesgar tono, nicho, estilo o estructura a partir de los ejemplos.
- Basarse solo en el contexto proporcionado por el usuario.
- No tiene porque siempre haber guión hablado, por ejemplo en un trend de baile
- No usar separadores horizontales ni líneas con --- entre ideas.
- No escribir texto tipo [object Object] ni devolver objetos serializados.
- Si se generan varias ideas, separarlas únicamente con el encabezado ### Idea N.

Ejemplo de output 1:
Tipo:
Educativo

Objetivo principal:
Alcance

Hook:
“Si comes sano pero no pierdes grasa, probablemente te está pasando esto.”

Idea:
Explicar que comer “saludable” no siempre significa estar comiendo de una forma que ayude a perder grasa, sin hacerlo demasiado técnico.

Desarrollo:
Explicación breve:
Idea directa a cámara que rompe una creencia común y genera identificación rápida en mujeres que sienten que lo están haciendo “bien” pero no ven resultados.

Guion completo del vídeo:
“Si comes sano pero no pierdes grasa, probablemente te está pasando esto.
Muchas veces pensamos que por comer ensalada, aguacate, frutos secos, aceite de oliva o cenar ligero ya deberíamos adelgazar.
Pero no funciona así.
Porque una cosa es comer saludable, y otra muy distinta es comer en una estructura que realmente te ayude a perder grasa.
Y aquí es donde mucha gente se frustra, porque siente que lo está haciendo bien, pero no ve resultados.
No significa que tu cuerpo esté roto.
No significa que tengas un problema raro.
Significa que seguramente te falta estructura, no esfuerzo.
Por eso, antes de quitar más comida o castigarte más, revisa esto: cuánto comes, cómo repites tus comidas y si de verdad estás siendo constante con una base simple.”

Elementos de dinamismo:
- Texto en pantalla: “Comer sano ≠ perder grasa”
- Cortes rápidos mostrando alimentos “sanos”
- Zoom en cámara al decir: “tu cuerpo no está roto”

CTA:
Sin CTA

Formato:
Talking head + ejemplos visuales de comida

Ejemplo de output 2:
Tipo:
Entretenimiento

Objetivo principal:
Alcance

Hook:
“Parejas cuando intentan decidir dónde cenar.”

Idea:
Hacer humor con el clásico “me da igual” que en realidad no da igual.

Desarrollo:
Explicación breve:
Sketch corto, cotidiano y muy identificable, basado en una conversación absurda que escala sola.

Guion completo del vídeo:
“Parejas cuando intentan decidir dónde cenar.
—¿Qué quieres cenar?
—Me da igual.
—Vale, pizza.
—Pizza no.
—Bueno, sushi.
—Hoy no me apetece sushi.
—Vale… hamburguesa.
—Muy pesado siempre con lo mismo.
—Entonces dime tú qué quieres.
—Te he dicho que me da igual.
—No te da igual.
—Sí me da igual.
—¡Entonces elige una!
—Paso, decide tú.
—¡Pero si llevo decidiendo yo diez minutos!
Y al final acabas cenando en el mismo sitio de siempre.”

Elementos de dinamismo:
- Cortes rápidos con cada opción de comida
- Texto en pantalla: “El bucle infinito”
- Cara de desesperación mirando a cámara

CTA:
Sin CTA

Formato:
POV cómico con cambios de voz/personaje
`
}