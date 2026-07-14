"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// TAPEDOJO — v2
// Treino deliberado de leitura de fluxo (order flow).
// Perfis de usuário · PT/EN/ES · Repetição espaçada · Cenários
// ambíguos · Relatório de erros · Estudo dirigido · Faixas ·
// Limite diário grátis configurável (freemium).
// ═══════════════════════════════════════════════════════════════

const TRIAL_DAYS = 7; // dias de teste grátis com acesso total

// ── Economia de pontos (energia de treino, nunca aposta) ──
const SCENARIO_COST = 10;   // custo para abrir cada pregão (certo ou errado)
const CORRECT_REFUND = 5;   // devolvidos por leitura correta
const STREAK_EVERY = 5;     // a cada N acertos seguidos…
const STREAK_BONUS = 10;    // …um pregão grátis (bônus em pontos)
const CREDIT_PACK = 500;    // pacote avulso (demonstração)
const ALLOWANCE = { free: 1000, base: 1000, plus: 3000 }; // pontos/mês (master = ilimitado)

// ► PREÇOS — preencha aqui quando definir os valores (aparecem nos 3 cartões):
const PLAN_PRICES = {
  base: { pt: "R$ —/mês", en: "US$ —/mo", es: "US$ —/mes" },
  plus: { pt: "R$ —/mês", en: "US$ —/mo", es: "US$ —/mes" },
  master: { pt: "R$ —/mês", en: "US$ —/mo", es: "US$ —/mes" },
};

const C = {
  bg: "#12143A", surface: "#1B1E52", card: "#232670", navy: "#2D3278",
  orange: "#F47B20", buy: "#22C55E", sell: "#F05252",
  text: "#F5F6FF", muted: "#A9AEDB", grid: "#34386F",
};

const BELT_THRESHOLDS = [0, 30, 70, 130, 210, 320, 450];
const BELT_COLORS = ["#F5F6FF", "#FACC15", "#F47B20", "#22C55E", "#3B82F6", "#8B5E3C", "#0B0D24"];

const CAT_KEYS = ["absorcao", "divergencia", "iniciativa", "exaustao", "pullback", "mistos"];

const READS = {
  absorcao: "Tom Williams — Master the Markets · Wyckoff",
  divergencia: "Anna Coulling — Volume Price Analysis",
  iniciativa: "Larry Harris — Trading and Exchanges",
  exaustao: "Tom Williams — Master the Markets · Wyckoff",
  pullback: "Anna Coulling — Volume Price Analysis",
  mistos: "David Aronson — Evidence-Based Technical Analysis",
};

