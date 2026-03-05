export const quizData = {
  "versao": "quiz-v2",
  "descricao": "Perguntas e opções do Quiz V2 (onboarding) extraídas do código.",
  "carousel": {
    "step": 1,
    "flow": "all",
    "slides": [
      {
        "id": "1",
        "title": "Treinos completos para educar seu cachorro",
        "subtitle": "Mais de 70 treinos, jogos práticos e exercícios para o dia a dia. Além de um guia para entender o comportamento diário do seu cão."
      },
      {
        "id": "2",
        "title": "15 minutos por dia já fazem diferença",
        "subtitle": "Treinos rápidos e objetivos que cabem na sua rotina, sem complicação. Sem precisar de experiência prévia."
      },
      {
        "id": "3",
        "title": "Resultados que evoluem com o tempo",
        "subtitle": "Quanto mais você segue a rotina com o PetGuia, mais o comportamento do seu cão melhora. Funciona para filhotes e cães adultos."
      }
    ]
  },
  "intention": {
    "step": 2,
    "flow": "all",
    "title": "O que você mais quer trabalhar com seu cachorro agora?",
    "options": [
      {
        "id": "behavior",
        "emoji": "🐾",
        "title": "Corrigir um comportamento que está me incomodando",
        "description": "(xixi, latidos, destruição, ansiedade, puxar a guia, mordidas…)"
      },
      {
        "id": "commands",
        "emoji": "🎓",
        "title": "Ensinar comandos e melhorar a obediência",
        "description": "(sentar, deitar, vir quando chama, truques)"
      },
      {
        "id": "puppy",
        "emoji": "🐶",
        "title": "Começar do jeito certo com um filhote",
        "description": "(rotina, limites, hábitos desde cedo)"
      },
      {
        "id": "general",
        "emoji": "🙂",
        "title": "Nada específico, só quero treinar e evoluir aos poucos",
        "description": ""
      }
    ]
  },
  "shared": {
    "gender": {
      "step": 3,
      "flow": "all",
      "title": "Seu cão é macho ou fêmea?",
      "subtitle": "Isso ajuda a ajustar orientações de comportamento e saúde.",
      "options": ["Macho", "Fêmea"]
    },
    "name": {
      "step": 4,
      "flow": "all",
      "title": "Qual é o nome do seu cão?",
      "subtitle": "Usaremos o nome ao longo do plano para deixá-lo mais pessoal.",
      "tipo": "texto",
      "maxLength": 50
    },
    "age": {
      "step": 5,
      "flow": "all",
      "title": "Quantos anos tem o seu cão?",
      "subtitle_behavior_commands": "A idade influencia no ritmo e no nível dos exercícios.",
      "subtitle_puppy_general": "A idade influencia no ritmo e no tipo de aprendizado.",
      "options": ["0–6 meses", "7–12 meses", "1–2 anos", "2–7 anos", "Mais de 7 anos"]
    },
    "breed": {
      "step": 6,
      "flow": "all",
      "title": "Qual é a raça do seu cão?",
      "tipo": "raca",
      "fonte": "BreedSelector (lista no componente legacy)"
    },
    "health": {
      "step": 8,
      "flow": "all",
      "title": "Seu cão tem alguma condição de saúde que devemos considerar?",
      "subtitle_behavior_commands": "Isso nos ajuda a personalizar o plano e evitar limitações.",
      "subtitle_puppy": "Isso nos ajuda a adaptar os treinos com segurança.",
      "subtitle_general": "Isso nos ajuda a adaptar a rotina com segurança.",
      "options": ["Meu cão é saudável", "Visão", "Audição", "Mobilidade", "Dental", "Outro"],
      "multiselect": true
    },
    "activity": {
      "step": 9,
      "flow": "all",
      "title": "Nível de atividade do seu cão",
      "subtitle_behavior_commands": "Usamos isso para ajustar a intensidade do seu plano.",
      "subtitle_puppy": "Usamos isso para ajustar a intensidade da rotina desde o início.",
      "subtitle_general": "Usamos isso para ajustar a intensidade da rotina.",
      "options": ["Muito ativo", "Moderadamente ativo", "Pouca atividade"]
    },
    "time": {
      "step": { "behavior": 20, "commands": 18, "puppy": 18, "general": 17 },
      "flow": "all",
      "title": "Quanto tempo por dia você consegue treinar seu cachorro?",
      "subtitle": "Sua resposta define o tipo de treino que iremos montar, ele muda completamente dependendo disso.",
      "options": ["5–10 minutos", "10–20 minutos", "20–30 minutos", "Mais de 30 minutos"]
    }
  },
  "interstitials": {
    "social_proof": {
      "step": 7,
      "flow": "all",
      "type": "interstitial",
      "background_color": "#8780F9",
      "component": "SocialProofStep",
      "title_template": "Por fluxo: behavior = \"{dogName} está em boa companhia!\"; commands = \"{dogName} está em boa companhia!\"; puppy = \"{dogName} está começando do jeito certo!\"; general = \"{dogName} está dando os próximos passos!\"",
      "subtitle_template": "Por fluxo: behavior = \"Mais de 20.000 cães e tutores, incluindo {breed} de {age}, já transformaram o comportamento com o PetGuia.\"; commands = \"... já melhoraram a obediência com o PetGuia.\"; puppy = \"Milhares de filhotes, incluindo {breed} de {age}, já iniciaram uma rotina equilibrada com o PetGuia.\"; general = \"Milhares de cães, incluindo {breed} de {age}, evoluem todos os dias com o PetGuia.\"",
      "content": {
        "description": "Tela fullscreen roxa com imagem de fundo (mundo), foto da raça do cão, título e subtítulo dinâmicos por entryType usando dogName, breed e ageRange. Botão Continuar."
      }
    },
    "intermediate": {
      "step": { "behavior": 12, "commands": 10, "puppy": 10, "general": 10 },
      "flow": "all",
      "type": "interstitial",
      "background_color": "#4c54fe",
      "component": "IntermediateScreen",
      "title": "Personalizando perguntas para {article} {dogName}",
      "subtitle_template": "Dinâmico por raça e nível de atividade (ex.: \"Shih Tzus com atividade moderada evoluem melhor com treinos curtos, previsíveis e repetidos ao longo do dia.\")",
      "footer_template": "Dinâmico por raça (ex.: \"Estamos organizando o plano do {dogName} respeitando esse ritmo de aprendizado.\")",
      "content": {
        "description": "Tela fullscreen roxa/azul com imagem personalizada (raça + atividade), borda com animação de progresso circular, título fixo com artigo (o/a) + nome do cão, subtítulo e footer por raça. Auto-avanço após animação."
      }
    },
    "progress_screen": {
      "step": { "behavior": 19, "commands": 17, "puppy": 17, "general": 16 },
      "flow": "all",
      "type": "interstitial",
      "background_color": "#35B440",
      "component": "ProgressScreenShared",
      "title": "Evolução do plano do {dogName}",
      "card_title": "Evolução do plano do {dogName}",
      "highlight_title": "Veja resultados já nos primeiros dias",
      "highlight_description_template": "Por problema (q9) ou default: 98% dos tutores do PetGuia relatam melhorias significativas no comportamento do cão nos primeiros dias de treino. Para filhote: 98% dos tutores relatam uma rotina mais organizada nos primeiros dias.",
      "content": {
        "description": "Tela fullscreen verde com card branco contendo gráfico de evolução (curva Novato → Com o PetGuia), labels AGORA e data alvo (ou \"Nos próximos 30 dias\"), badge de destaque com título e descrição por problema, botão Continuar."
      }
    }
  },
  "entry1_behavior": {
    "commands": {
      "step": 10,
      "flow": "behavior",
      "title": "Quais comandos o seu cão já sabe?",
      "subtitle": "Isso acelera o progresso evitando repetir treinos.",
      "options": ["Sentar", "Deitar", "Ficar", "Vir quando chama", "Andar sem puxar", "Nenhum comando"],
      "multiselect": true
    },
    "identification_commands": {
      "step": 11,
      "flow": "behavior",
      "statement": "O meu cão ignora frequentemente as minhas ordens e não é obediente",
      "questionSubtitle": "Identifica-se com esta afirmação?",
      "tipo": "slider",
      "labels": ["Não me identifico", "Me identifico totalmente"]
    },
    "problems": {
      "step": 13,
      "flow": "behavior",
      "title": "Que problemas você tem com o seu cão em casa?",
      "subtitle": "Escolha tudo o que se aplica. Vamos priorizar depois para acelerar resultados.",
      "options": [
        "Xixi fora do lugar",
        "Latidos em excesso",
        "Mordidas",
        "Rói e danifica os móveis",
        "Pula nas visitas",
        "Ansiedade de separação"
      ],
      "multiselect": true
    },
    "priority_modal": {
      "step": "13b",
      "flow": "behavior",
      "trigger": "Exibido somente quando o usuário seleciona 2 ou mais problemas na pergunta 'problems' (step 13) e clica em Continuar. Se selecionar apenas 1 problema, o fluxo segue direto para identification-problem (step 14) sem exibir o modal; o problema único é salvo automaticamente em q9 como prioritário. O modal é aberto dentro do próprio ProblemsStepRefined (setShowPriorityModal(true)), não é um step separado no FLOW_MAPS.",
      "title": "Qual desses problemas te incomoda mais?",
      "subtitle": "Vamos focar nele primeiro para resultados rápidos"
    },
    "identification_problem": {
      "step": 14,
      "flow": "behavior",
      "statement_template": "Muitas vezes fico frustrado quando {problema_prioritario} acontece",
      "questionSubtitle": "Identifica-se com esta afirmação?",
      "tipo": "slider",
      "labels": ["Não me identifico", "Me identifico totalmente"]
    },
    "context": {
      "step": 15,
      "flow": "behavior",
      "subtitle": "Isso nos ajuda a ajustar o treino para a situação real do seu dia a dia.",
      "por_problema": {
        "mordidas": {
          "title": "Quando seu cachorro morde?",
          "options": ["Durante brincadeiras", "Quando fica animado", "Ao pegar objetos", "Praticamente sempre", "Não acontece"]
        },
        "latidos_excessivos": {
          "title": "Em quais situações o latido mais acontece?",
          "options": ["Quando fica sozinho", "Quando alguém passa na rua", "Durante brincadeiras", "Sem motivo aparente", "Não acontece"]
        },
        "xixi_fora_do_lugar": {
          "title": "Onde o xixi costuma acontecer?",
          "options": ["Em qualquer lugar da casa", "Sempre no mesmo lugar", "Quando fica muito tempo sozinho", "De madrugada", "Não acontece"]
        },
        "pula_nas_visitas": {
          "title": "Quando seu cachorro pula nas visitas?",
          "options": ["Assim que a visita chega", "Só quando fica muito animado", "Praticamente todas as vezes", "Não acontece"]
        },
        "roer_objetos": {
          "title": "O que seu cachorro costuma roer?",
          "options": ["Móveis", "Sapatos e roupas", "Brinquedos inadequados", "Qualquer coisa que encontra", "Não acontece"]
        },
        "ansiedade_de_separacao": {
          "title": "Como a ansiedade se manifesta?",
          "options": ["Late e geme quando saio", "Destrói coisas", "Faz xixi/cocô fora do lugar", "Fica muito agitado", "Não acontece"]
        },
        "outro": {
          "title": "Em quais situações isso acontece?",
          "options": ["Durante o dia", "À noite", "Quando está sozinho", "Na presença de outras pessoas", "Não tenho certeza"]
        }
      }
    },
    "impact": {
      "step": 16,
      "flow": "behavior",
      "por_problema": {
        "mordidas": {
          "title": "Quando isso acontece, qual é a parte mais difícil pra você lidar?",
          "options": ["Ficar envergonhado(a) na frente de outras pessoas", "Precisar pedir desculpas o tempo todo", "Medo de alguém se machucar", "Cansaço de lidar sempre com a mesma situação"]
        },
        "latidos_excessivos": {
          "title": "Quando isso acontece, qual é a parte mais difícil pra você lidar?",
          "options": ["Ficar envergonhado(a) na frente de outras pessoas", "Precisar pedir desculpas o tempo todo", "Medo de alguém se machucar", "Cansaço de lidar sempre com a mesma situação"]
        },
        "pula_nas_visitas": {
          "title": "Quando isso acontece, qual é a parte mais difícil pra você lidar?",
          "options": ["Ficar envergonhado(a) na frente de outras pessoas", "Precisar pedir desculpas o tempo todo", "Medo de alguém se machucar", "Cansaço de lidar sempre com a mesma situação"]
        },
        "xixi_fora_do_lugar": {
          "title": "Quando isso acontece, o que mais te incomoda?",
          "options": ["Ter que limpar ou consertar tudo depois", "Não entender por que ele faz isso", "Medo de virar um hábito difícil de corrigir", "Cansaço de lidar sempre com a mesma situação"]
        },
        "roer_objetos": {
          "title": "Quando isso acontece, o que mais te incomoda?",
          "options": ["Ter que limpar ou consertar tudo depois", "Não entender por que ele faz isso", "Medo de virar um hábito difícil de corrigir", "Cansaço de lidar sempre com a mesma situação"]
        },
        "ansiedade_de_separacao": {
          "title": "Quando isso acontece, o que mais te incomoda?",
          "options": ["Ter que limpar ou consertar tudo depois", "Não entender por que ele faz isso", "Medo de virar um hábito difícil de corrigir", "Cansaço de lidar sempre com a mesma situação"]
        },
        "outro": {
          "title": "Quando isso acontece, o que mais te incomoda?",
          "options": ["Ter que limpar ou consertar tudo depois", "Não entender por que ele faz isso", "Medo de virar um hábito difícil de corrigir", "Cansaço de lidar sempre com a mesma situação"]
        }
      }
    },
    "specific_situation": {
      "step": 17,
      "flow": "behavior",
      "titulo_grupo1": "Existe algum momento do dia em que você gostaria que esse comportamento já estivesse melhor?",
      "opcoes_grupo1": ["Quando fico fora de casa", "Durante a noite", "Em momentos de distração", "No dia a dia em geral", "Nenhum momento específico"],
      "titulo_grupo2": "Existe alguma situação específica em que você gostaria que o comportamento do seu cão já estivesse melhor?",
      "opcoes_grupo2": ["Receber visitas em casa", "Passeios mais tranquilos", "Mudança de rotina ou ambiente", "Viagens ou períodos fora de casa", "Nenhuma situação específica agora"]
    },
    "path_ab": {
      "step": { "behavior": 18, "commands": 16, "puppy": 16, "general": 15 },
      "flow": "all",
      "path_a": {
        "title": "Quando essa situação irá acontecer?",
        "subtitle_behavior": "Isso nos ajuda a organizar o plano com antecedência.",
        "subtitle_puppy": "Isso nos ajuda a preparar o comportamento do seu filhote com antecedência.",
        "tipo": "date_picker",
        "helper": "Você pode pular esta etapa se preferir"
      },
      "path_b": {
        "title_behavior_commands": "Em relação a isso, como você gostaria de conduzir o treino?",
        "title_puppy": "Como você gostaria de conduzir os primeiros treinos?",
        "title_general": "Como você gostaria de começar?",
        "options": [
          { "value": "start_now", "label": "Quero começar agora" },
          { "value": "gradual", "label": "Prefiro evoluir aos poucos" },
          { "value": "evaluating", "label": "Ainda estou avaliando" }
        ]
      }
    }
  },
  "entry2_commands": {
    "commands": {
      "step": 11,
      "flow": "commands",
      "title": "Quais comandos o seu cão já sabe?",
      "subtitle": "Isso acelera o progresso evitando repetir treinos.",
      "options": ["Sentar", "Deitar", "Ficar", "Vir quando chama", "Andar sem puxar", "Nenhum comando"],
      "multiselect": true
    },
    "blockage": {
      "step": 12,
      "flow": "commands",
      "title": "O que mais dificulta a evolução do treino hoje?",
      "subtitle": "Identificar isso ajuda a ajustar a progressão correta.",
      "options": [
        "Ele até sabe os comandos, mas não obedece sempre",
        "Só obedece quando tem petisco",
        "Se distrai com qualquer coisa",
        "Não mantém atenção por muito tempo",
        "Só funciona quando eu repito várias vezes",
        "Ainda estamos começando"
      ]
    },
    "behavior": {
      "step": 13,
      "flow": "commands",
      "title": "Além dos comandos, existe algo que você gostaria de melhorar no dia a dia?",
      "subtitle": "Isso nos ajuda a ajustar o plano para situações reais.",
      "options": [
        "Xixi fora do lugar",
        "Latidos em excesso",
        "Destruição de objetos",
        "Ansiedade/Agitação",
        "Puxar a guia",
        "Nada específico por enquanto"
      ]
    },
    "identification": {
      "step": 14,
      "flow": "commands",
      "statement": "Quero um cachorro mais atento e obediente no dia a dia",
      "questionSubtitle": "Identifica-se com esta afirmação?",
      "tipo": "slider",
      "labels": ["Não me identifico", "Me identifico totalmente"]
    },
    "specific_situation": {
      "step": 15,
      "flow": "commands",
      "title": "Existe alguma situação específica em que você gostaria que o comportamento do seu cão já estivesse melhor?",
      "options": ["Receber visitas em casa", "Passeios mais tranquilos", "Mudança de rotina ou ambiente", "Viagens ou períodos fora de casa", "Nenhuma situação específica agora"]
    }
  },
  "entry3_puppy": {
    "puppy_goal": {
      "step": 11,
      "flow": "puppy",
      "title": "O que você mais quer ensinar ao seu filhote agora?",
      "subtitle": "Vamos organizar a base certa desde o começo.",
      "options": [
        "Fazer xixi no lugar certo",
        "Aprender a ficar calmo em casa",
        "Responder quando é chamado",
        "Criar uma rotina previsível",
        "Tudo isso, passo a passo"
      ]
    },
    "prevention": {
      "step": 12,
      "flow": "puppy",
      "title": "Quais comportamentos você mais quer evitar no crescimento do seu filhote?",
      "subtitle": "Ensinar cedo evita correções difíceis depois. O que o filhote repete hoje vira hábito amanhã.",
      "options": [
        "Mordidas em pessoas ou objetos",
        "Xixi fora do lugar",
        "Bagunça excessiva",
        "Dificuldade de rotina",
        "Ainda não sei, quero aprender"
      ],
      "multiselect": true
    },
    "daily_challenge": {
      "step": 13,
      "flow": "puppy",
      "title": "No dia a dia, o que você acha mais desafiador agora?",
      "subtitle": "Isso nos ajuda a adaptar os primeiros treinos.",
      "options": [
        "Saber como criar uma rotina",
        "Ter paciência com os erros",
        "Ensinar o que é certo e errado",
        "A energia e agitação do filhote",
        "Tudo é novo pra mim"
      ]
    },
    "identification": {
      "step": 14,
      "flow": "puppy",
      "statement": "Prefiro ensinar certo agora do que corrigir problemas depois",
      "questionSubtitle": "Identifica-se com esta afirmação?",
      "tipo": "slider",
      "labels": ["Não me identifico", "Me identifico totalmente"]
    },
    "specific_situation": {
      "step": 15,
      "flow": "puppy",
      "title": "Existe alguma situação em que você gostaria que o comportamento do {dogName} já estivesse bem desenvolvido?",
      "options": ["Receber visitas em casa", "Passeios mais tranquilos", "Mudança de rotina ou ambiente", "Viagens ou períodos fora de casa", "Nenhuma situação específica agora"]
    }
  },
  "entry4_general": {
    "exploratory": {
      "step": 11,
      "flow": "general",
      "title": "Em quais situações seu cachorro poderia se comportar melhor no dia a dia?",
      "subtitle": "Isso nos ajuda a direcionar os treinos certos.",
      "options": [
        "Quando chamamos, nem sempre ele vem",
        "Fica agitado em algumas situações",
        "Puxa a guia durante os passeios",
        "Late mais do que eu gostaria",
        "Dificuldade em manter atenção",
        "Nada específico no momento"
      ],
      "multiselect": true
    },
    "focus": {
      "step": 12,
      "flow": "general",
      "title": "O que você mais gostaria de melhorar primeiro?",
      "subtitle": "Vamos começar pelo que faz mais diferença para você.",
      "options": [
        "Mais atenção no dia a dia",
        "Mais calma em diferentes situações",
        "Passeios mais tranquilos",
        "Evoluir nos comandos básicos",
        "Ainda estou explorando"
      ]
    },
    "identification": {
      "step": 13,
      "flow": "general",
      "statement": "Quero evoluir o comportamento do meu cão aos poucos, sem pressão",
      "questionSubtitle": "Identifica-se com esta afirmação?",
      "tipo": "slider",
      "labels": ["Não me identifico", "Me identifico totalmente"]
    },
    "specific_situation": {
      "step": 14,
      "flow": "general",
      "title": "Existe alguma situação específica em que você gostaria que o comportamento do seu cão já estivesse melhor?",
      "options": ["Receber visitas em casa", "Passeios mais tranquilos", "Mudança de rotina ou ambiente", "Viagens ou períodos fora de casa", "Nenhuma situação específica agora"]
    }
  },
  "result_screen": {
    "step": { "behavior": 22, "commands": 20, "puppy": 20, "general": 19 },
    "flow": "all",
    "after_result": "paywall",
    "paywall_note": "Na web, o paywall será implementado com código diretamente na página, substituindo o Superwall. O CTA 'Quero desbloquear o plano' leva para essa tela de pagamento."
  },
  "fluxo_behavior_completo": [
    { "step": 1, "id": "carousel", "descricao": "Carrossel intro (3 slides)" },
    { "step": 2, "id": "intention", "descricao": "O que você mais quer trabalhar (4 opções)" },
    { "step": 3, "id": "gender", "descricao": "Seu cão é macho ou fêmea?" },
    { "step": 4, "id": "name", "descricao": "Qual é o nome do seu cão?" },
    { "step": 5, "id": "age", "descricao": "Quantos anos tem o seu cão?" },
    { "step": 6, "id": "breed", "descricao": "Qual é a raça do seu cão?" },
    { "step": 7, "id": "social_proof", "descricao": "Interstitial roxo: prova social (boa companhia)" },
    { "step": 8, "id": "health", "descricao": "Condição de saúde" },
    { "step": 9, "id": "activity", "descricao": "Nível de atividade" },
    { "step": 10, "id": "commands", "descricao": "Quais comandos o seu cão já sabe?" },
    { "step": 11, "id": "identification_commands", "descricao": "Identificação comandos (slider)" },
    { "step": 12, "id": "intermediate", "descricao": "Interstitial roxo/azul: personalizando perguntas" },
    { "step": 13, "id": "problems", "descricao": "Que problemas você tem com o seu cão?" },
    { "step": "13b", "id": "priority_modal", "descricao": "(Opcional) Modal: qual problema te incomoda mais? (se 2+ problemas)" },
    { "step": 14, "id": "identification_problem", "descricao": "Identificação problema (slider)" },
    { "step": 15, "id": "context", "descricao": "Contexto por problema (ex.: quando seu cachorro morde?)" },
    { "step": 16, "id": "impact", "descricao": "Impacto por problema" },
    { "step": 17, "id": "specific_situation_1", "descricao": "Situação específica (grupo 1 ou 2)" },
    { "step": 18, "id": "path_ab_1", "descricao": "Data alvo ou prioridade (começar agora / gradual / avaliando)" },
    { "step": 19, "id": "progress_1", "descricao": "Interstitial verde: evolução do plano (projeção de resultados)" },
    { "step": 20, "id": "time", "descricao": "Quanto tempo por dia para treinar?" },
    { "step": 21, "id": "preparation", "descricao": "Tela de preparação (antes do resultado)" },
    { "step": 22, "id": "result", "descricao": "Resultado personalizado (inclui código de indicação na própria tela)" }
  ],
  "fluxo_commands_completo": [
    { "step": 1, "id": "carousel", "descricao": "Carrossel intro (3 slides)" },
    { "step": 2, "id": "intention", "descricao": "O que você mais quer trabalhar (4 opções)" },
    { "step": 3, "id": "gender", "descricao": "Seu cão é macho ou fêmea?" },
    { "step": 4, "id": "name", "descricao": "Qual é o nome do seu cão?" },
    { "step": 5, "id": "age", "descricao": "Quantos anos tem o seu cão?" },
    { "step": 6, "id": "breed", "descricao": "Qual é a raça do seu cão?" },
    { "step": 7, "id": "social_proof", "descricao": "Interstitial roxo: prova social (boa companhia)" },
    { "step": 8, "id": "health", "descricao": "Condição de saúde" },
    { "step": 9, "id": "activity", "descricao": "Nível de atividade" },
    { "step": 10, "id": "intermediate", "descricao": "Interstitial roxo/azul: personalizando perguntas" },
    { "step": 11, "id": "commands", "descricao": "Quais comandos o seu cão já sabe?" },
    { "step": 12, "id": "blockage", "descricao": "O que mais dificulta a evolução do treino hoje?" },
    { "step": 13, "id": "extra_behavior", "descricao": "Além dos comandos, existe algo que gostaria de melhorar?" },
    { "step": 14, "id": "identification_light", "descricao": "Identificação obediência (slider)" },
    { "step": 15, "id": "specific_situation_2", "descricao": "Situação específica" },
    { "step": 16, "id": "path_ab_2", "descricao": "Data alvo ou prioridade" },
    { "step": 17, "id": "progress_2", "descricao": "Interstitial verde: evolução do plano (projeção de resultados)" },
    { "step": 18, "id": "time", "descricao": "Quanto tempo por dia para treinar?" },
    { "step": 19, "id": "preparation", "descricao": "Tela de preparação (antes do resultado)" },
    { "step": 20, "id": "result", "descricao": "Resultado personalizado (inclui código de indicação na própria tela)" }
  ],
  "fluxo_puppy_completo": [
    { "step": 1, "id": "carousel", "descricao": "Carrossel intro (3 slides)" },
    { "step": 2, "id": "intention", "descricao": "O que você mais quer trabalhar (4 opções)" },
    { "step": 3, "id": "gender", "descricao": "Seu cão é macho ou fêmea?" },
    { "step": 4, "id": "name", "descricao": "Qual é o nome do seu cão?" },
    { "step": 5, "id": "age", "descricao": "Quantos anos tem o seu cão?" },
    { "step": 6, "id": "breed", "descricao": "Qual é a raça do seu cão?" },
    { "step": 7, "id": "social_proof", "descricao": "Interstitial roxo: prova social (boa companhia)" },
    { "step": 8, "id": "health", "descricao": "Condição de saúde" },
    { "step": 9, "id": "activity", "descricao": "Nível de atividade" },
    { "step": 10, "id": "intermediate", "descricao": "Interstitial roxo/azul: personalizando perguntas" },
    { "step": 11, "id": "puppy_goal", "descricao": "O que você mais quer ensinar ao seu filhote agora?" },
    { "step": 12, "id": "prevention", "descricao": "Quais comportamentos você mais quer evitar no crescimento do filhote?" },
    { "step": 13, "id": "daily_challenge", "descricao": "No dia a dia, o que você acha mais desafiador agora?" },
    { "step": 14, "id": "identification_puppy", "descricao": "Identificação filhote (slider)" },
    { "step": 15, "id": "specific_situation_3", "descricao": "Situação específica" },
    { "step": 16, "id": "path_ab_3", "descricao": "Data alvo ou prioridade" },
    { "step": 17, "id": "progress_3", "descricao": "Interstitial verde: evolução do plano (projeção de resultados)" },
    { "step": 18, "id": "time", "descricao": "Quanto tempo por dia para treinar?" },
    { "step": 19, "id": "preparation", "descricao": "Tela de preparação (antes do resultado)" },
    { "step": 20, "id": "result", "descricao": "Resultado personalizado (inclui código de indicação na própria tela)" }
  ],
  "fluxo_general_completo": [
    { "step": 1, "id": "carousel", "descricao": "Carrossel intro (3 slides)" },
    { "step": 2, "id": "intention", "descricao": "O que você mais quer trabalhar (4 opções)" },
    { "step": 3, "id": "gender", "descricao": "Seu cão é macho ou fêmea?" },
    { "step": 4, "id": "name", "descricao": "Qual é o nome do seu cão?" },
    { "step": 5, "id": "age", "descricao": "Quantos anos tem o seu cão?" },
    { "step": 6, "id": "breed", "descricao": "Qual é a raça do seu cão?" },
    { "step": 7, "id": "social_proof", "descricao": "Interstitial roxo: prova social (boa companhia)" },
    { "step": 8, "id": "health", "descricao": "Condição de saúde" },
    { "step": 9, "id": "activity", "descricao": "Nível de atividade" },
    { "step": 10, "id": "intermediate", "descricao": "Interstitial roxo/azul: personalizando perguntas" },
    { "step": 11, "id": "exploratory", "descricao": "Em quais situações seu cachorro poderia se comportar melhor?" },
    { "step": 12, "id": "focus", "descricao": "O que você mais gostaria de melhorar primeiro?" },
    { "step": 13, "id": "identification_general", "descricao": "Identificação evolução (slider)" },
    { "step": 14, "id": "specific_situation_4", "descricao": "Situação específica" },
    { "step": 15, "id": "path_ab_4", "descricao": "Data alvo ou prioridade" },
    { "step": 16, "id": "progress_4", "descricao": "Interstitial verde: evolução do plano (projeção de resultados)" },
    { "step": 17, "id": "time", "descricao": "Quanto tempo por dia para treinar?" },
    { "step": 18, "id": "preparation", "descricao": "Tela de preparação (antes do resultado)" },
    { "step": 19, "id": "result", "descricao": "Resultado personalizado (inclui código de indicação na própria tela)" }
  ]
}
