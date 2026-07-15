// Glossário do Dojo — o mercado em linguagem de gente. 3 línguas.
export const GLOSSARY = [
  {
    id: "tape",
    aliases: ["tape", "times & trades", "fita", "time and trades"],
    pt: { term: "Tape (times & trades)", def: "A fita de negócios: a lista, negócio a negócio, de quem comprou, quem vendeu, quanto e a que preço. É o “extrato ao vivo” do mercado — e é dela que vem o nome do dojo." },
    en: { term: "Tape (time & sales)", def: "The live list of every trade — who bought, who sold, how much and at what price. The market's real-time receipt — and where this dojo gets its name." },
    es: { term: "Tape (times & trades)", def: "La cinta de negocios: la lista, operación por operación, de quién compró, quién vendió, cuánto y a qué precio. El “extracto en vivo” del mercado — de ahí el nombre del dojo." },
  },
  {
    id: "book",
    aliases: ["book", "livro de ofertas", "dom", "order book", "libro"],
    pt: { term: "Book (livro de ofertas)", def: "A fila de ordens esperando para negociar: compras de um lado (bid), vendas do outro (ask). É a “vitrine de intenções” — o tape mostra o que aconteceu; o book, o que querem que aconteça." },
    en: { term: "Order book", def: "The queue of resting orders waiting to trade: buys on one side (bid), sells on the other (ask). The tape shows what happened; the book shows what people want to happen." },
    es: { term: "Book (libro de órdenes)", def: "La fila de órdenes esperando: compras de un lado (bid), ventas del otro (ask). El tape muestra lo que pasó; el book, lo que quieren que pase." },
  },
  {
    id: "bid",
    aliases: ["bid", "compra passiva"],
    pt: { term: "Bid", def: "O melhor preço de COMPRA esperando na fila do book. Quem vende “no mercado” bate no bid." },
    en: { term: "Bid", def: "The best BUY price resting in the book. Market sells hit the bid." },
    es: { term: "Bid", def: "El mejor precio de COMPRA esperando en el book. Quien vende “a mercado” golpea el bid." },
  },
  {
    id: "ask",
    aliases: ["ask", "offer", "oferta", "venda passiva"],
    pt: { term: "Ask (offer)", def: "O melhor preço de VENDA esperando na fila. Quem compra “no mercado” ataca o ask." },
    en: { term: "Ask (offer)", def: "The best SELL price resting in the queue. Market buys lift the ask." },
    es: { term: "Ask (offer)", def: "El mejor precio de VENTA esperando en la fila. Quien compra “a mercado” ataca el ask." },
  },
  {
    id: "agressao",
    aliases: ["agressão", "agressao", "ordem a mercado", "market order", "agresión"],
    pt: { term: "Agressão (ordem a mercado)", def: "Quem não quer esperar: executa já, no preço que estiver, “atacando” a fila do outro lado. Agressão é pressa — e pressa revela convicção." },
    en: { term: "Aggression (market order)", def: "The trader who won't wait: executes now at whatever price, hitting the other side's queue. Aggression is urgency — and urgency reveals conviction." },
    es: { term: "Agresión (orden a mercado)", def: "Quien no quiere esperar: ejecuta ya, al precio que esté, “atacando” la fila del otro lado. La prisa revela convicción." },
  },
  {
    id: "passivo",
    aliases: ["passivo", "liquidez", "limite", "limit order", "pasivo"],
    pt: { term: "Passivo (liquidez)", def: "Quem espera na fila com preço definido (ordem limitada). O passivo oferece a mercadoria; o agressor decide se leva." },
    en: { term: "Passive (liquidity)", def: "The trader waiting in queue at a set price (limit order). Passives offer the goods; aggressors decide to take them." },
    es: { term: "Pasivo (liquidez)", def: "Quien espera en la fila con precio definido (orden limitada). El pasivo ofrece; el agresor decide si toma." },
  },
  {
    id: "delta",
    aliases: ["delta", "cvd"],
    pt: { term: "Delta", def: "Compras agressivas MENOS vendas agressivas no período. É o placar da pressão real: delta positivo = compradores com mais pressa; negativo = vendedores." },
    en: { term: "Delta", def: "Aggressive buys MINUS aggressive sells in the period. The scoreboard of real pressure: positive delta = buyers in a hurry; negative = sellers." },
    es: { term: "Delta", def: "Compras agresivas MENOS ventas agresivas del período. El marcador de la presión real: delta positivo = compradores con prisa; negativo = vendedores." },
  },
  {
    id: "volume",
    aliases: ["volume", "volumen"],
    pt: { term: "Volume", def: "O total negociado no período — o esforço bruto do mercado. Volume alto com preço parado e volume alto com preço andando contam histórias opostas." },
    en: { term: "Volume", def: "Total traded in the period — the market's raw effort. High volume with a still price and high volume with a moving price tell opposite stories." },
    es: { term: "Volumen", def: "El total negociado en el período — el esfuerzo bruto del mercado. Volumen alto con precio quieto y con precio en marcha cuentan historias opuestas." },
  },
  {
    id: "print",
    aliases: ["print", "lote", "negócio", "trade", "lot"],
    pt: { term: "Print / Lote", def: "Print é cada negócio “impresso” no tape; lote é o tamanho dele. Lotes cheios em sequência costumam ser a digital de gente grande." },
    en: { term: "Print / Lot", def: "A print is each trade stamped on the tape; the lot is its size. Strings of full-size lots are usually big money's fingerprint." },
    es: { term: "Print / Lote", def: "Print es cada negocio “impreso” en el tape; lote es su tamaño. Lotes llenos en secuencia suelen ser la huella del dinero grande." },
  },
  {
    id: "absorcao",
    aliases: ["absorção", "absorcao", "absorption", "absorción"],
    pt: { term: "Absorção", def: "Muita agressão batendo num nível e o preço não sai do lugar: alguém grande está comprando (ou vendendo) tudo em silêncio. Esforço sem resultado — a assinatura da defesa institucional." },
    en: { term: "Absorption", def: "Heavy aggression hitting a level while price refuses to move: someone big is quietly taking the other side. Effort without result — the signature of institutional defense." },
    es: { term: "Absorción", def: "Mucha agresión golpeando un nivel y el precio no se mueve: alguien grande toma todo en silencio. Esfuerzo sin resultado — la firma de la defensa institucional." },
  },
  {
    id: "iceberg",
    aliases: ["iceberg"],
    pt: { term: "Iceberg", def: "Ordem gigante escondida que aparece em pedacinhos: o book mostra pouco, mas a cada execução ela se recarrega no mesmo preço. O nome diz tudo — você só vê a ponta." },
    en: { term: "Iceberg", def: "A giant hidden order revealed in small slices: the book shows little, but it reloads at the same price after every fill. The name says it — you only see the tip." },
    es: { term: "Iceberg", def: "Orden gigante escondida que aparece por pedacitos: el book muestra poco, pero se recarga al mismo precio tras cada ejecución. Solo ves la punta." },
  },
  {
    id: "exaustao",
    aliases: ["exaustão", "exaustao", "clímax", "climax", "capitulação", "exhaustion", "agotamiento"],
    pt: { term: "Exaustão (clímax)", def: "O pico de esforço com resultado mínimo: volume recorde, preço estica e devolve na mesma vela. O último apressado entrou — acabou o combustível do movimento." },
    en: { term: "Exhaustion (climax)", def: "Peak effort, minimal result: record volume, price stretches and gives it back within the same bar. The last latecomer is in — the move ran out of fuel." },
    es: { term: "Agotamiento (clímax)", def: "Pico de esfuerzo con resultado mínimo: volumen récord, el precio estira y devuelve en la misma vela. Entró el último apurado — se acabó el combustible." },
  },
  {
    id: "iniciativa",
    aliases: ["iniciativa", "rompimento", "breakout", "ruptura", "initiative"],
    pt: { term: "Iniciativa (rompimento)", def: "A agressão que vence a fila e desloca o preço: esforço COM resultado. Rompimento de verdade vem com volume, delta a favor e sem recarga do outro lado." },
    en: { term: "Initiative (breakout)", def: "Aggression that beats the queue and moves price: effort WITH result. A real breakout comes with volume, supportive delta and no reload from the other side." },
    es: { term: "Iniciativa (ruptura)", def: "La agresión que vence la fila y desplaza el precio: esfuerzo CON resultado. La ruptura real viene con volumen, delta a favor y sin recarga del otro lado." },
  },
  {
    id: "pullback",
    aliases: ["pullback", "recuo", "correção", "correcao", "retroceso"],
    pt: { term: "Pullback", def: "O recuo saudável dentro de uma tendência: o preço respira porque o lado dominante pausou — não porque o contrário atacou. A pista: volume seco e delta fraco no recuo." },
    en: { term: "Pullback", def: "The healthy dip inside a trend: price breathes because the dominant side paused — not because the other side attacked. The tell: dry volume and weak delta on the dip." },
    es: { term: "Pullback", def: "El retroceso sano dentro de una tendencia: el precio respira porque el lado dominante pausó — no porque el contrario atacó. La pista: volumen seco y delta débil." },
  },
  {
    id: "divergencia",
    aliases: ["divergência", "divergencia", "divergence"],
    pt: { term: "Divergência", def: "Preço e força apontando para lados diferentes: novas máximas com cada vez menos agressão compradora (ou o espelho na queda). O movimento anda por inércia — desconfie." },
    en: { term: "Divergence", def: "Price and force pointing different ways: new highs on ever-thinner buying aggression (or the mirror on the way down). The move runs on inertia — be suspicious." },
    es: { term: "Divergencia", def: "Precio y fuerza apuntando a lados distintos: nuevos máximos con cada vez menos agresión compradora (o el espejo en la caída). El movimiento va por inercia — sospecha." },
  },
  {
    id: "esforco",
    aliases: ["esforço", "resultado", "esforço x resultado", "effort", "esfuerzo"],
    pt: { term: "Esforço × Resultado", def: "A régua-mestre do dojo: compare o esforço (volume, agressão) com o resultado (deslocamento do preço). Muito esforço + pouco resultado = alguém segurando. Pouco esforço + muito resultado = caminho livre." },
    en: { term: "Effort × Result", def: "The dojo's master ruler: compare effort (volume, aggression) against result (price displacement). Big effort + small result = someone absorbing. Small effort + big result = open road." },
    es: { term: "Esfuerzo × Resultado", def: "La regla maestra del dojo: compara el esfuerzo (volumen, agresión) con el resultado (desplazamiento). Mucho esfuerzo + poco resultado = alguien absorbe. Poco esfuerzo + mucho resultado = camino libre." },
  },
  {
    id: "candle",
    aliases: ["candle", "vela", "candlestick"],
    pt: { term: "Candle (vela)", def: "O desenho de um período: onde abriu, onde fechou (o corpo), até onde foi (os pavios). Verde/claro fechou acima da abertura; vermelho/escuro, abaixo." },
    en: { term: "Candle", def: "One period's drawing: where it opened, where it closed (the body), how far it reached (the wicks). Green closed above the open; red, below." },
    es: { term: "Vela (candle)", def: "El dibujo de un período: dónde abrió, dónde cerró (el cuerpo), hasta dónde llegó (las mechas). Verde cerró sobre la apertura; roja, debajo." },
  },
  {
    id: "pavio",
    aliases: ["pavio", "sombra", "wick", "mecha"],
    pt: { term: "Pavio (sombra)", def: "O rastro fino do candle: até onde o preço foi e foi DEVOLVIDO. Pavio longo é rejeição — alguém visitou aquele preço e foi expulso." },
    en: { term: "Wick (shadow)", def: "The candle's thin trail: how far price went and was PUSHED BACK. A long wick is rejection — someone visited that price and got kicked out." },
    es: { term: "Mecha (sombra)", def: "El rastro fino de la vela: hasta dónde fue el precio y fue DEVUELTO. Mecha larga es rechazo — alguien visitó ese precio y fue expulsado." },
  },
  {
    id: "suporte",
    aliases: ["suporte", "resistência", "resistencia", "support", "resistance", "nível", "nivel"],
    pt: { term: "Suporte / Resistência", def: "Níveis de preço onde historicamente aparecem defensores (compradores embaixo, vendedores em cima). O nível não segura nada sozinho — quem segura é a defesa que o fluxo revela ali." },
    en: { term: "Support / Resistance", def: "Price levels where defenders historically show up (buyers below, sellers above). The level holds nothing by itself — what holds is the defense the flow reveals there." },
    es: { term: "Soporte / Resistencia", def: "Niveles donde históricamente aparecen defensores (compradores abajo, vendedores arriba). El nivel no aguanta solo — aguanta la defensa que el flujo revela allí." },
  },
  {
    id: "regime",
    aliases: ["tendência", "tendencia", "lateral", "regime", "trend", "range", "consolidação"],
    pt: { term: "Tendência × Lateral (regime)", def: "A primeira pergunta antes de tudo: o mercado tem dono (tendência) ou está em leilão indeciso (lateral)? Estratégia de continuação morre no lateral; de reversão, morre na tendência." },
    en: { term: "Trend × Range (regime)", def: "The first question before anything: does the market have an owner (trend) or is the auction undecided (range)? Continuation plays die in ranges; reversal plays die in trends." },
    es: { term: "Tendencia × Lateral (régimen)", def: "La primera pregunta: ¿el mercado tiene dueño (tendencia) o la subasta está indecisa (lateral)? La continuación muere en el lateral; la reversión, en la tendencia." },
  },
  {
    id: "rsi",
    aliases: ["rsi", "força relativa"],
    pt: { term: "RSI", def: "O velocímetro do preço (0 a 100): mede se a subida/descida foi rápida demais. Acima de 70, correu muito para cima; abaixo de 30, para baixo. Velocidade alta não é ordem de reversão — é convite para olhar o fluxo." },
    en: { term: "RSI", def: "The price speedometer (0–100): did the move run too fast? Above 70 it sprinted up; below 30, down. High speed isn't a reversal order — it's an invitation to check the flow." },
    es: { term: "RSI", def: "El velocímetro del precio (0 a 100): ¿el movimiento corrió demasiado? Sobre 70 corrió mucho al alza; bajo 30, a la baja. Velocidad alta no es orden de reversión — es invitación a mirar el flujo." },
  },
  {
    id: "atr",
    aliases: ["atr", "true range", "volatilidade", "volatilidad"],
    pt: { term: "ATR", def: "A régua da volatilidade: o tamanho médio verdadeiro do passo do mercado. Não diz direção — diz o tamanho honesto do stop e, com risco fixo, o tamanho da posição." },
    en: { term: "ATR", def: "The volatility ruler: the market's true average step size. It gives no direction — it gives the honest stop size and, with fixed risk, your position size." },
    es: { term: "ATR", def: "La regla de la volatilidad: el tamaño medio verdadero del paso del mercado. No da dirección — da el tamaño honesto del stop y, con riesgo fijo, el de la posición." },
  },
  {
    id: "adx",
    aliases: ["adx", "dmi"],
    pt: { term: "ADX", def: "O medidor de força da tendência — nunca de direção. Acima de ~25, um lado domina; abaixo de ~20, lateral. É a triagem de regime em número." },
    en: { term: "ADX", def: "The trend-strength gauge — never direction. Above ~25 one side dominates; below ~20 it's a range. Regime triage in a number." },
    es: { term: "ADX", def: "El medidor de fuerza de la tendencia — nunca de dirección. Sobre ~25 un lado domina; bajo ~20, lateral. Triaje de régimen en un número." },
  },
  {
    id: "sar",
    aliases: ["sar", "parabolic", "stop móvel", "trailing stop"],
    pt: { term: "Parabolic SAR", def: "Um stop móvel que acompanha a tendência e acelera: os pontos se aproximam do preço enquanto o movimento renova extremos. Tocou no ponto = saiu, por regra." },
    en: { term: "Parabolic SAR", def: "A trailing stop that follows the trend and accelerates: the dots close in while the move keeps printing new extremes. Price touches the dot = you're out, by rule." },
    es: { term: "Parabolic SAR", def: "Un stop móvil que sigue la tendencia y acelera: los puntos se acercan mientras el movimiento renueva extremos. Tocó el punto = saliste, por regla." },
  },
  {
    id: "stop",
    aliases: ["stop", "stop loss", "saída", "salida"],
    pt: { term: "Stop", def: "A saída combinada ANTES de entrar: o ponto onde a sua leitura estará provada errada. Stop não é opinião nem esperança — é contrato com você mesmo." },
    en: { term: "Stop", def: "The exit agreed BEFORE entering: the point where your read is proven wrong. A stop isn't opinion or hope — it's a contract with yourself." },
    es: { term: "Stop", def: "La salida acordada ANTES de entrar: el punto donde tu lectura queda probada errónea. El stop no es opinión ni esperanza — es un contrato contigo mismo." },
  },
  {
    id: "gap",
    aliases: ["gap", "salto"],
    pt: { term: "Gap", def: "Um salto no preço sem negócios no meio — geralmente entre o fechamento de um dia e a abertura do outro. O mercado “pulou” o caminho: níveis dentro do gap não foram testados." },
    en: { term: "Gap", def: "A price jump with no trades in between — usually from one day's close to the next open. The market skipped the road: levels inside the gap were never tested." },
    es: { term: "Gap", def: "Un salto del precio sin negocios en el medio — normalmente entre el cierre de un día y la apertura del otro. El mercado “saltó” el camino: los niveles dentro del gap no fueron probados." },
  },
];

// busca pura (testável): casa termo, aliases e definição no idioma
export function searchGlossary(q, lang) {
  const s = (q || "").trim().toLowerCase();
  const L = ["pt", "en", "es"].includes(lang) ? lang : "en";
  if (!s) return GLOSSARY;
  return GLOSSARY.filter((g) =>
    g[L].term.toLowerCase().includes(s) ||
    g[L].def.toLowerCase().includes(s) ||
    g.aliases.some((a) => a.includes(s) || s.includes(a))
  );
}