// ───────────────────────── i18n ─────────────────────────
const L = {
  pt: {
    langName: "Português",
    ui: {
      slogan: "Treine o olho. Leia o mercado.",
      welcome: "Bem-vindo ao dojo",
      intro: "Treino deliberado de leitura de fluxo: cenários, explicação do raciocínio e evolução medida por fundamento.",
      yourName: "Seu nome", start: "Entrar no dojo", selectProfile: "Perfis existentes",
      train: "Treinar", report: "Relatório", study: "Estudo", plan: "Plano",
      question: "Qual força domina este momento?",
      buy: "FORÇA COMPRADORA", sell: "FORÇA VENDEDORA", none: "SEM LEITURA CLARA",
      correct: "Leitura correta", wrong: "Leitura incorreta", nextBtn: "Próximo cenário →",
      tapeLabel: "Tape", watchLabel: "No mercado real, observe",
      accuracy: "Acerto", scenarios: "Cenários", streak: "Sequência", belt: "Faixa",
      volume: "VOLUME", delta: "DELTA (compra − venda)", scenario: "Cenário", simMarket: "mercado simulado",
      reportTitle: "Acerto por fundamento", noData: "sem dados",
      lastMistakes: "Últimos erros", yourAnswer: "sua leitura", correctAnswer: "correta",
      studyWeakBtn: "Estudar meu fundamento mais fraco",
      studyTitle: "Estudo dirigido", keyPoints: "Pontos-chave", example: "Exemplo anotado",
      reading: "Leitura de base", backTrain: "← Voltar ao treino", otherCats: "Estudar outro fundamento",
      gradGoal: "Meta de graduação: 70%+ em cada fundamento, com 30+ cenários cada.",
      gradTitle: "🥋 Exame de faixa concluído",
      gradText: "70%+ em todos os fundamentos com amostra mínima. Próximo passo do caminho: replay com dados reais numa plataforma profissional — leve o olho treinado para o ruído do mercado de verdade.",
      resetStats: "Zerar estatísticas", resetConfirm: "Isso apaga todo o progresso deste perfil. Confirmar?",
      cancel: "Cancelar", confirmReset: "Sim, zerar",
      trialLeft: "teste grátis", trialDays: "dias",
      planTitle: "Seu período de teste terminou",
      planText: "Você treinou com acesso total por " + TRIAL_DAYS + " dias. Para continuar no dojo, escolha um plano:",
      proBtn: "Escolher (demonstração)",
      plans: {
        base: { name: "Base", desc: ALLOWANCE.base.toLocaleString("pt-BR") + " pontos/mês · todos os drills, relatório e estudo dirigido." },
        plus: { name: "Plus", desc: ALLOWANCE.plus.toLocaleString("pt-BR") + " pontos/mês · para quem treina todos os dias.", badge: "Mais popular" },
        master: { name: "Master", desc: "Pontos ilimitados · mercado AO VIVO (níveis 4–6)." },
      },
      points: "Pontos", ptsMonth: "renovam todo mês",
      ptsCost: "Cada pregão consome " + SCENARIO_COST + " pontos; leitura correta devolve " + CORRECT_REFUND + "; a cada " + STREAK_EVERY + " acertos seguidos, um pregão grátis.",
      ptsRefund: "pontos devolvidos pela leitura correta",
      ptsStreakBonus: "bônus de sequência: pregão grátis",
      creditsTitle: "Seus pontos acabaram",
      creditsText: "Os pontos renovam no início de cada mês conforme o plano. Você pode esperar a renovação, comprar um pacote avulso ou subir de plano — quem acerta mais, treina mais com os mesmos pontos.",
      buyCredits: "Comprar " + CREDIT_PACK + " pontos (demonstração)",
      proNote: "Em produção, este botão abre o checkout. Aqui apenas demonstra o fluxo.",
      proActive: "Plano ativo",
      switchUser: "Trocar perfil",
      disclaimer: "Cenários sintéticos para treino de fundamento — não são dados reais nem recomendação de operação.",
      belts: ["Branca", "Amarela", "Laranja", "Verde", "Azul", "Marrom", "Preta"],
      answers: { buy: "Compradora", sell: "Vendedora", none: "Sem leitura" },
      refs: { min: "mínima de referência", max: "máxima de referência", rtop: "topo do range", rbot: "fundo do range" },
    },
    cats: {
      absorcao: {
        name: "Absorção em extremo",
        tapeBuy: ["Lotes grandes agredindo o bid sem parar, mas o preço não faz nova mínima — a oferta passiva de compra recarrega no mesmo nível.", "Vendedores despejam lotes pesados no bid há vários minutos e o preço simplesmente não cede — cada agressão encontra compra passiva esperando no mesmo nível.", "O times & trades mostra vendas agressivas em série no fundo, mas o print de nova mínima não sai — a fila de compra do book é recomposta assim que consumida."],
        tapeSell: ["Lotes grandes agredindo o ask sem parar, mas o preço não faz nova máxima — a oferta passiva de venda recarrega no mesmo nível.", "Compradores despejam lotes pesados no ask há vários minutos e o preço simplesmente não avança — cada agressão encontra venda passiva esperando no mesmo nível.", "O times & trades mostra compras agressivas em série no topo, mas o print de nova máxima não sai — a fila de venda do book é recomposta assim que consumida."],
        expBuy: "O volume explodiu com delta fortemente NEGATIVO, mas o preço não caiu: range pequeno e fechamento no terço superior. Esforço sem resultado — um participante grande compra passivamente toda a agressão vendedora. Esgotada a agressão, o caminho de menor resistência é para cima.",
        expSell: "O volume explodiu com delta fortemente POSITIVO, mas o preço não subiu: range pequeno e fechamento no terço inferior. Esforço sem resultado — um participante grande vende passivamente para toda a agressão compradora. O caminho de menor resistência é para baixo.",
        watch: "Absorção vale enquanto o nível segura. Se o extremo romper, a leitura está invalidada.",
        study: "Absorção é esforço sem resultado: agressão intensa que não move o preço porque alguém grande a absorve passivamente. É a assinatura clássica de um institucional defendendo um nível (Wyckoff).",
        points: ["Volume muito acima da média exatamente no extremo", "Delta forte CONTRA a direção que o preço recusa", "Range pequeno e fechamento contra a agressão"],
      },
      divergencia: {
        name: "Divergência de delta",
        tapeSell: ["O preço imprime máximas mais altas, mas a agressão compradora fica mais rala a cada avanço — os lotes agressores encolhem.", "Cada nova máxima sai com menos negócios agressores que a anterior — o preço segue avançando enquanto a participação compradora míngua.", "O preço renova o topo, porém o tape mostra agressão compradora cada vez menor a cada perna — os prints grandes sumiram."],
        tapeBuy: ["O preço imprime mínimas mais baixas, mas a agressão vendedora fica mais rala a cada queda — os lotes agressores encolhem.", "Cada nova mínima sai com menos negócios agressores que a anterior — o preço segue caindo enquanto a participação vendedora míngua.", "O preço renova o fundo, porém o tape mostra agressão vendedora cada vez menor a cada perna — os prints grandes sumiram."],
        expSell: "Novas máximas com delta encolhendo e virando negativo: o avanço anda sem combustível — provável recompra de vendidos, não compra nova. Sem agressão real sustentando, a força dominante passa a ser vendedora.",
        expBuy: "Novas mínimas com delta encolhendo e virando positivo: a queda perdeu combustível — não há vendedor novo agredindo. A força dominante passa a ser compradora.",
        watch: "Divergência é aviso, não gatilho: espere a falha do extremo antes de agir.",
        study: "Divergência compara esforço (delta) com resultado (preço). Preço avançando com agressão decrescente denuncia movimento sem participação — o combustível acabando perna a perna.",
        points: ["Extremos progressivos no preço", "Delta decrescente a cada perna", "Última perna com delta contrário ou pavio de rejeição"],
      },
      iniciativa: {
        name: "Iniciativa (rompimento)",
        tapeBuy: ["No rompimento, o tape acelera: lotes grandes agredindo o ask em sequência e o book de venda consumido nível após nível, sem recarga.", "O nível é rompido com prints grandes e rápidos no ask; a liquidez de venda some da tela sem ser reposta.", "Na quebra do range, a velocidade do tape dispara: agressão compradora em rajada, book de venda evaporando nível a nível."],
        tapeSell: ["No rompimento, o tape acelera: lotes grandes agredindo o bid em sequência e o book de compra consumido nível após nível, sem recarga.", "O nível é rompido com prints grandes e rápidos no bid; a liquidez de compra some da tela sem ser reposta.", "Na quebra do range, a velocidade do tape dispara: agressão vendedora em rajada, book de compra evaporando nível a nível."],
        expBuy: "Rompimento com volume alto, delta fortemente positivo e fechamento na máxima: agressão real consumindo liquidez — esforço COM resultado. Iniciativa tende à continuação: força stops e atrai momentum.",
        expSell: "Rompimento com volume alto, delta fortemente negativo e fechamento na mínima: agressão real consumindo o book de compra. Esforço com resultado — continuação vendedora.",
        watch: "O teste do nível rompido com delta ainda a favor confirma; delta fraco ou pavio de retorno denuncia armadilha.",
        study: "Iniciativa é agressão que vence a liquidez passiva e desloca o preço. A diferença para o falso rompimento está no delta alinhado e na ausência de recarga do book.",
        points: ["Volume e delta alinhados com a direção", "Fechamento perto do extremo do candle", "Continuação imediata, sem retorno ao range"],
      },
      exaustao: {
        name: "Exaustão climática",
        tapeSell: ["Explosão de negócios — o maior volume da sessão — com compradores agredindo em pânico, mas o preço estica, devolve quase tudo e fecha perto da abertura.", "Pico histórico de negócios na sessão: compra agressiva em cascata, mas o candle devolve o avanço e fecha onde começou.", "O tape ferve no topo — todo mundo comprando ao mesmo tempo — e ainda assim o preço não sustenta a esticada, voltando à abertura."],
        tapeBuy: ["Explosão de negócios — o maior volume da sessão — com vendedores agredindo em pânico, mas o preço estica para baixo, devolve quase tudo e fecha perto da abertura.", "Pico histórico de negócios na sessão: venda agressiva em cascata, mas o candle devolve a queda e fecha onde começou.", "O tape ferve no fundo — todo mundo vendendo ao mesmo tempo — e ainda assim o preço não sustenta a esticada, voltando à abertura."],
        expSell: "Volume recorde com delta positivo, porém pavio superior enorme e fechamento na abertura: o esforço máximo produziu nada. É o último comprador entrando na distribuição. Esgotado o fluxo, a força vira vendedora.",
        expBuy: "Volume recorde com delta negativo, porém pavio inferior enorme e fechamento na abertura: pânico de venda inteiramente absorvido — capitulação. O último vendedor saiu; a força vira compradora.",
        watch: "O clímax raramente é a virada exata: procure o teste secundário do extremo com volume bem menor (Wyckoff).",
        study: "Exaustão é o clímax do movimento: participação máxima com progresso mínimo. O extremo de esforço marca o fim do combustível, não a continuação.",
        points: ["Volume recorde da sessão no extremo do movimento", "Pavio longo devolvendo o avanço", "Fechamento perto da abertura apesar do delta forte"],
      },
      pullback: {
        name: "Pullback em tendência",
        tapeBuy: ["No recuo, o tape esvazia: negócios pequenos e espaçados, nenhum lote relevante agredindo o bid; o book abaixo segue intacto.", "O recuo acontece em conta-gotas: prints miúdos, nenhum lote institucional vendendo; a estrutura compradora abaixo permanece.", "Durante a correção o tape quase para — volume mínimo, agressão irrelevante — enquanto a liquidez de compra segue posicionada."],
        tapeSell: ["No repique, o tape esvazia: negócios pequenos e espaçados, nenhum lote relevante agredindo o ask; o book acima segue intacto.", "O repique acontece em conta-gotas: prints miúdos, nenhum lote institucional comprando; a estrutura vendedora acima permanece.", "Durante a correção o tape quase para — volume mínimo, agressão irrelevante — enquanto a liquidez de venda segue posicionada."],
        expBuy: "A tendência veio com volume e delta consistentes; o recuo tem volume seco e delta fraco — realização de lucro, não venda institucional. Sem agressão contrária real, a força dominante segue compradora.",
        expSell: "A queda veio com volume e delta consistentes; o repique tem volume seco e delta fraco — recompra de vendidos, não compra nova. A força dominante segue vendedora.",
        watch: "Pullback que ganha volume e delta contrário crescente deixou de ser pullback.",
        study: "Em tendência saudável, correções acontecem por ausência do lado dominante, não por presença do oposto. Volume seco no recuo é a assinatura.",
        points: ["Impulso com volume e delta fortes", "Correção com volume visivelmente menor", "Delta do recuo fraco, sem aceleração"],
      },
      mistos: {
        name: "Sinais conflitantes",
        tape: ["O tape alterna: agressão forte num candle, ausência no seguinte; delta e preço contam histórias diferentes em pernas consecutivas.", "Um candle traz agressão pesada, o seguinte vem vazio; o delta aponta para um lado e o fechamento vai para o outro — nada se confirma.", "O tape não constrói narrativa: prints grandes isolados, sem sequência, com preço e delta se contradizendo a cada perna."],
        exp: "Volume alto com delta quase nulo, candles contradizendo o delta anterior, nenhum nível defendido com consistência: não há força dominante legível. A leitura profissional aqui é uma só — ficar de fora e esperar o mercado se definir.",
        watch: "Não operar também é leitura. A maioria das perdas nasce de forçar interpretação onde não existe sinal.",
        study: "O mercado passa boa parte do tempo ilegível. Reconhecer ausência de sinal protege capital — é a habilidade que separa disciplina de compulsão.",
        points: ["Delta e preço em desacordo, sem padrão", "Volume sem confirmação de progresso", "Nenhum nível claramente defendido"],
      },
    },
  },

  en: {
    langName: "English",
    ui: {
      slogan: "Train the eye. Read the market.",
      welcome: "Welcome to the dojo",
      intro: "Deliberate order-flow reading practice: scenarios, reasoning explained, progress measured per fundamental.",
      yourName: "Your name", start: "Enter the dojo", selectProfile: "Existing profiles",
      train: "Train", report: "Report", study: "Study", plan: "Plan",
      question: "Which force dominates this moment?",
      buy: "BUYING FORCE", sell: "SELLING FORCE", none: "NO CLEAR READ",
      correct: "Correct read", wrong: "Incorrect read", nextBtn: "Next scenario →",
      tapeLabel: "Tape", watchLabel: "In the real market, watch for",
      accuracy: "Accuracy", scenarios: "Scenarios", streak: "Streak", belt: "Belt",
      volume: "VOLUME", delta: "DELTA (buy − sell)", scenario: "Scenario", simMarket: "simulated market",
      reportTitle: "Accuracy by fundamental", noData: "no data",
      lastMistakes: "Recent mistakes", yourAnswer: "your read", correctAnswer: "correct",
      studyWeakBtn: "Study my weakest fundamental",
      studyTitle: "Guided study", keyPoints: "Key points", example: "Annotated example",
      reading: "Core reading", backTrain: "← Back to training", otherCats: "Study another fundamental",
      gradGoal: "Graduation goal: 70%+ on every fundamental, with 30+ scenarios each.",
      gradTitle: "🥋 Belt exam complete",
      gradText: "70%+ on every fundamental with minimum sample. Next step on the path: market replay with real data on a professional platform — take the trained eye into real market noise.",
      resetStats: "Reset statistics", resetConfirm: "This erases all progress for this profile. Confirm?",
      cancel: "Cancel", confirmReset: "Yes, reset",
      trialLeft: "free trial", trialDays: "days",
      planTitle: "Your trial period has ended",
      planText: "You trained with full access for " + TRIAL_DAYS + " days. To keep training in the dojo, choose a plan:",
      proBtn: "Choose (demo)",
      plans: {
        base: { name: "Base", desc: ALLOWANCE.base.toLocaleString("en-US") + " points/month · all drills, report and guided study." },
        plus: { name: "Plus", desc: ALLOWANCE.plus.toLocaleString("en-US") + " points/month · for those who train every day.", badge: "Most popular" },
        master: { name: "Master", desc: "Unlimited points · LIVE market (levels 4–6)." },
      },
      points: "Points", ptsMonth: "renew every month",
      ptsCost: "Each session costs " + SCENARIO_COST + " points; a correct read refunds " + CORRECT_REFUND + "; every " + STREAK_EVERY + " correct reads in a row earn a free session.",
      ptsRefund: "points refunded for the correct read",
      ptsStreakBonus: "streak bonus: free session",
      creditsTitle: "You are out of points",
      creditsText: "Points renew at the start of each month based on your plan. You can wait for renewal, buy a one-off pack, or upgrade — the better you read, the more you train with the same points.",
      buyCredits: "Buy " + CREDIT_PACK + " points (demo)",
      proNote: "In production this button opens checkout. Here it only demonstrates the flow.",
      proActive: "Plan active",
      switchUser: "Switch profile",
      disclaimer: "Synthetic scenarios for fundamentals training — not real data and not trading advice.",
      belts: ["White", "Yellow", "Orange", "Green", "Blue", "Brown", "Black"],
      answers: { buy: "Buying", sell: "Selling", none: "No read" },
      refs: { min: "reference low", max: "reference high", rtop: "range top", rbot: "range bottom" },
    },
    cats: {
      absorcao: {
        name: "Absorption at an extreme",
        tapeBuy: ["Large lots hitting the bid relentlessly, yet price prints no new low — passive buy liquidity reloads at the same level.", "Sellers have been dumping heavy lots into the bid for minutes and price simply will not give way — every wave meets passive buying waiting at the same level.", "The time and sales shows a string of aggressive sells at the low, yet no new low prints — the buy queue in the book refills as fast as it is consumed."],
        tapeSell: ["Large lots hitting the ask relentlessly, yet price prints no new high — passive sell liquidity reloads at the same level.", "Buyers have been dumping heavy lots into the ask for minutes and price simply will not advance — every wave meets passive selling waiting at the same level.", "The time and sales shows a string of aggressive buys at the high, yet no new high prints — the sell queue in the book refills as fast as it is consumed."],
        expBuy: "Volume exploded with strongly NEGATIVE delta, yet price did not fall: small range, close in the upper third. Effort without result — a large player passively buys all seller aggression. Once it exhausts, the path of least resistance is up.",
        expSell: "Volume exploded with strongly POSITIVE delta, yet price did not rise: small range, close in the lower third. A large player passively sells into all buyer aggression. The path of least resistance is down.",
        watch: "Absorption holds only while the level holds. If the extreme breaks, the read is invalid.",
        study: "Absorption is effort without result: intense aggression that fails to move price because a large player passively absorbs it — the classic signature of an institution defending a level (Wyckoff).",
        points: ["Volume far above average exactly at the extreme", "Strong delta AGAINST the direction price refuses", "Small range, close against the aggression"],
      },
      divergencia: {
        name: "Delta divergence",
        tapeSell: ["Price prints higher highs, but buyer aggression thins with every push — aggressor lot sizes shrink.", "Each new high prints with fewer aggressive trades than the last — price keeps advancing while buyer participation dries up.", "Price renews the top, yet the tape shows smaller buyer aggression on every leg — the big prints are gone."],
        tapeBuy: ["Price prints lower lows, but seller aggression thins with every drop — aggressor lot sizes shrink.", "Each new low prints with fewer aggressive trades than the last — price keeps falling while seller participation dries up.", "Price renews the bottom, yet the tape shows smaller seller aggression on every leg — the big prints are gone."],
        expSell: "New highs with delta shrinking and turning negative: the advance runs out of fuel — likely short covering, not new buying. Without real aggression sustaining it, the dominant force turns to sellers.",
        expBuy: "New lows with delta shrinking and turning positive: the decline lost fuel — no new sellers aggressing. The dominant force turns to buyers.",
        watch: "Divergence is a warning, not a trigger: wait for the extreme to fail before acting.",
        study: "Divergence compares effort (delta) with result (price). Price advancing on shrinking aggression exposes a move without participation — fuel draining leg by leg.",
        points: ["Progressive price extremes", "Delta shrinking each leg", "Final leg with opposite delta or a rejection wick"],
      },
      iniciativa: {
        name: "Initiative (breakout)",
        tapeBuy: ["At the break, the tape accelerates: large lots hitting the ask in sequence, the sell book consumed level after level, no reload.", "The level breaks with large, rapid prints on the ask; sell liquidity vanishes from the screen without being replaced.", "At the range break, tape speed explodes: buyer aggression in bursts, the sell book evaporating level by level."],
        tapeSell: ["At the break, the tape accelerates: large lots hitting the bid in sequence, the buy book consumed level after level, no reload.", "The level breaks with large, rapid prints on the bid; buy liquidity vanishes from the screen without being replaced.", "At the range break, tape speed explodes: seller aggression in bursts, the buy book evaporating level by level."],
        expBuy: "Breakout with high volume, strongly positive delta and a close at the high: real aggression consuming liquidity — effort WITH result. Initiative tends to continue: it forces stops and attracts momentum.",
        expSell: "Breakout with high volume, strongly negative delta and a close at the low: real aggression consuming the buy book. Effort with result — seller continuation.",
        watch: "A retest of the broken level with delta still in favor confirms; weak delta or a return wick exposes a trap.",
        study: "Initiative is aggression that defeats passive liquidity and moves price. What separates it from a false break is aligned delta and no book reload.",
        points: ["Volume and delta aligned with direction", "Close near the candle extreme", "Immediate continuation, no return to the range"],
      },
      exaustao: {
        name: "Climactic exhaustion",
        tapeSell: ["A burst of trades — the largest volume of the session — buyers aggressing in panic, yet price stretches, gives it all back and closes near the open.", "A historic burst of trades for the session: cascading aggressive buying, yet the candle gives the advance back and closes where it started.", "The tape boils at the top — everyone buying at once — and still price cannot hold the stretch, sliding back to the open."],
        tapeBuy: ["A burst of trades — the largest volume of the session — sellers aggressing in panic, yet price stretches down, gives it back and closes near the open.", "A historic burst of trades for the session: cascading aggressive selling, yet the candle gives the drop back and closes where it started.", "The tape boils at the low — everyone selling at once — and still price cannot hold the stretch, sliding back to the open."],
        expSell: "Record volume with positive delta, but a huge upper wick and a close at the open: maximum effort produced nothing. The last buyer entering into distribution. Fuel spent, the force turns to sellers.",
        expBuy: "Record volume with negative delta, but a huge lower wick and a close at the open: selling panic fully absorbed — capitulation. The last seller is out; the force turns to buyers.",
        watch: "The climax is rarely the exact turn: look for the secondary test on much lower volume (Wyckoff).",
        study: "Exhaustion is the climax of a move: maximum participation with minimum progress. Peak effort marks the end of fuel, not continuation.",
        points: ["Record session volume at the extreme", "Long wick giving back the advance", "Close near the open despite strong delta"],
      },
      pullback: {
        name: "Pullback in trend",
        tapeBuy: ["On the dip, the tape empties: small, spaced trades, no meaningful lot hitting the bid; the book below stays intact.", "The dip trickles in: tiny prints, no institutional lot selling; the buying structure below remains in place.", "During the correction the tape nearly stalls — minimal volume, irrelevant aggression — while buy liquidity stays positioned."],
        tapeSell: ["On the bounce, the tape empties: small, spaced trades, no meaningful lot hitting the ask; the book above stays intact.", "The bounce trickles in: tiny prints, no institutional lot buying; the selling structure above remains in place.", "During the correction the tape nearly stalls — minimal volume, irrelevant aggression — while sell liquidity stays positioned."],
        expBuy: "The trend came with consistent volume and delta; the dip shows dry volume and weak delta — profit taking, not institutional selling. Without real opposing aggression, the dominant force stays with buyers.",
        expSell: "The decline came with consistent volume and delta; the bounce shows dry volume and weak delta — short covering, not new buying. The dominant force stays with sellers.",
        watch: "A pullback that gains volume and growing opposite delta is no longer a pullback.",
        study: "In a healthy trend, corrections happen from absence of the dominant side, not presence of the opposite. Dry volume on the dip is the signature.",
        points: ["Impulse with strong volume and delta", "Correction with visibly lower volume", "Weak dip delta, no acceleration"],
      },
      mistos: {
        name: "Conflicting signals",
        tape: ["The tape alternates: strong aggression one candle, absence the next; delta and price tell different stories on consecutive legs.", "One candle brings heavy aggression, the next comes empty; delta points one way and the close goes the other — nothing confirms.", "The tape builds no narrative: isolated large prints with no follow-through, price and delta contradicting each other leg after leg."],
        exp: "High volume with near-zero delta, candles contradicting the prior delta, no level consistently defended: there is no readable dominant force. The professional read here is one — stand aside and let the market define itself.",
        watch: "Not trading is also a read. Most losses are born from forcing interpretation where no signal exists.",
        study: "Markets spend much of the time unreadable. Recognizing the absence of signal protects capital — the skill that separates discipline from compulsion.",
        points: ["Delta and price in disagreement, no pattern", "Volume without progress confirmation", "No level clearly defended"],
      },
    },
  },

  es: {
    langName: "Español",
    ui: {
      slogan: "Entrena el ojo. Lee el mercado.",
      welcome: "Bienvenido al dojo",
      intro: "Práctica deliberada de lectura de flujo: escenarios, razonamiento explicado y progreso medido por fundamento.",
      yourName: "Tu nombre", start: "Entrar al dojo", selectProfile: "Perfiles existentes",
      train: "Entrenar", report: "Informe", study: "Estudio", plan: "Plan",
      question: "¿Qué fuerza domina este momento?",
      buy: "FUERZA COMPRADORA", sell: "FUERZA VENDEDORA", none: "SIN LECTURA CLARA",
      correct: "Lectura correcta", wrong: "Lectura incorrecta", nextBtn: "Siguiente escenario →",
      tapeLabel: "Tape", watchLabel: "En el mercado real, observa",
      accuracy: "Acierto", scenarios: "Escenarios", streak: "Racha", belt: "Cinturón",
      volume: "VOLUMEN", delta: "DELTA (compra − venta)", scenario: "Escenario", simMarket: "mercado simulado",
      reportTitle: "Acierto por fundamento", noData: "sin datos",
      lastMistakes: "Errores recientes", yourAnswer: "tu lectura", correctAnswer: "correcta",
      studyWeakBtn: "Estudiar mi fundamento más débil",
      studyTitle: "Estudio dirigido", keyPoints: "Puntos clave", example: "Ejemplo anotado",
      reading: "Lectura de base", backTrain: "← Volver al entrenamiento", otherCats: "Estudiar otro fundamento",
      gradGoal: "Meta de graduación: 70%+ en cada fundamento, con 30+ escenarios cada uno.",
      gradTitle: "🥋 Examen de cinturón completado",
      gradText: "70%+ en todos los fundamentos con muestra mínima. Siguiente paso del camino: replay con datos reales en una plataforma profesional — lleva el ojo entrenado al ruido del mercado real.",
      resetStats: "Reiniciar estadísticas", resetConfirm: "Esto borra todo el progreso de este perfil. ¿Confirmar?",
      cancel: "Cancelar", confirmReset: "Sí, reiniciar",
      trialLeft: "prueba gratis", trialDays: "días",
      planTitle: "Tu período de prueba terminó",
      planText: "Entrenaste con acceso total durante " + TRIAL_DAYS + " días. Para seguir en el dojo, elige un plan:",
      proBtn: "Elegir (demostración)",
      plans: {
        base: { name: "Base", desc: ALLOWANCE.base.toLocaleString("es") + " puntos/mes · todos los drills, informe y estudio dirigido." },
        plus: { name: "Plus", desc: ALLOWANCE.plus.toLocaleString("es") + " puntos/mes · para quien entrena todos los días.", badge: "Más popular" },
        master: { name: "Master", desc: "Puntos ilimitados · mercado EN VIVO (niveles 4–6)." },
      },
      points: "Puntos", ptsMonth: "se renuevan cada mes",
      ptsCost: "Cada sesión consume " + SCENARIO_COST + " puntos; una lectura correcta devuelve " + CORRECT_REFUND + "; cada " + STREAK_EVERY + " aciertos seguidos, una sesión gratis.",
      ptsRefund: "puntos devueltos por la lectura correcta",
      ptsStreakBonus: "bono de racha: sesión gratis",
      creditsTitle: "Te quedaste sin puntos",
      creditsText: "Los puntos se renuevan al inicio de cada mes según tu plan. Puedes esperar la renovación, comprar un paquete suelto o subir de plan — quien acierta más, entrena más con los mismos puntos.",
      buyCredits: "Comprar " + CREDIT_PACK + " puntos (demostración)",
      proNote: "En producción este botón abre el checkout. Aquí solo demuestra el flujo.",
      proActive: "Plan activo",
      switchUser: "Cambiar perfil",
      disclaimer: "Escenarios sintéticos para entrenar fundamentos — no son datos reales ni recomendación de operación.",
      belts: ["Blanco", "Amarillo", "Naranja", "Verde", "Azul", "Marrón", "Negro"],
      answers: { buy: "Compradora", sell: "Vendedora", none: "Sin lectura" },
      refs: { min: "mínimo de referencia", max: "máximo de referencia", rtop: "techo del rango", rbot: "piso del rango" },
    },
    cats: {
      absorcao: {
        name: "Absorción en extremo",
        tapeBuy: ["Lotes grandes golpeando el bid sin parar, pero el precio no hace nuevo mínimo — la liquidez pasiva de compra recarga en el mismo nivel.", "Los vendedores descargan lotes pesados en el bid durante minutos y el precio simplemente no cede — cada oleada encuentra compra pasiva esperando en el mismo nivel.", "El times & trades muestra ventas agresivas en serie en el mínimo, pero no imprime nuevo mínimo — la cola de compra del book se recompone apenas se consume."],
        tapeSell: ["Lotes grandes golpeando el ask sin parar, pero el precio no hace nuevo máximo — la liquidez pasiva de venta recarga en el mismo nivel.", "Los compradores descargan lotes pesados en el ask durante minutos y el precio simplemente no avanza — cada oleada encuentra venta pasiva esperando en el mismo nivel.", "El times & trades muestra compras agresivas en serie en el máximo, pero no imprime nuevo máximo — la cola de venta del book se recompone apenas se consume."],
        expBuy: "El volumen explotó con delta fuertemente NEGATIVO, pero el precio no cayó: rango pequeño y cierre en el tercio superior. Esfuerzo sin resultado — un participante grande compra pasivamente toda la agresión vendedora. Agotada la agresión, el camino de menor resistencia es al alza.",
        expSell: "El volumen explotó con delta fuertemente POSITIVO, pero el precio no subió: rango pequeño y cierre en el tercio inferior. Un participante grande vende pasivamente ante toda la agresión compradora. El camino de menor resistencia es a la baja.",
        watch: "La absorción vale mientras el nivel aguanta. Si el extremo se rompe, la lectura queda invalidada.",
        study: "Absorción es esfuerzo sin resultado: agresión intensa que no mueve el precio porque alguien grande la absorbe pasivamente — la firma clásica de un institucional defendiendo un nivel (Wyckoff).",
        points: ["Volumen muy por encima del promedio justo en el extremo", "Delta fuerte EN CONTRA de la dirección que el precio rechaza", "Rango pequeño y cierre contra la agresión"],
      },
      divergencia: {
        name: "Divergencia de delta",
        tapeSell: ["El precio imprime máximos más altos, pero la agresión compradora se adelgaza en cada avance — los lotes agresores se encogen.", "Cada nuevo máximo sale con menos negocios agresores que el anterior — el precio sigue avanzando mientras la participación compradora se seca.", "El precio renueva el techo, pero el tape muestra agresión compradora cada vez menor en cada pierna — los prints grandes desaparecieron."],
        tapeBuy: ["El precio imprime mínimos más bajos, pero la agresión vendedora se adelgaza en cada caída — los lotes agresores se encogen.", "Cada nuevo mínimo sale con menos negocios agresores que el anterior — el precio sigue cayendo mientras la participación vendedora se seca.", "El precio renueva el piso, pero el tape muestra agresión vendedora cada vez menor en cada pierna — los prints grandes desaparecieron."],
        expSell: "Nuevos máximos con delta encogiéndose y volviéndose negativo: el avance corre sin combustible — probable recompra de cortos, no compra nueva. Sin agresión real, la fuerza dominante pasa a ser vendedora.",
        expBuy: "Nuevos mínimos con delta encogiéndose y volviéndose positivo: la caída perdió combustible — no hay vendedor nuevo agrediendo. La fuerza dominante pasa a ser compradora.",
        watch: "La divergencia es aviso, no gatillo: espera la falla del extremo antes de actuar.",
        study: "La divergencia compara esfuerzo (delta) con resultado (precio). Precio avanzando con agresión decreciente delata un movimiento sin participación — combustible agotándose pierna a pierna.",
        points: ["Extremos progresivos en el precio", "Delta decreciente en cada pierna", "Última pierna con delta contrario o mecha de rechazo"],
      },
      iniciativa: {
        name: "Iniciativa (ruptura)",
        tapeBuy: ["En la ruptura, el tape acelera: lotes grandes golpeando el ask en secuencia y el book de venta consumido nivel tras nivel, sin recarga.", "El nivel se rompe con prints grandes y rápidos en el ask; la liquidez de venta desaparece de la pantalla sin reponerse.", "En la ruptura del rango, la velocidad del tape se dispara: agresión compradora en ráfagas, el book de venta evaporándose nivel a nivel."],
        tapeSell: ["En la ruptura, el tape acelera: lotes grandes golpeando el bid en secuencia y el book de compra consumido nivel tras nivel, sin recarga.", "El nivel se rompe con prints grandes y rápidos en el bid; la liquidez de compra desaparece de la pantalla sin reponerse.", "En la ruptura del rango, la velocidad del tape se dispara: agresión vendedora en ráfagas, el book de compra evaporándose nivel a nivel."],
        expBuy: "Ruptura con volumen alto, delta fuertemente positivo y cierre en el máximo: agresión real consumiendo liquidez — esfuerzo CON resultado. La iniciativa tiende a continuar: fuerza stops y atrae momentum.",
        expSell: "Ruptura con volumen alto, delta fuertemente negativo y cierre en el mínimo: agresión real consumiendo el book de compra. Esfuerzo con resultado — continuación vendedora.",
        watch: "El retest del nivel roto con delta aún a favor confirma; delta débil o mecha de retorno delata una trampa.",
        study: "La iniciativa es agresión que vence a la liquidez pasiva y desplaza el precio. Lo que la separa de la ruptura falsa es el delta alineado y la ausencia de recarga del book.",
        points: ["Volumen y delta alineados con la dirección", "Cierre cerca del extremo de la vela", "Continuación inmediata, sin retorno al rango"],
      },
      exaustao: {
        name: "Agotamiento climático",
        tapeSell: ["Explosión de negocios — el mayor volumen de la sesión — con compradores agrediendo en pánico, pero el precio se estira, lo devuelve casi todo y cierra cerca de la apertura.", "Pico histórico de negocios en la sesión: compra agresiva en cascada, pero la vela devuelve el avance y cierra donde empezó.", "El tape hierve en el techo — todos comprando a la vez — y aun así el precio no sostiene el estirón, volviendo a la apertura."],
        tapeBuy: ["Explosión de negocios — el mayor volumen de la sesión — con vendedores agrediendo en pánico, pero el precio se estira a la baja, lo devuelve y cierra cerca de la apertura.", "Pico histórico de negocios en la sesión: venta agresiva en cascada, pero la vela devuelve la caída y cierra donde empezó.", "El tape hierve en el piso — todos vendiendo a la vez — y aun así el precio no sostiene el estirón, volviendo a la apertura."],
        expSell: "Volumen récord con delta positivo, pero mecha superior enorme y cierre en la apertura: el esfuerzo máximo no produjo nada. Es el último comprador entrando en la distribución. Agotado el flujo, la fuerza se vuelve vendedora.",
        expBuy: "Volumen récord con delta negativo, pero mecha inferior enorme y cierre en la apertura: pánico de venta totalmente absorbido — capitulación. El último vendedor salió; la fuerza se vuelve compradora.",
        watch: "El clímax rara vez es el giro exacto: busca el test secundario del extremo con volumen mucho menor (Wyckoff).",
        study: "El agotamiento es el clímax del movimiento: participación máxima con progreso mínimo. El pico de esfuerzo marca el fin del combustible, no la continuación.",
        points: ["Volumen récord de la sesión en el extremo", "Mecha larga devolviendo el avance", "Cierre cerca de la apertura pese al delta fuerte"],
      },
      pullback: {
        name: "Pullback en tendencia",
        tapeBuy: ["En el retroceso, el tape se vacía: negocios pequeños y espaciados, ningún lote relevante golpeando el bid; el book de abajo sigue intacto.", "El retroceso llega a cuentagotas: prints pequeños, ningún lote institucional vendiendo; la estructura compradora de abajo permanece.", "Durante la corrección el tape casi se detiene — volumen mínimo, agresión irrelevante — mientras la liquidez de compra sigue posicionada."],
        tapeSell: ["En el rebote, el tape se vacía: negocios pequeños y espaciados, ningún lote relevante golpeando el ask; el book de arriba sigue intacto.", "El rebote llega a cuentagotas: prints pequeños, ningún lote institucional comprando; la estructura vendedora de arriba permanece.", "Durante la corrección el tape casi se detiene — volumen mínimo, agresión irrelevante — mientras la liquidez de venta sigue posicionada."],
        expBuy: "La tendencia vino con volumen y delta consistentes; el retroceso muestra volumen seco y delta débil — toma de ganancias, no venta institucional. Sin agresión contraria real, la fuerza dominante sigue compradora.",
        expSell: "La caída vino con volumen y delta consistentes; el rebote muestra volumen seco y delta débil — recompra de cortos, no compra nueva. La fuerza dominante sigue vendedora.",
        watch: "Un pullback que gana volumen y delta contrario creciente dejó de ser pullback.",
        study: "En una tendencia sana, las correcciones ocurren por ausencia del lado dominante, no por presencia del opuesto. Volumen seco en el retroceso es la firma.",
        points: ["Impulso con volumen y delta fuertes", "Corrección con volumen visiblemente menor", "Delta del retroceso débil, sin aceleración"],
      },
      mistos: {
        name: "Señales en conflicto",
        tape: ["El tape alterna: agresión fuerte en una vela, ausencia en la siguiente; delta y precio cuentan historias distintas en piernas consecutivas.", "Una vela trae agresión pesada, la siguiente llega vacía; el delta apunta a un lado y el cierre va al otro — nada se confirma.", "El tape no construye narrativa: prints grandes aislados, sin continuidad, con precio y delta contradiciéndose en cada pierna."],
        exp: "Volumen alto con delta casi nulo, velas contradiciendo el delta anterior, ningún nivel defendido con consistencia: no hay fuerza dominante legible. La lectura profesional aquí es una sola — quedarse fuera y esperar a que el mercado se defina.",
        watch: "No operar también es una lectura. La mayoría de las pérdidas nace de forzar interpretación donde no existe señal.",
        study: "El mercado pasa buena parte del tiempo ilegible. Reconocer la ausencia de señal protege el capital — la habilidad que separa disciplina de compulsión.",
        points: ["Delta y precio en desacuerdo, sin patrón", "Volumen sin confirmación de progreso", "Ningún nivel claramente defendido"],
      },
    },
  },
};

