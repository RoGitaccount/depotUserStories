const ChatBotQueries = () => {
  const responses = {
    greetings: [
      "Bonjour ! 👋 Ravi de vous rencontrer. En quoi puis-je vous aider aujourd'hui ?",
      "Salut ! Je suis là pour répondre à toutes vos questions. Comment puis-je vous assister ?",
      "Hello ! Bienvenue sur notre site. Que puis-je faire pour vous ?",
      "Bonsoir ! J'espère que vous passez une excellente soirée. Comment puis-je vous aider ?"
    ],
    thanks: [
      "Je vous en prie ! 😊 C'est un plaisir de vous aider.",
      "Avec plaisir ! N'hésitez pas si vous avez d'autres questions.",
      "De rien ! Je suis toujours là pour vous accompagner.",
      "Tout le plaisir est pour moi ! Y a-t-il autre chose que je puisse faire pour vous ?"
    ],
    goodbye: [
      "Au revoir ! 👋 À bientôt pour de nouvelles questions.",
      "À plus tard ! J'espère avoir pu vous aider.",
      "Au revoir ! N'hésitez pas à revenir quand vous voulez.",
      "À bientôt ! Passez une excellente journée ! ✨"
    ],
    contact: [
      "📧 Vous pouvez nous contacter de plusieurs façons :\n• Email: contact@exemple.com\n• Formulaire sur cette page\n• Chat en direct (ici même !)\n• Téléphone: +33 1 23 45 67 89",
      "Voici nos coordonnées complètes :\n📍 123 Rue de la Paix, 75001 Paris\n📞 +33 1 23 45 67 89\n📧 contact@exemple.com\n🌐 www.exemple.com",
      "Pour nous joindre rapidement, utilisez le formulaire de contact sur cette page ou envoyez-nous un email à contact@exemple.com. Nous répondons généralement sous 24h !"
    ],
    hours: [
      "⏰ Nos horaires d'ouverture :\n• Lundi - Vendredi : 9h00 - 18h00\n• Samedi : 10h00 - 16h00\n• Dimanche : Fermé\n\nNote : Le chat est disponible 24h/24 !",
      "Nous sommes ouverts du lundi au vendredi de 9h à 18h, et le samedi de 10h à 16h. Le dimanche, nous sommes fermés mais ce chat reste actif !",
      "🕘 Horaires actuels :\nSemaine : 9h-18h | Samedi : 10h-16h | Dimanche : Fermé\nMais vous pouvez toujours me parler ici !"
    ],
    pricing: [
      "💰 Pour un devis personnalisé, plusieurs options :\n• Remplissez le formulaire avec vos besoins\n• Contactez-nous au +33 1 23 45 67 89\n• Email : devis@exemple.com\n\nNous proposons des tarifs adaptés à chaque projet !",
      "Nos tarifs dépendent de vos besoins spécifiques. Pouvez-vous me dire quel type de service vous intéresse ? Je pourrai vous orienter plus précisément !",
      "Pour obtenir un devis gratuit et sans engagement, décrivez-moi votre projet dans le formulaire de contact. Nous vous répondrons sous 24h avec une proposition détaillée !"
    ],
    services: [
      "🚀 Nos services principaux :\n• Développement web\n• Conseil en stratégie digitale\n• Design UI/UX\n• Support technique\n• Formation\n\nQuel domaine vous intéresse le plus ?",
      "Nous proposons une gamme complète de services digitaux. Dites-moi dans quel domaine vous avez besoin d'aide et je vous donnerai plus de détails !",
      "✨ Nos expertises :\n• Applications web/mobile\n• E-commerce\n• Référencement SEO\n• Maintenance\n• Consulting\n\nQue puis-je vous expliquer en détail ?"
    ],
    about: [
      "🏢 Nous sommes une équipe passionnée de 15 experts en digital, basée à Paris. Depuis 2018, nous accompagnons les entreprises dans leur transformation numérique avec créativité et expertise technique.",
      "Notre mission ? Créer des solutions digitales qui font la différence ! Nous combinons innovation technologique et approche humaine pour des résultats exceptionnels.",
      "💡 Fondée par des passionnés du web, notre agence met l'accent sur la qualité, l'innovation et la satisfaction client. Nous travaillons avec des startups comme des grandes entreprises !"
    ],
    support: [
      "🛠️ Pour le support technique :\n• Email : support@exemple.com\n• Ticket en ligne sur notre portail\n• Appel d'urgence : +33 1 23 45 67 99\n\nNotre équipe technique est là pour vous aider !",
      "Quel type de problème technique rencontrez-vous ? Je peux vous orienter vers la bonne ressource ou vous donner une solution immédiate !",
      "Notre équipe support est disponible 24h/24 pour les urgences. Décrivez-moi votre problème, je vais voir comment vous aider !"
    ],
    default: [
      "🤔 C'est une question intéressante ! Pour vous donner la meilleure réponse, pourriez-vous préciser votre demande ? Ou utilisez le formulaire de contact pour plus de détails.",
      "Je vois que vous cherchez des informations spécifiques. N'hésitez pas à reformuler votre question ou à contacter directement notre équipe via le formulaire !",
      "Hmm, je ne suis pas sûr de bien comprendre. Pouvez-vous me donner plus de contexte ? Ou préférez-vous parler directement à un humain via le formulaire de contact ?",
      "Intéressant ! Pour une réponse plus précise, je vous invite à détailler votre demande dans le formulaire de contact. Notre équipe d'experts pourra vous aider au mieux !"
    ]
  };

  const getRandomResponse = (category) => {
    const responseArray = responses[category];
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  const analyzeMessage = (message) => {
    const msg = message.toLowerCase();
    const intentions = {
      greetings: ['salut', 'bonjour', 'hello', 'hi', 'hey', 'bonsoir', 'bonne nuit'],
      thanks: ['merci', 'thanks', 'remercie', 'super', 'parfait', 'génial'],
      goodbye: ['au revoir', 'bye', 'à bientôt', 'à plus', 'ciao', 'salut'],
      contact: ['contact', 'contacter', 'joindre', 'appeler', 'téléphone', 'email', 'mail', 'adresse'],
      hours: ['horaire', 'heure', 'ouvert', 'fermé', 'disponible', 'quand'],
      pricing: ['prix', 'tarif', 'coût', 'devis', 'budget', 'combien', 'gratuit'],
      services: ['service', 'offre', 'proposer', 'faire', 'développement', 'web', 'site'],
      about: ['qui', 'entreprise', 'équipe', 'société', 'histoire', 'mission', 'valeur'],
      support: ['problème', 'bug', 'erreur', 'aide', 'support', 'technique', 'panne', 'marche pas']
    };
    for (const [intention, keywords] of Object.entries(intentions)) {
      if (keywords.some(keyword => msg.includes(keyword))) {
        return intention;
      }
    }
    if (msg.includes('comment') && msg.includes('allez')) {
      return 'greeting_how';
    }
    if (msg.includes('nom') || msg.includes('appelle')) {
      return 'name';
    }
    if (msg.includes('recommand') || msg.includes('conseil')) {
      return 'recommendation';
    }
    return 'default';
  };

  const generateResponse = (userMessage) => {
    const intention = analyzeMessage(userMessage);
    if (intention === 'greeting_how') {
      return "Ça va très bien, merci ! 😊 Je suis là pour vous aider. Et vous, comment allez-vous ?";
    }
    if (intention === 'name') {
      return "Je suis votre assistant virtuel ! Vous pouvez m'appeler Bot ou simplement me dire 'tu'. Et vous, comment préférez-vous que je vous appelle ?";
    }
    if (intention === 'recommendation') {
      return "Je vous recommande vivement de remplir le formulaire de contact avec vos besoins spécifiques. Notre équipe pourra ainsi vous proposer la solution la plus adaptée ! 💡";
    }
    if (responses[intention]) {
      return getRandomResponse(intention);
    }
    return getRandomResponse('default');
  };

  return { generateResponse };
};

export default ChatBotQueries;