// ─────────────────── util ───────────────────
const rnd = (a, b) => a + Math.random() * (b - a);
const rndi = (a, b) => Math.round(rnd(a, b));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function buildCandles(closes, wick = 2.4) {
  const out = [];
  for (let i = 0; i < closes.length; i++) {
    const o = i === 0 ? closes[0] + rnd(-1.2, 1.2) : closes[i - 1];
    const c = closes[i];
    out.push({
      o, c,
      h: Math.max(o, c) + rnd(0.3, wick),
      l: Math.min(o, c) - rnd(0.3, wick),
      vol: rndi(30, 55), delta: 0,
    });
  }
  return out;
}
function trendCloses(n, start, step, noise, dir) {
  const cl = [start];
  for (let i = 1; i < n; i++) cl.push(cl[i - 1] + dir * rnd(step * 0.4, step) + rnd(-noise, noise));
  return cl;
}
function baseDeltas(candles, intensity = 0.55) {
  candles.forEach((k) => {
    const up = k.c >= k.o;
    const m = rndi(k.vol * 0.15, k.vol * intensity);
    k.delta = up ? m : -m;
  });
}

// ─────────────── geradores (universalizados, ~1000 unidades) ───────────────
function genAbsorcao(forceDir) {
  const dir = forceDir || pick([1, -1]); // -1: fundo → resposta buy
  const n = rndi(11, 16);
  const candles = buildCandles(trendCloses(n, 1000, rnd(1.4, 2.2), rnd(0.5, 0.9), dir));
  baseDeltas(candles);
  const last = candles[n - 1];
  last.vol = rndi(120, 160);
  if (dir === -1) {
    const ref = Math.min(...candles.map((k) => k.l));
    last.l = ref - rnd(0.1, 0.3);
    last.o = last.l + rnd(0.6, 0.9);
    last.c = last.o + rnd(0.35, 0.6);
    last.h = last.c + rnd(0.1, 0.25);
    last.delta = -rndi(last.vol * 0.55, last.vol * 0.75);
    return { catKey: "absorcao", dir, candles, ref: { price: last.l + 0.08, key: "min" } };
  } else {
    const ref = Math.max(...candles.map((k) => k.h));
    last.h = ref + rnd(0.1, 0.3);
    last.o = last.h - rnd(0.6, 0.9);
    last.c = last.o - rnd(0.35, 0.6);
    last.l = last.c - rnd(0.1, 0.25);
    last.delta = rndi(last.vol * 0.55, last.vol * 0.75);
    return { catKey: "absorcao", dir, candles, ref: { price: last.h - 0.08, key: "max" } };
  }
}

function genDivergencia(forceDir) {
  const dir = forceDir || pick([1, -1]); // 1: topos → resposta sell
  const n = rndi(11, 15);
  const candles = buildCandles(trendCloses(n, 998, rnd(1.2, 2.0), rnd(0.4, 0.7), dir));
  baseDeltas(candles, 0.55);
  const a = candles[n - 3], b = candles[n - 2], k = candles[n - 1];
  [a, b, k].forEach((cd, i) => {
    cd.vol = rndi(70, 95);
    const f = [0.5, 0.22, -0.12][i];
    cd.delta = Math.round(dir * cd.vol * f + rnd(-3, 3));
  });
  if (dir === 1) {
    b.o = a.c; b.c = a.c + rnd(0.5, 0.9); b.h = b.c + rnd(0.1, 0.25); b.l = b.o - rnd(0.1, 0.2);
    k.o = b.c; k.c = k.o + rnd(0.25, 0.5); k.h = k.c + rnd(0.4, 0.7); k.l = k.o - rnd(0.1, 0.2);
  } else {
    b.o = a.c; b.c = a.c - rnd(0.5, 0.9); b.l = b.c - rnd(0.1, 0.25); b.h = b.o + rnd(0.1, 0.2);
    k.o = b.c; k.c = k.o - rnd(0.25, 0.5); k.l = k.c - rnd(0.4, 0.7); k.h = k.o + rnd(0.1, 0.2);
  }
  return { catKey: "divergencia", dir, candles, ref: null };
}

function genIniciativa(forceDir) {
  const dir = forceDir || pick([1, -1]); // 1 → buy
  const n = rndi(8, 13);
  const closes = [];
  for (let i = 0; i < n; i++) closes.push(1000 + rnd(-1, 1));
  const candles = buildCandles(closes, 1);
  baseDeltas(candles, 0.35);
  const hi = Math.max(...candles.map((k) => k.h));
  const lo = Math.min(...candles.map((k) => k.l));
  const b1 = { o: closes[n - 1], vol: rndi(110, 140) };
  if (dir === 1) {
    b1.c = hi + rnd(0.8, 1.2); b1.h = b1.c + rnd(0.1, 0.2); b1.l = b1.o - rnd(0.1, 0.2);
    b1.delta = rndi(b1.vol * 0.55, b1.vol * 0.75);
  } else {
    b1.c = lo - rnd(0.8, 1.2); b1.l = b1.c - rnd(0.1, 0.2); b1.h = b1.o + rnd(0.1, 0.2);
    b1.delta = -rndi(b1.vol * 0.55, b1.vol * 0.75);
  }
  const b2 = { o: b1.c, c: b1.c + dir * rnd(0.4, 0.8), vol: rndi(85, 110) };
  b2.h = Math.max(b2.o, b2.c) + rnd(0.1, 0.2);
  b2.l = Math.min(b2.o, b2.c) - rnd(0.1, 0.2);
  b2.delta = Math.round(dir * b2.vol * rnd(0.45, 0.6));
  candles.push(b1, b2);
  return { catKey: "iniciativa", dir, candles, ref: { price: dir === 1 ? hi : lo, key: dir === 1 ? "rtop" : "rbot" } };
}

function genExaustao(forceDir) {
  const dir = forceDir || pick([1, -1]); // 1: alta esticada → sell
  const n = rndi(10, 14);
  const candles = buildCandles(trendCloses(n, 998, rnd(1.7, 2.5), rnd(0.35, 0.6), dir));
  baseDeltas(candles, 0.5);
  candles[n - 2].vol = rndi(80, 100);
  candles[n - 1].vol = rndi(95, 115);
  const prev = candles[n - 1];
  const k = { o: prev.c, vol: rndi(150, 190) };
  if (dir === 1) {
    k.h = k.o + rnd(1.6, 2.2); k.c = k.o + rnd(0.05, 0.3); k.l = k.o - rnd(0.15, 0.3);
    k.delta = rndi(k.vol * 0.4, k.vol * 0.55);
  } else {
    k.l = k.o - rnd(1.6, 2.2); k.c = k.o - rnd(0.05, 0.3); k.h = k.o + rnd(0.15, 0.3);
    k.delta = -rndi(k.vol * 0.4, k.vol * 0.55);
  }
  candles.push(k);
  return { catKey: "exaustao", dir, candles, ref: null };
}

function genPullback(forceDir) {
  const dir = forceDir || pick([1, -1]); // 1 → buy
  const m = rndi(7, 10);
  const candles = buildCandles(trendCloses(m, 998, rnd(1.5, 2.3), rnd(0.4, 0.7), dir));
  baseDeltas(candles, 0.55);
  let last = candles[m - 1].c;
  const pb = rndi(3, 5);
  for (let i = 0; i < pb; i++) {
    const o = last, c = o - dir * rnd(0.25, 0.55);
    candles.push({
      o, c,
      h: Math.max(o, c) + rnd(0.08, 0.18),
      l: Math.min(o, c) - rnd(0.08, 0.18),
      vol: rndi(16, 30),
      delta: Math.round(-dir * rnd(3, 9)),
    });
    last = c;
  }
  return { catKey: "pullback", dir, candles, ref: null };
}

function genMistos() {
  const n = rndi(11, 15);
  const closes = [];
  for (let i = 0; i < n; i++) closes.push(1000 + rnd(-1.6, 1.6));
  const candles = buildCandles(closes, 1.2);
  baseDeltas(candles, 0.4);
  // contradições deliberadas nos 3 últimos
  const a = candles[n - 3], b = candles[n - 2], k = candles[n - 1];
  a.vol = rndi(90, 115); a.delta = rndi(-8, 8); // volume alto, delta nulo
  a.c = a.o - rnd(0.2, 0.5); a.l = Math.min(a.l, a.c - 0.1);
  b.vol = rndi(20, 32); b.delta = rndi(-6, 6);
  b.c = b.o + rnd(0.2, 0.5); b.h = Math.max(b.h, b.c + 0.1);
  k.vol = rndi(70, 90); k.delta = -rndi(20, 35); // delta negativo…
  k.c = k.o + rnd(0.15, 0.4); k.h = Math.max(k.h, k.c + 0.1); // …mas fecha subindo
  return { catKey: "mistos", dir: 0, candles, ref: null };
}

const GEN = { absorcao: genAbsorcao, divergencia: genDivergencia, iniciativa: genIniciativa, exaustao: genExaustao, pullback: genPullback, mistos: genMistos };

function answerOf(s) {
  if (s.catKey === "mistos") return "none";
  if (s.catKey === "absorcao") return s.dir === -1 ? "buy" : "sell";
  if (s.catKey === "divergencia") return s.dir === 1 ? "sell" : "buy";
  if (s.catKey === "exaustao") return s.dir === 1 ? "sell" : "buy";
  return s.dir === 1 ? "buy" : "sell"; // iniciativa, pullback
}
function textsOf(s, dict) {
  const c = dict.cats[s.catKey];
  const pv = (t) => (Array.isArray(t) ? t[(s.v || 0) % t.length] : t);
  if (s.catKey === "mistos") return { tape: pv(c.tape), exp: c.exp, watch: c.watch, name: c.name };
  const ans = answerOf(s);
  return {
    tape: pv(ans === "buy" ? c.tapeBuy : c.tapeSell),
    exp: ans === "buy" ? c.expBuy : c.expSell,
    watch: c.watch, name: c.name,
  };
}

// repetição espaçada: mais peso para fundamentos fracos,
// excluindo os servidos recentemente para evitar sensação de loop
function pickCategory(byCat, exclude = []) {
  const pool = CAT_KEYS.filter((k) => !exclude.includes(k));
  const keys = pool.length ? pool : CAT_KEYS;
  const weights = keys.map((k) => {
    const s = byCat[k] || { total: 0, correct: 0 };
    const acc = s.total >= 3 ? s.correct / s.total : 0.5;
    return Math.max(0.15, 1.05 - acc);
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < keys.length; i++) {
    r -= weights[i];
    if (r <= 0) return keys[i];
  }
  return keys[0];
}

// ─────────────── persistência ───────────────
const monthKey = () => new Date().toISOString().slice(0, 7);
const emptyData = () => ({
  total: 0, correct: 0, streak: 0, best: 0, pro: false, tier: null,
  points: ALLOWANCE.free, pointsMonth: monthKey(),
  trialStart: Date.now(),
  mistakes: [],
  byCat: Object.fromEntries(CAT_KEYS.map((k) => [k, { total: 0, correct: 0 }])),
});
function monthlyAllowance(d) { return ALLOWANCE[d.tier || "free"] || ALLOWANCE.free; }
async function sGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch (e) { return null; }
}
function sSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* memória */ }
}

// ─────────────── gráfico ───────────────
function FlowChart({ scenario, dict, highlightLast = 0, height = 460 }) {
  const { candles, ref } = scenario;
  const W = 820, PRICE_H = 250, VOL_H = 66, DELTA_H = 76, GAP = 34;
  const H = PRICE_H + GAP + VOL_H + GAP + DELTA_H + 16;
  const n = candles.length, cw = W / n, bw = cw * 0.55;
  const hi = Math.max(...candles.map((k) => k.h));
  const lo = Math.min(...candles.map((k) => k.l));
  const pad = (hi - lo) * 0.08 || 0.5;
  const py = (p) => ((hi + pad - p) / (hi - lo + 2 * pad)) * PRICE_H;
  const maxVol = Math.max(...candles.map((k) => k.vol));
  const maxD = Math.max(...candles.map((k) => Math.abs(k.delta)), 1);
  const volTop = PRICE_H + GAP, deltaTop = volTop + VOL_H + GAP, deltaMid = deltaTop + DELTA_H / 2;
  const hlX = highlightLast > 0 ? (n - highlightLast) * cw - 4 : 0;

  return (
    <svg viewBox={"0 0 " + W + " " + H} className="w-full" role="img" aria-label={dict.ui.scenario}>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={W} y1={PRICE_H * f} y2={PRICE_H * f} stroke={C.grid} strokeWidth="1" strokeDasharray="4 6" />
      ))}
      {highlightLast > 0 && (
        <rect x={hlX} y={4} width={W - hlX - 2} height={H - 8} fill="rgba(244,123,32,0.10)"
          stroke={C.orange} strokeWidth="3" strokeDasharray="10 7" rx="12" />
      )}
      {ref && (
        <g>
          <line x1="0" x2={W} y1={py(ref.price)} y2={py(ref.price)} stroke={C.orange} strokeWidth="2.5" strokeDasharray="10 6" />
          <text x={W - 8} y={py(ref.price) - 8} textAnchor="end" fill={C.orange} fontSize="17" fontWeight="700">
            {dict.ui.refs[ref.key]}
          </text>
        </g>
      )}
      {candles.map((k, i) => {
        const x = i * cw + cw / 2, up = k.c >= k.o, col = up ? C.buy : C.sell;
        const top = py(Math.max(k.o, k.c));
        const hgt = Math.max(Math.abs(py(k.o) - py(k.c)), 2.5);
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={py(k.h)} y2={py(k.l)} stroke={col} strokeWidth="2.5" />
            <rect x={x - bw / 2} y={top} width={bw} height={hgt} fill={col} rx="2" />
          </g>
        );
      })}
      <text x="0" y={volTop - 10} fill={C.muted} fontSize="17" fontWeight="700">{dict.ui.volume}</text>
      {candles.map((k, i) => {
        const x = i * cw + cw / 2, h = (k.vol / maxVol) * VOL_H;
        return <rect key={i} x={x - bw / 2} y={volTop + VOL_H - h} width={bw} height={h}
          fill={k.vol === maxVol ? C.orange : "#5B60B8"} rx="2" />;
      })}
      <text x="0" y={deltaTop - 10} fill={C.muted} fontSize="17" fontWeight="700">{dict.ui.delta}</text>
      <line x1="0" x2={W} y1={deltaMid} y2={deltaMid} stroke={C.grid} strokeWidth="1.5" />
      {candles.map((k, i) => {
        const x = i * cw + cw / 2, h = (Math.abs(k.delta) / maxD) * (DELTA_H / 2 - 4), pos = k.delta >= 0;
        return <rect key={i} x={x - bw / 2} y={pos ? deltaMid - h : deltaMid} width={bw} height={Math.max(h, 2)}
          fill={pos ? C.buy : C.sell} rx="2" />;
      })}
    </svg>
  );
}

// ─────────────── marca ───────────────
function ToriiMark({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" rx="112" fill={C.bg} />
      <path d="M 76 172 C 168 132, 344 132, 436 172" fill="none" stroke={C.orange} strokeWidth="42" strokeLinecap="round" />
      <rect x="132" y="192" width="248" height="26" rx="10" fill={C.orange} />
      <rect x="122" y="262" width="268" height="22" rx="9" fill={C.orange} />
      <rect x="150" y="192" width="42" height="230" rx="12" fill={C.orange} />
      <rect x="320" y="192" width="42" height="230" rx="12" fill={C.orange} />
      <g stroke="#F5F6FF" strokeWidth="6" strokeLinecap="round">
        <line x1="224" y1="342" x2="224" y2="412" /><line x1="256" y1="316" x2="256" y2="400" /><line x1="288" y1="292" x2="288" y2="384" />
      </g>
      <g fill="#F5F6FF">
        <rect x="212" y="356" width="24" height="38" rx="5" /><rect x="244" y="330" width="24" height="42" rx="5" /><rect x="276" y="304" width="24" height="46" rx="5" />
      </g>
    </svg>
  );
}

// ═══════════════════ APP ═══════════════════
export default function App() {
  const [lang, setLang] = useState("pt");
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [data, setData] = useState(emptyData);
  const [scenario, setScenario] = useState(null);
  const [recentCats, setRecentCats] = useState([]);
  const [answered, setAnswered] = useState(null);
  const [view, setView] = useState("train"); // train | report | study | plan
  const [studyCat, setStudyCat] = useState(null);
  const [askReset, setAskReset] = useState(false);
  const [pointsDelta, setPointsDelta] = useState(0);
  const [planReason, setPlanReason] = useState("trial"); // 'trial' | 'points'

  const dict = L[lang];
  const U = dict.ui;

  // boot: idioma + lista de perfis
  useEffect(() => {
    (async () => {
      const savedLang = await sGet("td:lang");
      if (savedLang && L[savedLang]) setLang(savedLang);
      const list = await sGet("td:users");
      if (Array.isArray(list)) setUsers(list);
    })();
  }, []);

  function changeLang(v) { setLang(v); sSet("td:lang", v); }

  async function enter(name) {
    const nm = name.trim();
    if (!nm) return;
    let list = users.includes(nm) ? users : [...users, nm];
    setUsers(list); sSet("td:users", list);
    const saved = await sGet("td:data:" + nm);
    const base = emptyData();
    const d = saved ? { ...base, ...saved, byCat: { ...base.byCat, ...(saved.byCat || {}) } } : base;
    if (!d.trialStart) d.trialStart = Date.now(); // migração de perfis antigos
    if (typeof d.points !== "number") { d.points = monthlyAllowance(d); d.pointsMonth = monthKey(); }
    if (d.pointsMonth !== monthKey()) { d.points = monthlyAllowance(d); d.pointsMonth = monthKey(); } // renovação mensal
    setData(d); setUser(nm);
    serveScenario(d);
  }

  function persist(d) { if (user) sSet("td:data:" + user, d); }

  function trialDaysLeft(d) {
    return Math.max(0, TRIAL_DAYS - Math.floor((Date.now() - (d.trialStart || Date.now())) / 86400000));
  }
  function limitReached(d) { return !d.pro && trialDaysLeft(d) <= 0; }
  const unlimitedPts = (d) => d.tier === "master";

  function serveScenario(d) {
    if (limitReached(d)) { setPlanReason("trial"); setView("plan"); setScenario(null); return; }
    if (!unlimitedPts(d) && d.points < SCENARIO_COST) { setPlanReason("points"); setView("plan"); setScenario(null); return; }
    const cat = pickCategory(d.byCat, recentCats);
    setRecentCats((r) => [cat, ...r].slice(0, 2));
    const sc = GEN[cat]();
    sc.v = Math.floor(Math.random() * 97); // índice estável da variação de tape
    if (!unlimitedPts(d)) {
      const nd = { ...d, points: d.points - SCENARIO_COST };
      setData(nd); persist(nd);
    }
    setScenario(sc);
    setAnswered(null);
    setPointsDelta(0);
    setView("train");
  }

  // volta ao treino sem cobrar de novo um cenário ainda não respondido
  function goTrain() {
    if (scenario && !answered) { setView("train"); return; }
    serveScenario(data);
  }

  function respond(choice) {
    if (!scenario || answered) return;
    setAnswered(choice);
    const correct = answerOf(scenario);
    const ok = choice === correct;
    setData((prev) => {
      const newStreak = ok ? prev.streak + 1 : 0;
      let refund = 0;
      if (ok && !unlimitedPts(prev)) {
        refund = CORRECT_REFUND + (newStreak > 0 && newStreak % STREAK_EVERY === 0 ? STREAK_BONUS : 0);
      }
      setPointsDelta(refund);
      const next = {
        ...prev,
        total: prev.total + 1,
        correct: prev.correct + (ok ? 1 : 0),
        streak: newStreak,
        points: prev.points + refund,
        byCat: { ...prev.byCat },
        mistakes: ok ? prev.mistakes : [{ cat: scenario.catKey, chosen: choice, correct, t: Date.now() }, ...prev.mistakes].slice(0, 8),
      };
      next.best = Math.max(next.best, next.streak);
      const c = next.byCat[scenario.catKey] || { total: 0, correct: 0 };
      next.byCat[scenario.catKey] = { total: c.total + 1, correct: c.correct + (ok ? 1 : 0) };
      persist(next);
      return next;
    });
  }

  function resetData() {
    const d = { ...emptyData(), pro: data.pro, tier: data.tier };
    setData(d); persist(d); setAskReset(false); serveScenario(d);
  }

  function activateTier(tier) {
    setData((prev) => {
      const n = { ...prev, pro: true, tier, points: Math.max(prev.points, ALLOWANCE[tier] || prev.points), pointsMonth: monthKey() };
      persist(n); return n;
    });
    setTimeout(() => serveScenario({ ...data, pro: true, tier, points: Math.max(data.points, ALLOWANCE[tier] || data.points) }), 0);
  }

  function buyCredits() {
    const nd = { ...data, points: data.points + CREDIT_PACK };
    setData(nd); persist(nd);
    serveScenario(nd);
  }

  const beltIdx = BELT_THRESHOLDS.reduce((acc, t, i) => (data.correct >= t ? i : acc), 0);
  const accuracy = data.total ? Math.round((data.correct / data.total) * 100) : 0;
  const weakest = CAT_KEYS.reduce((w, k) => {
    const s = data.byCat[k]; if (!s || s.total < 3) return w;
    const acc = s.correct / s.total;
    return !w || acc < w.acc ? { key: k, acc } : w;
  }, null);
  const graduated = CAT_KEYS.every((k) => {
    const s = data.byCat[k]; return s && s.total >= 30 && s.correct / s.total >= 0.7;
  });
  const daysLeft = trialDaysLeft(data);

  const btn = { minHeight: 60, fontSize: 20, fontWeight: 800, borderRadius: 14, border: "none", cursor: "pointer", letterSpacing: "0.02em" };
  const navBtn = (id, label) => (
    <button key={id} onClick={() => { if (id === "train") goTrain(); else setView(id); }}
      style={{ ...btn, minHeight: 54, fontSize: 18, padding: "10px 18px", background: view === id ? C.orange : C.navy, color: "#fff" }}>
      {label}
    </button>
  );

  // ── onboarding ──
  if (!user) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "Inter, system-ui, sans-serif", fontSize: 19, lineHeight: 1.55 }}>
        <div className="max-w-xl mx-auto px-5 py-12 text-center">
          <div className="flex justify-center mb-4"><ToriiMark size={120} /></div>
          <h1 style={{ fontSize: 40, fontWeight: 800 }}>
            <span style={{ color: C.text }}>Tape</span><span style={{ color: C.orange }}>Dojo</span>
          </h1>
          <p style={{ color: C.orange, fontSize: 21, fontWeight: 700, marginBottom: 10 }}>{U.slogan}</p>
          <p style={{ color: C.muted, marginBottom: 24 }}>{U.intro}</p>

          <div className="flex justify-center gap-2 mb-8">
            {Object.keys(L).map((k) => (
              <button key={k} onClick={() => changeLang(k)}
                style={{ ...btn, minHeight: 54, fontSize: 18, padding: "10px 18px", background: lang === k ? C.orange : C.navy, color: "#fff" }}>
                {L[k].langName}
              </button>
            ))}
          </div>

          <label style={{ display: "block", textAlign: "left", fontWeight: 700, marginBottom: 8 }}>{U.yourName}</label>
          <input value={nameInput} onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") enter(nameInput); }}
            style={{ width: "100%", fontSize: 21, padding: "16px 18px", borderRadius: 14, border: "2px solid " + C.grid, background: C.surface, color: C.text, marginBottom: 14 }} />
          <button onClick={() => enter(nameInput)}
            style={{ ...btn, width: "100%", padding: 18, background: C.orange, color: "#231000" }}>
            {U.start}
          </button>

          {users.length > 0 && (
            <div style={{ marginTop: 28, textAlign: "left" }}>
              <p style={{ color: C.muted, fontWeight: 700, marginBottom: 10 }}>{U.selectProfile}</p>
              <div className="flex flex-wrap gap-2">
                {users.map((u) => (
                  <button key={u} onClick={() => enter(u)}
                    style={{ ...btn, minHeight: 54, fontSize: 18, padding: "10px 20px", background: C.surface, border: "2px solid " + C.grid, color: C.text }}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p style={{ color: C.muted, fontSize: 16, marginTop: 40 }}>{U.disclaimer}</p>
        </div>
      </div>
    );
  }

  const catStats = (k) => data.byCat[k] || { total: 0, correct: 0 };
  const catAcc = (k) => { const s = catStats(k); return s.total ? Math.round((s.correct / s.total) * 100) : 0; };

  // exemplo anotado (direção fixa p/ didática)
  const studyKey = studyCat || (weakest ? weakest.key : "absorcao");
  const studyExample = view === "study" ? GEN[studyKey](studyKey === "mistos" ? undefined : (studyKey === "absorcao" ? -1 : 1)) : null;
  const HL = { absorcao: 1, divergencia: 3, iniciativa: 2, exaustao: 1, pullback: 4, mistos: 3 };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "Inter, system-ui, sans-serif", fontSize: 19, lineHeight: 1.55 }}>
      <div className="max-w-3xl mx-auto px-4 py-5">

        {/* header */}
        <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <ToriiMark size={46} />
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>
                <span>Tape</span><span style={{ color: C.orange }}>Dojo</span>
              </div>
              <div style={{ color: C.muted, fontSize: 16 }}>{user} · <button onClick={() => setUser(null)} style={{ background: "none", border: "none", color: C.orange, cursor: "pointer", fontSize: 16, padding: 0, textDecoration: "underline" }}>{U.switchUser}</button></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={lang} onChange={(e) => changeLang(e.target.value)} aria-label="Language"
              style={{ fontSize: 17, padding: "12px 10px", borderRadius: 12, background: C.navy, color: "#fff", border: "none", minHeight: 54 }}>
              {Object.keys(L).map((k) => <option key={k} value={k}>{L[k].langName}</option>)}
            </select>
            {navBtn("train", U.train)}{navBtn("report", U.report)}{navBtn("study", U.study)}
          </div>
        </header>

        {/* placar */}
        <div className="flex flex-wrap gap-2 mb-4" aria-live="polite">
          <Chip label={U.belt} value={U.belts[beltIdx]} color={BELT_COLORS[beltIdx]} beltMode />
          <Chip label={U.points} value={data.tier === "master" ? "∞" : data.points} highlight={data.tier !== "master" && data.points <= SCENARIO_COST * 10} />
          <Chip label={U.accuracy} value={accuracy + "%"} />
          <Chip label={U.scenarios} value={data.total} />
          <Chip label={U.streak} value={data.streak} highlight={data.streak >= 5} />
          {!data.pro && <Chip label={U.trialLeft} value={daysLeft + " " + U.trialDays} highlight={daysLeft <= 2} />}
          {data.pro && data.tier && <Chip label="Plan" value={U.plans[data.tier].name} highlight />}
        </div>

        {graduated && view !== "study" && (
          <div style={{ background: "rgba(34,197,94,0.12)", border: "2px solid " + C.buy, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <p style={{ fontWeight: 800, fontSize: 21, color: C.buy, marginBottom: 4 }}>{U.gradTitle}</p>
            <p>{U.gradText}</p>
          </div>
        )}

        {/* ── TREINO ── */}
        {view === "train" && scenario && (
          <main>
            <section style={{ background: C.surface, borderRadius: 18, border: "1px solid " + C.grid, padding: 18 }} className="mb-4">
              <p style={{ color: C.muted, fontSize: 17, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {U.scenario} {data.total + 1} · {U.simMarket}
              </p>
              <FlowChart scenario={scenario} dict={dict} />
              <p style={{ marginTop: 14, background: C.card, borderLeft: "5px solid " + C.orange, borderRadius: 10, padding: "14px 16px" }}>
                <strong style={{ color: C.orange }}>{U.tapeLabel}:</strong> {textsOf(scenario, dict).tape}
              </p>
            </section>

            {!answered ? (
              <section>
                <p style={{ fontSize: 21, fontWeight: 700, marginBottom: 12 }}>{U.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button onClick={() => respond("buy")} style={{ ...btn, background: C.buy, color: "#06220F", padding: "16px 10px" }}>▲ {U.buy}</button>
                  <button onClick={() => respond("sell")} style={{ ...btn, background: C.sell, color: "#2B0606", padding: "16px 10px" }}>▼ {U.sell}</button>
                  <button onClick={() => respond("none")} style={{ ...btn, background: C.navy, color: "#fff", border: "2px solid " + C.grid, padding: "16px 10px" }}>◼ {U.none}</button>
                </div>
              </section>
            ) : (
              <section aria-live="polite">
                {(() => {
                  const correct = answerOf(scenario);
                  const ok = answered === correct;
                  const t = textsOf(scenario, dict);
                  return (
                    <div style={{ background: ok ? "rgba(34,197,94,0.14)" : "rgba(240,82,82,0.14)", border: "2px solid " + (ok ? C.buy : C.sell), borderRadius: 16, padding: 18, marginBottom: 14 }}>
                      <p style={{ fontSize: 23, fontWeight: 800, color: ok ? C.buy : C.sell, marginBottom: 6 }}>
                        {ok ? "✓ " + U.correct : "✗ " + U.wrong}
                        <span style={{ color: C.muted, fontWeight: 600, fontSize: 18, marginLeft: 10 }}>{t.name}</span>
                      </p>
                      <p style={{ marginBottom: 12 }}>{t.exp}</p>
                      {ok && pointsDelta > 0 && (
                        <p style={{ color: C.buy, fontWeight: 800, marginBottom: 12 }}>
                          ⚡ +{pointsDelta} {U.ptsRefund}{pointsDelta > CORRECT_REFUND ? " · " + U.ptsStreakBonus : ""}
                        </p>
                      )}
                      <p style={{ background: C.card, borderRadius: 10, padding: "12px 14px" }}>
                        <strong style={{ color: C.orange }}>{U.watchLabel}:</strong> {t.watch}
                      </p>
                    </div>
                  );
                })()}
                <button onClick={() => serveScenario(data)} style={{ ...btn, width: "100%", background: C.orange, color: "#231000", padding: 16 }}>
                  {U.nextBtn}
                </button>
              </section>
            )}
          </main>
        )}

        {/* ── PLANO / paywall ── */}
        {view === "plan" && (
          <main>
            <section style={{ background: C.surface, borderRadius: 18, border: "2px solid " + C.orange, padding: 24, textAlign: "center" }}>
              <div className="flex justify-center mb-3"><ToriiMark size={80} /></div>
              <h2 style={{ fontSize: 25, fontWeight: 800, marginBottom: 10 }}>
                {planReason === "points" ? U.creditsTitle : U.planTitle}
              </h2>
              <p style={{ color: C.muted, marginBottom: 18 }}>
                {planReason === "points" ? U.creditsText : U.planText}
              </p>

              {planReason === "points" && (
                <button onClick={buyCredits}
                  style={{ ...btn, background: C.buy, color: "#06220F", padding: "16px 28px", marginBottom: 22 }}>
                  ⚡ {U.buyCredits}
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ textAlign: "left" }}>
                {["base", "plus", "master"].map((pid) => {
                  const p = U.plans[pid];
                  const featured = pid === "plus";
                  const current = data.tier === pid;
                  return (
                    <div key={pid} style={{
                      background: C.card, borderRadius: 16, padding: 18, position: "relative",
                      border: featured ? "3px solid " + C.orange : "1px solid " + C.grid,
                      opacity: current ? 0.75 : 1,
                    }}>
                      {featured && p.badge && (
                        <span style={{ position: "absolute", top: -14, left: 14, background: C.orange, color: "#231000", fontWeight: 800, fontSize: 14, padding: "4px 12px", borderRadius: 999 }}>
                          {p.badge}
                        </span>
                      )}
                      <p style={{ fontWeight: 800, fontSize: 21, marginBottom: 4 }}>{p.name}</p>
                      <p style={{ color: C.orange, fontWeight: 800, fontSize: 23, marginBottom: 8 }}>{PLAN_PRICES[pid][lang]}</p>
                      <p style={{ color: C.muted, fontSize: 17, marginBottom: 14, minHeight: 72 }}>{p.desc}</p>
                      <button onClick={() => activateTier(pid)} disabled={current}
                        style={{ ...btn, width: "100%", minHeight: 54, fontSize: 18, padding: 12, background: current ? C.grid : featured ? C.orange : C.navy, color: featured && !current ? "#231000" : "#fff" }}>
                        {current ? U.proActive : U.proBtn}
                      </button>
                    </div>
                  );
                })}
              </div>
              <p style={{ color: C.muted, fontSize: 16, marginTop: 16 }}>{U.ptsCost}</p>
              <p style={{ color: C.muted, fontSize: 16, marginTop: 6 }}>{U.proNote}</p>
            </section>
          </main>
        )}

        {/* ── RELATÓRIO ── */}
        {view === "report" && (
          <main>
            <section style={{ background: C.surface, borderRadius: 18, border: "1px solid " + C.grid, padding: 20, marginBottom: 16 }}>
              <h2 style={{ fontSize: 23, fontWeight: 800, marginBottom: 16 }}>{U.reportTitle}</h2>
              {CAT_KEYS.map((k) => {
                const s = catStats(k), pct = catAcc(k);
                return (
                  <div key={k} style={{ marginBottom: 15 }}>
                    <div className="flex justify-between" style={{ marginBottom: 6 }}>
                      <span style={{ fontWeight: 700 }}>{dict.cats[k].name}</span>
                      <span style={{ color: C.muted }}>{s.total ? pct + "% (" + s.correct + "/" + s.total + ")" : U.noData}</span>
                    </div>
                    <div style={{ background: C.card, borderRadius: 8, height: 18 }}>
                      <div style={{ width: pct + "%", height: "100%", borderRadius: 8, background: pct >= 70 ? C.buy : pct >= 50 ? C.orange : C.sell, transition: "width 300ms ease" }} />
                    </div>
                  </div>
                );
              })}
              <p style={{ color: C.muted, marginTop: 14 }}>{U.gradGoal}</p>
              {weakest && (
                <button onClick={() => { setStudyCat(weakest.key); setView("study"); }}
                  style={{ ...btn, width: "100%", marginTop: 14, background: C.orange, color: "#231000", padding: 14 }}>
                  🥋 {U.studyWeakBtn}: {dict.cats[weakest.key].name}
                </button>
              )}
            </section>

            {data.mistakes.length > 0 && (
              <section style={{ background: C.surface, borderRadius: 18, border: "1px solid " + C.grid, padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 21, fontWeight: 800, marginBottom: 12 }}>{U.lastMistakes}</h3>
                {data.mistakes.map((m, i) => (
                  <div key={i} style={{ borderLeft: "4px solid " + C.sell, background: C.card, borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
                    <strong>{dict.cats[m.cat].name}</strong>
                    <span style={{ color: C.muted }}> — {U.yourAnswer}: {U.answers[m.chosen]} · {U.correctAnswer}: <span style={{ color: C.buy, fontWeight: 700 }}>{U.answers[m.correct]}</span></span>
                  </div>
                ))}
              </section>
            )}

            {!askReset ? (
              <button onClick={() => setAskReset(true)} style={{ ...btn, minHeight: 54, fontSize: 18, padding: "12px 20px", background: "transparent", color: C.sell, border: "2px solid " + C.sell }}>
                {U.resetStats}
              </button>
            ) : (
              <div style={{ background: "rgba(240,82,82,0.12)", border: "2px solid " + C.sell, borderRadius: 14, padding: 16 }}>
                <p style={{ fontWeight: 700, marginBottom: 12 }}>{U.resetConfirm}</p>
                <div className="flex gap-3">
                  <button onClick={() => setAskReset(false)} style={{ ...btn, minHeight: 54, fontSize: 18, padding: "10px 20px", background: C.navy, color: "#fff" }}>{U.cancel}</button>
                  <button onClick={resetData} style={{ ...btn, minHeight: 54, fontSize: 18, padding: "10px 20px", background: C.sell, color: "#2B0606" }}>{U.confirmReset}</button>
                </div>
              </div>
            )}
          </main>
        )}

        {/* ── ESTUDO DIRIGIDO ── */}
        {view === "study" && studyExample && (
          <main>
            <section style={{ background: C.surface, borderRadius: 18, border: "1px solid " + C.grid, padding: 20, marginBottom: 16 }}>
              <p style={{ color: C.orange, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 16, marginBottom: 4 }}>{U.studyTitle}</p>
              <h2 style={{ fontSize: 25, fontWeight: 800, marginBottom: 10 }}>{dict.cats[studyKey].name}</h2>
              <p style={{ marginBottom: 16 }}>{dict.cats[studyKey].study}</p>

              <h3 style={{ fontSize: 19, fontWeight: 800, color: C.orange, marginBottom: 8 }}>{U.keyPoints}</h3>
              <div style={{ marginBottom: 18 }}>
                {dict.cats[studyKey].points.map((p, i) => (
                  <p key={i} style={{ background: C.card, borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
                    <span style={{ color: C.orange, fontWeight: 800, marginRight: 8 }}>{i + 1}.</span>{p}
                  </p>
                ))}
              </div>

              <h3 style={{ fontSize: 19, fontWeight: 800, color: C.orange, marginBottom: 8 }}>{U.example}</h3>
              <FlowChart scenario={studyExample} dict={dict} highlightLast={HL[studyKey]} />

              <p style={{ color: C.muted, marginTop: 14 }}><strong style={{ color: C.text }}>{U.reading}:</strong> {READS[studyKey]}</p>
            </section>

            <div className="flex flex-wrap gap-2 mb-4">
              {CAT_KEYS.filter((k) => k !== studyKey).map((k) => (
                <button key={k} onClick={() => setStudyCat(k)}
                  style={{ ...btn, minHeight: 54, fontSize: 17, padding: "10px 16px", background: C.navy, color: "#fff" }}>
                  {dict.cats[k].name} · {catStats(k).total ? catAcc(k) + "%" : "—"}
                </button>
              ))}
            </div>

            <button onClick={() => serveScenario(data)} style={{ ...btn, width: "100%", background: C.orange, color: "#231000", padding: 16 }}>
              {U.backTrain}
            </button>
          </main>
        )}

        <footer style={{ color: C.muted, fontSize: 16, marginTop: 22 }}>
          {U.disclaimer}
        </footer>
      </div>
    </div>
  );
}

function Chip({ label, value, highlight, color, beltMode }) {
  return (
    <div style={{
      background: highlight ? "rgba(244,123,32,0.18)" : "#1B1E52",
      border: "1px solid " + (highlight ? "#F47B20" : "#34386F"),
      borderRadius: 12, padding: "8px 16px", minWidth: 104, textAlign: "center",
    }}>
      <div style={{ fontSize: 15, color: "#A9AEDB", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 800, color: highlight ? "#F47B20" : "#F5F6FF", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {beltMode && <span style={{ width: 26, height: 10, borderRadius: 5, background: color, border: "1px solid #34386F", display: "inline-block" }} />}
        {value}
      </div>
    </div>
  );
}
