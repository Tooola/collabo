// Content model. Types: h1, h2, h3, p, b (bullet), b2 (sub-bullet), table, toc
// Bullet text uses "||" to separate a bold lead-in from the rest of the sentence.

const content = [];
const h1 = (text) => content.push({ t: "h1", text });
const h2 = (text) => content.push({ t: "h2", text });
const h3 = (text) => content.push({ t: "h3", text });
const p = (text) => content.push({ t: "p", text });
const b = (text) => content.push({ t: "b", text });
const b2 = (text) => content.push({ t: "b2", text });
const table = (headers, rows) => content.push({ t: "table", headers, rows });

// ===================== 1. OVERVIEW =====================
h1("1. Overview");
p("FarmTinz est une plateforme complète et intelligente de gestion de l'élevage, conçue pour rationaliser les opérations agricoles. Elle offre un système centralisé pour gérer les dossiers des animaux, les calendriers d'alimentation, les traitements médicaux, les ventes et les finances. Grâce à son accessibilité multi-rôles et à sa synchronisation en temps réel, FarmTinz permet aux fermes et coopératives de toutes tailles de fonctionner efficacement.");

h2("Modules clés");
b("Assistant d'enregistrement quotidien||Une interface guidée pour enregistrer les événements quotidiens concernant des animaux ou des lots spécifiques.");
b("Gestion des stocks||Contrôle des stocks d'aliments, de médicaments, de fournitures et autres consommables.");
b("Gestion de l'alimentation||Outils de formulation des aliments, de planification, de saisie du journal quotidien et d'analyse de la consommation.");
b("Suivi de la santé et des traitements||Journaux complets pour les visites vétérinaires, les prescriptions, les vaccinations et les bilans de santé.");
b("Enregistrement de la production||Suivi et enregistrement des productions de la ferme, telles que le lait, les œufs ou les récoltes.");
b("Gestion des pertes et de la mortalité||Signalement des incidents, statistiques de mortalité et calcul automatique des taux.");
b("Point de vente (POS)||Une interface de caisse en temps réel, incluant l'intégration d'une balance et la gestion des équipes.");
b("Analyse financière||Analyses globales et par segment des profits/pertes, tendances de revenus et suivi des coûts.");

h2("Rôles des comptes");
p("FarmTinz utilise un contrôle d'accès basé sur les rôles afin que chaque utilisateur ne voie que les outils pertinents pour ses responsabilités.");
table(
    ["Rôle", "Public cible", "Capacités clés"],
    [
        ["Manager", "Propriétaires et exploitants de ferme", "Contrôle total des paramètres de l'organisation, des rôles des utilisateurs, des analyses financières et des règles globales."],
        ["Vétérinaire", "Personnel médical et consultants", "Accès aux dossiers médicaux, aux registres de vaccination, aux journaux de maladies, aux prescriptions et aux rapports de bilan de santé."],
        ["Field Rep", "Travailleurs et agents de terrain", "Assistant d'enregistrement quotidien, journaux d'alimentation, enregistrement des animaux et gestion des stocks."],
        ["Caissier", "Personnel du point de vente", "Accès au terminal POS, à la gestion des équipes et aux outils de caisse."],
    ]
);

// ===================== 2. PUBLIC PAGES =====================
h1("2. Pages publiques et page d'accueil");
p("FarmTinz dispose d'un site web public informatif conçu pour présenter les capacités de la plateforme, répondre aux défis agricoles courants et faciliter la création de compte ou la prise de contact.");

h2("Menu de navigation");
p("Le site public comporte une barre de navigation supérieure avec les liens suivants : Accueil, Fonctionnalités, Pour qui, Comment ça marche, Avantages et Contact. Un sélecteur de langue (FR) et un bouton de connexion se trouvent également en haut à droite.");

h2("Section « Héro »");
p("La zone principale de la page d'accueil met en avant la proposition de valeur centrale de la plateforme.");
b("Titre principal||« AI-Driven Agriculture & Livestock Operations Platform ».");
b("Description||Texte expliquant que FarmTinz aide les fermes, coopératives, agro-entreprises, projets et acteurs publics à numériser leurs opérations, améliorer la traçabilité, surveiller la production, gérer les activités quotidiennes et accéder à des tableaux de bord en temps réel.");
b("Boutons d'appel à l'action||Deux boutons bien visibles sont affichés : un bouton vert plein « Get Started » et un bouton contour « Sign Up ».");
b("Aperçu du tableau de bord||Un aperçu visuel du tableau de bord FarmTinz est affiché à droite, montrant des indicateurs fictifs (Farmers, Livestock, Tasks) et un graphique à barres « Weekly Production ».");

h2("Le défi");
p("Une section présentant les principaux points de friction que la plateforme résout. Six cartes affichent les défis suivants :");
b("Registres papier sujets à la perte.");
b("Faible visibilité sur les opérations.");
b("Traçabilité insuffisante du bétail et des produits.");
b("Rapports manuels et sujets aux erreurs.");
b("Équipes et flux de travail déconnectés.");
b("Suivi insuffisant des stocks et des intrants.");

h2("Fonctionnalités de la plateforme");
p("Une grille présente les fonctionnalités principales de la plateforme, détaillées dans des cartes individuelles :");
b("Enregistrement des agriculteurs et du bétail||Enregistrer les agriculteurs, animaux et fermes avec des identifiants uniques.");
b("Tenue de dossiers||Journaux numériques pour toutes les activités agricoles.");
b("Stocks et intrants||Suivre les aliments, vaccins, outils et fournitures.");
b("Suivi de la production||Suivre les rendements, œufs, lait et récoltes.");
b("Planification des tâches||Assigner et suivre les tâches quotidiennes.");
b("Services de conseil||Recommandations par IA et visites sur le terrain.");
b("Flux Mobile Money||Enregistrer les paiements et transactions via mobile money.");
b("Rapports et tableaux de bord||Tableaux de bord visuels et rapports exportables.");
b("Traçabilité||Traçabilité complète de la ferme au marché.");

h2("Pour qui");
p("Une section présentant le public cible de la plateforme. Les cartes indiquent qu'elle est conçue pour :");
b("Fermes||Volaille, élevage, laiterie, fermes mixtes.");
b("Coopératives||Coordonner les membres et la production.");
b("Agro-entreprises||Se développer grâce à des informations basées sur les données.");
b("Projets / ONG||Suivre l'impact et rapporter aux bailleurs.");
b("Secteur public||Surveiller les programmes à l'échelle nationale.");

h2("Comment ça marche");
p("Un guide visuel en 4 étapes illustrant le parcours de l'utilisateur sur la plateforme :");
b("Inscription||Inscrivez votre ferme, coopérative ou organisation.");
b("Capture des données||Enregistrez les agriculteurs, le bétail, les stocks et les activités.");
b("Suivi des opérations||Suivez la production, les tâches et les transactions en temps réel.");
b("Génération de rapports||Accédez aux tableaux de bord, aux analyses et aux rapports exportables.");

h2("Avantages clés");
p("Une grille mettant en avant les avantages de la plateforme :");
b("Meilleure visibilité sur les opérations de la ferme.");
b("Meilleures décisions grâce aux données en temps réel.");
b("Moins de travail manuel et de paperasse.");
b("Responsabilité et gouvernance renforcées.");
b("Traçabilité améliorée sur toute la chaîne de valeur.");
b("Rapports facilités pour les parties prenantes et bailleurs.");
b("Meilleure coordination entre les équipes.");

h2("Aperçu des opérations agricoles");
p("Cette section offre un aperçu du tableau de bord opérationnel de la plateforme.");
b("Cartes récapitulatives||Des cartes d'indicateurs affichent des données simulées pour les agriculteurs enregistrés, les dossiers de bétail, les tâches en attente et les enregistrements mobile money.");
b("Widgets opérationnels||Trois cartes illustrent les types de vues de données disponibles :");
b2("Alertes stocks et intrants : barres graphiques montrant les niveaux de stock.");
b2("Production hebdomadaire : liste montrant les rendements et les variations en pourcentage.");
b2("Calendrier de vaccination : une chronologie des prochaines vaccinations avec des indicateurs de statut (ex. Aujourd'hui, Demain).");

h2("Activité récente et traçabilité");
b("Activité récente||Un journal affichant une liste chronologique des événements système récents (ex. collecte d'œufs, paiement reçu, livraison d'aliments) avec horodatage.");
b("Journal de traçabilité||Une liste montrant les enregistrements de traçabilité pour les lots, transferts ou processus, accompagnés de codes de référence uniques et de détails d'acheminement géographique.");

h2("Bannière d'appel à l'action");
p("Une bannière verte pleine invite les utilisateurs à agir : « Digitize Agricultural & Livestock Operations with FarmTinz ». Deux boutons sont proposés : « Request Demo » et « Contact ITTIQ ».");

h2("Nous contacter");
p("Un formulaire de contact permet de demander une démonstration ou de poser des questions. Le formulaire comprend les champs suivants :");
b("Nom complet||Champ de texte obligatoire.");
b("Organisation||Champ de texte.");
b("Type d'organisation||Menu déroulant obligatoire.");
b("Email||Champ de texte obligatoire.");
b("Téléphone||Champ de texte avec sélecteur d'indicatif pays.");
b("Pays||Champ de texte.");
b("Message||Zone de texte obligatoire.");
b("Bouton d'action||Un bouton « Send Message ».");

h2("Section FAQ");
p("Une section dédiée intitulée « Got Questions? » présentant une liste de questions fréquentes sous forme d'accordéon. Les questions visibles sont :");
b("Comment FarmTinz m'aide-t-il à gérer ma ferme ?");
b("Puis-je utiliser l'application hors ligne ?");
b("Combien d'animaux puis-je gérer ?");
b("Y a-t-il un essai gratuit ?");
b("Comment fonctionne le support ?");
b("L'application est-elle disponible sur mobile ?");

// ===================== 3. SIGN-UP =====================
h1("3. Inscription, connexion et authentification");
p("L'accès à la plateforme FarmTinz est sécurisé par un système de connexion basé sur des identifiants. Le processus d'inscription est un assistant guidé en plusieurs étapes.");

h2("3.1 Créer un compte");
p("Pour inscrire une nouvelle organisation, les utilisateurs doivent compléter un processus d'inscription en deux étapes :");

h3("Étape 1 : Informations sur l'organisation");
p("Cette étape établit le profil principal de l'organisation.");
b("Nom de l'organisation||Champ de texte obligatoire.");
b("Email de contact||Champ de texte obligatoire pour l'email professionnel principal.");
b("Type d'organisation||Menu déroulant obligatoire pour catégoriser l'activité.");
b("Sélectionnez votre pays||Menu déroulant obligatoire.");
b("Devise||Champ automatiquement rempli selon le pays sélectionné.");
b("Barre de progression||Un indicateur visuel montrant l'étape en cours (Step 1 of 3).");
b("Boutons d'action||Un bouton « Cancel » et un bouton « Continue ».");
b("Lien||« Already have an account? Log in here ».");

h3("Étape 2 : Informations sur le propriétaire");
p("Cette étape recueille les données personnelles du propriétaire du compte.");
b("Prénom||Champ de texte obligatoire.");
b("Nom||Champ de texte obligatoire.");
b("Email de contact||Champ de texte obligatoire.");
b("Mot de passe||Champ masqué obligatoire, avec un texte d'aide indiquant une exigence minimale (ex. « Min. 8 characters ») et une icône de visibilité (œil).");
b("Confirmer le mot de passe||Champ masqué obligatoire pour ressaisir le mot de passe.");
b("Barre de progression||Un indicateur visuel montrant l'étape en cours (Step 2 of 3).");
b("Boutons d'action||Un bouton « Back » et un bouton « Send code ».");
b("Lien||« Already have an account? Log in here ».");

h2("3.2 Se connecter");
p("Après une authentification réussie, le système identifie le rôle assigné et redirige l'utilisateur vers le tableau de bord manager.");
p("Récupération de mot de passe : en cas d'oubli du mot de passe, utilisez le lien « Forgotten Password » sur la page de connexion. Un email sera envoyé à l'adresse enregistrée avec un lien sécurisé pour réinitialiser les identifiants.");

// ===================== 4. ONBOARDING =====================
h1("4. Parcours d'intégration (Onboarding)");
p("Les nouvelles organisations doivent compléter un assistant d'intégration guidé en plusieurs étapes avant d'accéder pleinement aux modules opérationnels de la ferme. Ce processus établit la facturation, vérifie la conformité et configure la structure initiale de la ferme.");

h2("4.1 Vérification de l'entreprise");
p("La première étape de l'assistant d'intégration exige que les utilisateurs fournissent les documents de conformité. Une bannière d'information peut apparaître en haut indiquant : « Your KYC documents are incomplete. You can submit them from your dashboard after onboarding. »");
b("Nom du représentant légal||Champ de texte.");
b("Numéro d'identification fiscale / TVA||Champ de texte.");
b("Licence commerciale||Champ de téléversement de document obligatoire. Les formats pris en charge sont précisés (ex. pdf, jpg, jpeg, png) avec une taille maximale (ex. 10,0 Mo). Un bouton « Upload » permet de sélectionner un fichier depuis l'appareil.");
b("Pièce d'identité du représentant légal||Champ de téléversement de document obligatoire pour un passeport ou une pièce d'identité nationale. Spécifications et bouton « Upload » fournis.");
b("Certificat d'assurance||Champ de téléversement de document facultatif comme preuve d'assurance commerciale, avec spécifications et bouton « Upload ».");
b("Bouton d'action||Un bouton « Continue » pour passer à l'étape suivante.");

h2("4.2 Choisir son abonnement");
p("Cette étape présente les niveaux d'abonnement disponibles. Un interrupteur permet de basculer le cycle de facturation entre « Monthly » et « Yearly ».");
b("Cartes des abonnements||Les abonnements suivants sont affichés avec leurs fonctionnalités et tarifs respectifs :");
b2("Free : limite de membres d'équipe (ex. 1), limite de types d'élevage, limite de codes RFID, limite de codes QR, limite de codes de lot.");
b2("Starter : disponibilité du mode hors ligne, limite de membres d'équipe, limite de types d'élevage, limite de codes RFID, limite de codes QR, et « + 1 fonctionnalité supplémentaire ».");
b2("Professional : étiqueté « Popular », inclut le mode hors ligne, une limite de membres d'équipe plus élevée, une limite de types d'élevage plus élevée, limite de codes RFID/QR, et « + 1 fonctionnalité supplémentaire ».");
b2("Enterprise : mode hors ligne, limite de membres d'équipe la plus élevée, limite de types d'élevage la plus élevée, limite de codes RFID/QR, et « + 1 fonctionnalité supplémentaire ».");
b("Bouton d'action||Un bouton « Continue » pour passer au paiement.");

h2("4.3 Méthode de paiement");
p("Cette étape permet de choisir un processeur de paiement et d'appliquer des codes promotionnels.");
b("Méthodes de paiement||Les utilisateurs peuvent choisir parmi les options disponibles affichées sous forme de cartes (ex. PayPal, PawaPay pour les paiements mobiles en Afrique). Un message système peut apparaître si une méthode de paiement spécifique n'est pas disponible pour le pays sélectionné.");
b("Code promo||Champ de texte accompagné d'un bouton « Apply » pour saisir un code de réduction.");
b("Résumé||Une carte récapitulative en bas affiche l'abonnement choisi, le cycle de facturation et le coût total (dans la devise sélectionnée).");
b("Bouton d'action||Un bouton « Continue » pour finaliser la configuration de l'intégration.");

h2("4.4 Configuration de la ferme (assistant en 12 étapes)");
p("Une fois la facturation terminée, le système exige que l'utilisateur configure sa ferme via un assistant guidé en 12 étapes. Une barre de progression en haut indique l'avancement (ex. « Step 1 of 12 »). Un lien « Set up later » est disponible en haut à droite, permettant de reporter ce processus à plus tard.");

h3("Étape 1 : Identité de la ferme");
p("Cette étape établit les informations principales de la ferme :");
b("Nom de la ferme||Champ de texte (pré-rempli à partir des données d'inscription).");
b("Téléphone||Champ de texte pour le numéro de contact de la ferme.");
b("Email||Champ de texte pour l'adresse email de la ferme.");
b("Pays||Champ en lecture seule ou pré-rempli montrant le pays sélectionné lors de l'inscription.");
b("Devise||Champ en lecture seule. Une note d'aide précise : « The currency selected during signup cannot be changed here. »");
b("Emplacements de la ferme||Une zone cliquable en pointillés intitulée « + Add a location » pour définir les structures physiques.");

h3("Étape 2 : Bétail géré");
p("Cette étape détermine le type d'exploitation. L'utilisateur sélectionne une des cartes disponibles :");
b("Élevage (Livestock Farming)");
b("Aviculture (Poultry Farming)");
b("Action||Un bouton « Next ». Une note précise : « You can change this information later. »");

h3("Étape 3 : Capacité approximative");
p("Cette étape recueille l'échelle attendue de l'exploitation. L'utilisateur sélectionne une carte parmi les options suivantes :");
b("Moins de 500");
b("500 – 1 999");
b("2 000 – 4 999");
b("5 000 – 9 999");
b("10 000+");
b("Je ne sais pas encore");

h3("Étape 4 : Unités d'hébergement de la ferme");
p("Cette étape permet de définir les structures. Un bouton « + Add a housing unit » ouvre une fenêtre modale avec les champs obligatoires suivants :");
b("Emplacement||Menu déroulant.");
b("Nom||Champ de texte.");
b("Type||Menu déroulant (ex. « Breeding »).");
b("Capacité (Max Animals)||Champ numérique.");
b("Notes||Zone de texte pour détails facultatifs.");
b("Boutons d'action||« Cancel » et « + Create ».");

h3("Étape 5 : Configuration de l'élevage");
p("Cette étape configure le cycle de vie et les paramètres de production spécifiques au bétail de la ferme :");
b("Menu déroulant||Sélection du type de bétail ciblé (ex. Broiler Meat Chicken, Turkey).");
b("Onglets||Trois onglets de navigation : « Stages », « Grades » et « Productions ».");
b("Liste des étapes||Une liste des étapes de cycle de vie par défaut (ex. Hatching, Brooding, Growing, Finishing). Chaque étape affiche :");
b2("Le nom de l'étape et une durée (ex. « 21-21 days »).");
b2("Un badge « Admin ».");
b2("Une icône de modification (crayon).");
b2("Un bouton « Exclude » pour retirer l'étape.");
b("Boutons d'action||« + Add a stage ».");

h3("Étape 6 : Générer des codes");
p("Cette étape prépare les codes d'identification de la ferme.");
b("Type de code||Une carte sélectionnable (ex. « BATCH »).");
b("Nombre de codes||Champ numérique, accompagné d'une note indiquant le quota de génération restant.");
b("Générer||Un bouton pour générer les codes demandés.");
b("Codes prêts pour les premiers animaux||Une liste d'aperçu des codes générés. Un bouton « Print » permet de les exporter.");

h3("Étape 7 : Fournisseurs");
p("Cette étape recueille les informations sur les fournisseurs.");
b("Bouton d'action||« + Add » ouvre une fenêtre modale avec les champs suivants :");
b2("Nom de l'entreprise : champ de texte obligatoire.");
b2("Email : champ de texte.");
b2("Site web : champ de texte (ex. commençant par « https://... »).");
b2("Téléphone : champ obligatoire avec sélecteur d'indicatif pays.");
b2("Catégories de fournisseurs : zone de sélection obligatoire avec boutons radio (ex. Poultry, Livestock, Aquaculture, Veterinary, Equipment & Supplies, Agro-Chemicals). Un texte d'aide précise : « At least one category is required ».");
b2("Notes complémentaires : zone de texte.");
b2("Bouton d'action : « Save Supplier ».");
b("État vide||Si aucun fournisseur n'existe, la zone affiche : « No supplier registered yet. »");
b("Remarque||Cette étape propose un lien « Skip this step ».");

h3("Étape 8 : Enregistrer des animaux ou des lots");
p("Cette étape permet d'ajouter les premiers animaux au système. Elle est divisée en sections suivantes :");
b("Classification||");
b2("Type d'élevage : menu déroulant obligatoire (pré-rempli selon l'étape 2).");
b2("Espèce : menu déroulant obligatoire (ex. « Turkey »).");
b2("Race : menu déroulant obligatoire (ex. « Meat Turkey »).");
b("Identification||");
b2("Code disponible : menu déroulant obligatoire pour sélectionner un identifiant parmi les codes générés à l'étape 6.");
b2("Nom de l'animal : champ de texte facultatif.");
b2("Sexe : menu déroulant obligatoire (ex. « male »).");
b("Santé et mesures||");
b2("Statut de santé : menu déroulant obligatoire (ex. « Injured »).");
b2("Date de naissance : sélecteur de date obligatoire.");
b2("Quantité : champ numérique obligatoire.");
b("Origine et hébergement||");
b2("Coût : champ numérique obligatoire dans la devise de la ferme.");
b2("Fournisseur : menu déroulant (pré-rempli à partir de l'étape 7).");
b2("Emplacement de la ferme : menu déroulant obligatoire.");
b2("Unité d'hébergement : menu déroulant obligatoire.");
b("Photos et documents||");
b2("Photo de l'animal : bouton « Choose an image ».");
b2("Fiche technique : bouton « Choose a document ».");
b("Boutons d'action||Un bouton « Register » pour enregistrer l'animal, et un bouton « Next » pour continuer.");

h3("Étape 9 : Ajouter le stock d'ouverture");
p("Cette étape configure l'inventaire initial.");
b("Bannière d'information||Affiche : « Create a storage location (warehouse, room, pen, etc.) before adding opening stock. Farm locations cannot be used for storage. »");
b("1. Produit||");
b2("Article en stock : menu déroulant obligatoire.");
b2("Fournisseur : menu déroulant obligatoire (pré-rempli à partir de l'étape 7).");
b2("Emplacement de stockage : menu déroulant obligatoire.");
b2("Date d'expiration : sélecteur de date.");
b("2. Emballage||");
b2("Emballage d'achat : menu déroulant obligatoire (ex. « Bag »).");
b2("Contenu par emballage : champ numérique obligatoire (avec unité).");
b2("Nombre d'emballages achetés : champ numérique obligatoire.");
b("3. Valeur d'achat||");
b2("Prix par emballage : champ numérique obligatoire dans la devise de la ferme.");
b("Boutons d'action||Un bouton « Add to inventory ».");
b("Remarque||Cette étape propose un lien « Skip this step ».");

h3("Étape 10 : Clients");
p("Cette étape permet d'enregistrer les premiers acheteurs commerciaux.");
b("Un bouton « + Add » est disponible pour ouvrir la fenêtre modale de création de client.");
b("Fenêtre modale « Ajouter un nouveau client »||Le clic sur « + Add » ouvre une fenêtre modale avec les champs obligatoires suivants :");
b2("Nom du client : champ de texte obligatoire.");
b2("Type d'activité : menu déroulant obligatoire pour catégoriser l'activité du client.");
b2("Email : champ de texte obligatoire.");
b2("Téléphone de contact : champ obligatoire avec menu déroulant d'indicatif pays et espace réservé pour le numéro.");
b2("Emplacement : champ de texte pour l'adresse physique ou l'emplacement.");
b("Bouton d'action||Un bouton « Create customer » pour enregistrer le profil.");
b("État vide||Si aucun client n'est ajouté, la zone affiche : « No customer registered. »");
b("Remarque||Cette étape propose un lien « Skip this step ».");

h3("Étape 11 : Membres de l'équipe");
p("Cette étape permet à l'utilisateur d'inviter d'autres utilisateurs dans l'organisation.");
b("Cartes récapitulatives||Trois cartes affichent le statut actuel : « Active members », « Pending invitations » et « Occupied seats » (montrant le nombre actuel par rapport à la limite totale de sièges).");
b("Bouton d'action||« + Invite » ouvre une fenêtre modale avec les champs suivants :");
b2("Adresse email : champ de texte obligatoire.");
b2("Rôle : menu déroulant obligatoire.");
b2("Bannière d'information : affiche « The user will receive an email with a link to join your organization. »");
b2("Boutons d'action : « Cancel » et « Send Invitation ».");
b("État vide||Si aucun membre d'équipe n'est invité, la zone affiche : « No team member yet. »");
b("Remarque||Cette étape propose un lien « Skip this step ».");

h3("Étape 12 : Résumé");
p("Cette étape fournit un aperçu final de toutes les données de configuration enregistrées. Elle affiche des cartes récapitulatives pour :");
b("Ferme");
b("Capacité");
b("Emplacements");
b("Unités d'hébergement");
b("Configuration de l'élevage");
b("Premier animal / lot");
b("Codes");
b("Fournisseurs");
b("Articles");
b("Clients");
b("Équipe");
b("Boutons d'action||Un bouton « Back » et un bouton « Finish » pour terminer la configuration.");

p("Important : certains modules opérationnels resteront verrouillés dans le menu latéral tant que la séquence de configuration de la ferme n'est pas entièrement terminée.");

// ===================== 5. DASHBOARD =====================
h1("5. Tableau de bord");
p("Le tableau de bord constitue la page d'accueil principale, offrant une vue centralisée des indicateurs clés, des alertes système et des liens d'accès rapide aux outils administratifs. La mise en page et le contenu sont adaptés au rôle de l'utilisateur.");

h2("Aperçu de l'interface");
p("En accédant au tableau de bord, l'écran est divisé en une zone de contenu principale et un menu latéral persistant.");
b("Menu latéral (menu principal)||Le menu de navigation regroupe les modules principaux de l'application, incluant Dashboard, Animals, Record, Inventory, Feeding, Health, Production, Losses, Customer Management, Sales, Point of Sale et Financials. En bas du menu se trouvent des liens vers les paramètres, le profil utilisateur et une section d'actions rapides comportant un raccourci vers « Record Deaths/Losses ».");
b("En-tête||Affiche le nom de l'organisation, le titre de la page (« Dashboard »), un sélecteur de langue, une cloche de notification et le menu du profil utilisateur.");
b("Bannière « Platform Overview »||La partie supérieure de la zone de contenu principale présente une bannière bleu foncé intitulée « Platform Overview », renforçant le caractère administratif du tableau de bord.");

h2("Cartes récapitulatives");
p("Quatre indicateurs clés de performance sont affichés en évidence sous forme de cartes récapitulatives en haut de la vue :");
b("Total Customers||Affiche le nombre actuel d'acheteurs enregistrés.");
b("Active Users||Affiche le nombre de comptes utilisateurs actuellement actifs sur la plateforme.");
b("Monthly Revenue||Affiche le revenu total généré pour le mois en cours dans la devise de base de l'organisation.");
b("Total Animals||Affiche le nombre total de têtes de bétail actuellement gérées dans le système.");

h2("Outils administratifs");
p("Sous les cartes récapitulatives, une grille offre un accès rapide aux modules de gestion clés. Chaque tuile comporte une icône, une étiquette et une flèche pointant vers la droite, indiquant un lien de navigation :");
b("Customer Management");
b("User Accounts");
b("Inventory");
b("Production");
b("Point of Sale");
b("Overall Financial Analysis");

h2("Activité récente");
p("Cette section fournit un journal des actions les plus récentes effectuées par les utilisateurs dans le système.");
b("Événements||Affiche les événements système tels que les connexions ou déconnexions réussies.");
b("Horodatages||Chaque événement affiche le temps écoulé depuis son occurrence.");
b("Voir plus||Un lien en haut à droite permet de consulter un historique complet des activités.");

h2("Alertes système");
p("Ce panneau affiche les notifications critiques, telles que les alertes de stock ou de livraison. Les alertes sont affichées sous forme d'éléments de liste individuels avec une icône rouge pour signaler l'urgence.");
b("Détails de l'alerte||Chaque élément fournit des informations spécifiques sur le produit concerné, le numéro de lot et la raison de l'alerte (ex. un lot approchant ou dépassant sa date d'expiration).");
b("Voir plus||Un lien en haut à droite permet de naviguer vers la liste complète des alertes système actives.");

// ===================== 6. ANIMALS =====================
h1("6. Animaux");
p("Le module Animaux sert de centre névralgique pour la gestion de tous les stocks de bétail, de volaille et de poissons. Il fournit des outils pour organiser les animaux, suivre leur santé et leurs indicateurs de croissance, et enregistrer de nouveaux animaux ou lots via un assistant guidé en plusieurs étapes.");

h2("Aperçu de l'interface");
p("La page de gestion des animaux est divisée en une zone de liste principale et un menu latéral persistant. La page principale comporte une barre de navigation supérieure avec les paramètres de langue et de profil, ainsi qu'une zone de contenu principale contenant des statistiques récapitulatives, des outils de recherche et des tableaux de données.");
b("En-tête et onglets||L'en-tête de la page affiche « Animal Management » avec un sous-titre. Un bouton de filtre permet de visualiser des segments spécifiques : « All », « Livestock » ou « Poultry ».");
b("Bouton d'action||Un bouton « + Register Animal » bien visible est situé en haut à droite de la section du bétail.");

h2("Inventaire du bétail");
p("Cette section offre un aperçu des animaux individuels et du bétail non aviaire.");

h3("Cartes récapitulatives");
p("Trois cartes récapitulatives affichent les indicateurs clés de l'inventaire :");
b("Active||Affiche le nombre total d'animaux actuellement marqués comme actifs sur la ferme.");
b("Average Health||Une carte graphique avec une barre de progression indiquant le statut de santé moyen global de la population de bétail.");
b("Distinct Breeds||Affiche le nombre de races uniques actuellement représentées dans l'inventaire.");

h3("Recherche et filtres");
p("Une barre de recherche intitulée « Search by name, RFID, or tag » permet de localiser rapidement des animaux spécifiques dans la liste du bétail.");

h3("Tableau de données");
p("Le tableau de données du bétail fournit une liste détaillée de tous les animaux enregistrés. En l'absence d'enregistrement, un état vide avec une icône de boîte et le texte « Animal not found » est affiché.");
b("Colonnes visibles||Animal RFID, nom de l'animal (facultatif), espèce, race, sexe, actif (indicateur de statut), statut, poids (kg) et actions.");
b("Actions||La colonne Actions est réservée aux contrôles au niveau des lignes, tels que la consultation des détails ou la modification de l'enregistrement.");

h3("Actions disponibles");
b("+ Register Animal||Le clic sur ce bouton ouvre l'assistant d'enregistrement des animaux, une fenêtre modale en plusieurs étapes pour ajouter de nouveaux animaux au système.");

h2("Assistant d'enregistrement des animaux");
p("Le processus d'enregistrement est une fenêtre modale guidée divisée en quatre étapes distinctes, indiquées par une barre de progression en haut.");

h3("Étape 1 : Classification");
p("Cette étape recueille les détails de catégorisation de base du nouvel animal.");
b("Nom de l'animal (facultatif)||Champ de texte.");
b("Catégorie||Menu déroulant obligatoire pour sélectionner le type général (ex. Livestock).");
b("Espèce||Menu déroulant obligatoire pour sélectionner l'espèce spécifique.");
b("Race||Menu déroulant obligatoire pour sélectionner la race spécifique.");
b("Ferme||Menu déroulant obligatoire (souvent présélectionné).");
b("Unité d'élevage / Section||Menu déroulant obligatoire pour affecter l'animal à un emplacement physique spécifique.");

h3("Étape 2 : Identification");
p("Cette étape lie l'animal à un code de lot existant.");
b("Barre de recherche||Un champ intitulé « Search a code... » pour filtrer les options disponibles.");
b("Liste des codes de lot||Une liste sélectionnable des codes de lot existants associés à la ferme. Un lot sélectionné est mis en évidence, et une coche verte apparaît à droite.");

h3("Étape 3 : Santé");
p("Cette étape recueille le statut de santé initial de l'animal et ses détails de naissance.");
b("Statut de santé||Menu déroulant obligatoire. Options visibles : Healthy, Injured, Quarantine, Sick, Under treatment.");
b("Sexe||Menu déroulant obligatoire (ex. Male, Female).");
b("Quantité||Champ numérique obligatoire pour le nombre initial d'animaux.");
b("Date de naissance||Sélecteur de date obligatoire.");
b("Notes||Zone de texte pour ajouter des observations descriptives.");

h3("Étape 4 : Finalisation");
p("Cette étape présente un résumé des informations fournies dans les étapes précédentes.");
b("Santé et caractéristiques||Affiche le statut de santé sélectionné, le sexe, le poids (le cas échéant) et la date de naissance.");
b("Informations complémentaires||Affiche la quantité initiale, le coût total d'achat et les informations du fournisseur (le cas échéant).");
b("Actions||La fenêtre modale comporte un bouton « Previous » pour revenir en arrière et modifier, et un bouton « Save Animal » bien visible pour finaliser l'enregistrement.");

// ===================== 7. DAILY RECORD WIZARD =====================
h1("7. Assistant d'enregistrement quotidien");
p("L'assistant d'enregistrement quotidien est un outil conçu pour capturer les événements, actions et conditions quotidiens pour des animaux ou lots spécifiques. Il fournit un tableau de bord centralisé pour gérer les brouillons en cours et consulter les enregistrements historiques, tandis qu'un assistant guidé conduit les utilisateurs à travers un processus de saisie de données structuré.");

h2("Aperçu de l'interface");
p("Le tableau de bord des enregistrements fournit un aperçu de toutes les activités d'enregistrement.");

h3("Cartes récapitulatives");
p("Quatre cartes récapitulatives fournissent des indicateurs de haut niveau sur l'activité d'enregistrement :");
b("Total sessions||Le nombre total de sessions d'enregistrement initiées.");
b("Recorded today||Le nombre de sessions créées à la date du jour.");
b("Animals covered||Le nombre total d'animaux ou de lots distincts ayant été enregistrés.");
b("Actions recorded||Le nombre total d'actions individuelles enregistrées sur l'ensemble des sessions.");

h3("Sections principales");
b("Your unfinished drafts||Une section dédiée avec une bordure jaune clair. Elle affiche une liste des sessions d'enregistrement commencées mais non terminées. Chaque brouillon affiche le nom de l'animal/lot ciblé, l'étape en cours (ex. « Step 3 / 7 ») et la date/heure de la dernière modification.");
b("Record history||Cette section affiche un journal des sessions d'enregistrement terminées. Elle présente le nom du lot, l'horodatage, le code RFID et des badges indiquant les catégories d'actions enregistrées (ex. Losses, Feeding, Health). Chaque entrée comprend un bouton « View » pour consulter les détails.");

h3("Recherche et filtres");
p("Sous le titre « Record history », un ensemble de filtres permet d'affiner les données historiques :");
b("Barre de recherche||Champ de texte intitulé « Animal, batch or code... ».");
b("Plage de dates||Deux sélecteurs de dates pour spécifier une date de début et de fin.");
b("Icône de filtre||Une icône en forme d'entonnoir pour appliquer des conditions de filtrage avancées.");
b("Menu déroulant du type d'action||Un menu déroulant pour filtrer l'historique par type d'action spécifique (ex. « All actions »).");

h3("Actions disponibles");
b("+ Record an action||Un bouton vert bien visible situé en haut à droite. Le clic ouvre la fenêtre modale du nouvel assistant d'enregistrement.");
b("Continue||(Disponible sur les brouillons) Un bouton vert qui reprend une session d'enregistrement inachevée à l'étape où elle a été laissée.");
b("Delete||(Disponible sur les brouillons) Une icône de corbeille qui supprime définitivement le brouillon.");
b("View||(Disponible sur les entrées de l'historique) Une icône d'œil qui ouvre une vue détaillée en lecture seule de l'enregistrement terminé.");

h2("Nouvel assistant d'enregistrement");
p("Le clic sur « + Record an action » ouvre une fenêtre modale guidée pour enregistrer un nouvel ensemble d'actions. La fenêtre modale est divisée en 7 étapes, indiquées par une barre de progression en haut et un badge d'étape (ex. « Step 1/7 »).");

h3("Étape 1 : Sélectionner la cible");
b("Champ||Un menu déroulant obligatoire intitulé « Animal or batch * ».");
b("Action||L'utilisateur doit sélectionner l'animal ou le lot spécifique pour lequel les données sont enregistrées.");
b("Navigation||Un bouton « Continue » permet de passer à l'étape suivante.");

h3("Étapes 2 à 6 (telles qu'observées dans la fenêtre modale)");
p("L'assistant progresse à travers les catégories d'actions suivantes, dans l'ordre :");
b("Étape 2 : Losses (enregistrer les décès, la quantité et la cause)");
b("Étape 3 : Feeding (consigner les quantités consommées et les articles alimentaires)");
b("Étape 4 : Production (saisir les rendements collectés)");
b("Étape 5 : Health (saisir les actions médicales, prescriptions ou bilans)");
b("Étape 6 : Expenses (enregistrer les coûts associés)");

h3("Étape 7 : Résumé");
b("L'étape finale fournit un examen consolidé de toutes les données saisies dans les étapes précédentes.");
b("Elle permet à l'utilisateur de vérifier les informations avant de soumettre l'enregistrement.");
b("Lors de la soumission, le système met à jour les données. En cas de travail hors ligne, l'application synchronise les modifications avec le serveur dès qu'une connexion internet est rétablie.");

// ===================== 8. INVENTORY =====================
h1("8. Gestion des stocks");
p("Le module Inventaire fournit un système centralisé pour acheter les intrants agricoles, suivre les stocks disponibles à travers différents emplacements de stockage, et surveiller tous les mouvements de stock en temps réel.");

h2("Aperçu de l'interface");
p("La page Inventaire est structurée avec une barre de navigation principale en haut et une zone de contenu principale qui change selon l'onglet sélectionné. Un menu latéral persistant donne accès aux autres modules principaux.");

h2("Onglets de navigation");
p("La section inventaire comporte cinq onglets de navigation principaux, permettant de basculer entre différentes vues de gestion :");
b("Dashboard||Affiche un aperçu du stock sur tous les emplacements de stockage.");
b("Buy||Une interface dédiée à l'achat de nouveaux articles en stock et au traitement des réceptions.");
b("Supply Debts||Une vue pour suivre les paiements fournisseurs en attente.");
b("Current Stock||Une liste détaillée de tous les articles en stock disponibles.");
b("Movement||Un journal chronologique de toutes les entrées et sorties de stock.");

h2("Onglet 1 : Dashboard – Stock par emplacement");
p("Cet onglet présente une vue de haut niveau des stocks répartis à travers les emplacements physiques de la ferme.");

h3("Cartes des emplacements de stockage");
p("Le stock est organisé en cartes individuelles, chacune représentant un emplacement de stockage. Chaque carte affiche :");
b("Nom de l'emplacement||Le nom désigné de l'installation de stockage.");
b("Type d'emplacement||La classification de l'installation (ex. Warehouse, Farm Location).");
b("Total des articles||Le nombre total d'articles distincts stockés à cet emplacement.");
b("Valeur totale du stock||La valeur monétaire totale calculée de tous les articles de l'emplacement.");
b("Articles principaux||Une liste des principaux articles de cet emplacement, affichant le nom de l'article, la quantité et l'unité de mesure.");

h3("Actions disponibles");
b("Refresh||Un bouton situé en haut à droite de la section « Stock by Location », permettant de recharger et de mettre à jour les données affichées.");

h2("Onglet 2 : Achats");
p("Cet onglet fournit un historique de toutes les transactions d'acquisition de stock. Un sous-titre indique que « Purchases are immediately received into stock » dès leur finalisation.");

h3("Actions disponibles");
b("+ Buy||Un bouton vert bien visible situé en haut à droite de la section. Le clic ouvre la fenêtre modale du nouvel achat.");

h3("Recherche et filtres");
p("Au-dessus du tableau de données, un ensemble d'outils permet d'affiner l'historique des achats :");
b("Barre de recherche||Champ de texte intitulé « Purchase or supplier... ».");
b("Menu déroulant du statut de paiement||Un menu pour filtrer les transactions par statut de paiement (ex. « All payments »).");
b("Sélecteurs de plage de dates||Deux champs calendrier pour sélectionner une date de début et de fin.");

h3("Tableau de données");
p("Le tableau de l'historique des achats affiche un journal de tous les articles reçus avec les colonnes suivantes :");
b("Purchase ID||Le numéro de référence unique de la transaction.");
b("Supplier||Le nom du fournisseur ou du vendeur.");
b("Date||La date d'enregistrement de l'achat.");
b("Total||Le montant monétaire total de la transaction.");
b("Paid||Le montant déjà payé, accompagné d'un badge de statut indiquant l'état du paiement (ex. « Paid »).");
b("Remaining||Le solde restant, le cas échéant.");
b("Details||Une colonne d'action contenant un bouton « View » (icône d'œil) pour consulter les détails complets de la transaction.");

h2("Onglet 3 : Historique des mouvements");
p("Cet onglet affiche un journal chronologique détaillé de chaque entrée, sortie ou transfert de stock.");

h3("Recherche et filtres");
p("Les utilisateurs peuvent rechercher et filtrer les journaux de mouvements à l'aide de :");
b("Barre de recherche||Champ de texte intitulé « Item, batch, or reason... ».");
b("Menu déroulant du type||Un menu pour filtrer par catégorie de mouvement (ex. « All Types »).");
b("Sélecteurs de plage de dates||Deux champs calendrier pour sélectionner une date de début et de fin.");

h3("Tableau de données");
p("Le tableau de l'historique des mouvements fournit une vue granulaire des changements de stock, avec les colonnes suivantes :");
b("Date & Time||L'horodatage précis du mouvement.");
b("Type||Un badge de statut coloré indiquant le type d'action ou la raison du mouvement (ex. « Health », « Exit »).");
b("Item||Le nom de l'article en stock concerné.");
b("Batch||Le numéro de lot spécifique de l'article.");
b("Quantity||Le montant numérique déplacé. Les déductions sont affichées en rouge avec un signe négatif (-), tandis que les ajouts apparaissent en valeurs positives.");
b("Before → After||Un affichage apparié montrant le niveau de stock de l'article immédiatement avant et après le mouvement.");

h2("Fenêtre modale d'achat");
p("Le clic sur le bouton « + Buy » de l'onglet Achats ouvre une fenêtre modale à plusieurs sections pour enregistrer un nouvel achat et recevoir automatiquement les articles en stock.");

h3("Section 1 : Produit");
p("Cette section recueille les informations principales du produit pour le stock entrant.");
b("Fournisseur (*)||Menu déroulant obligatoire pour sélectionner le vendeur.");
b("Article en stock (*)||Menu déroulant obligatoire pour choisir l'article spécifique acheté.");
b("Unité de stock||Champ auto-rempli, non modifiable, montrant l'unité de mesure par défaut de l'article.");
b("Emplacement de stockage (*)||Menu déroulant obligatoire pour affecter le stock entrant à un emplacement spécifique.");
b("Note||Un message d'aide affiche l'unité dans laquelle le produit sera comptabilisé.");

h3("Section 2 : Emballage, prix et paiement");
p("Cette section capture le volume, le coût et les détails de paiement de l'achat.");
b("Emballage acheté (*)||Menu déroulant obligatoire pour sélectionner le type de contenant acheté (ex. sac, fût).");
b("Contenu par emballage (*)||Champ numérique obligatoire définissant le poids ou la quantité de produit contenu dans une unité d'emballage.");
b("Nombre d'emballages achetés (*)||Champ numérique obligatoire pour le nombre total de contenants achetés.");
b("Prix par emballage (*)||Champ numérique obligatoire pour le coût d'une unité d'emballage.");
b("Date d'expiration||Champ de sélection de date facultatif pour enregistrer la date d'expiration du lot.");
b("Panneau récapitulatif du stock||Un panneau dynamique qui calcule et affiche automatiquement le « Stock to add » (quantité totale) et le « Subtotal » (coût total).");
b("Statut de paiement||Un groupe de boutons où l'utilisateur précise comment l'article est payé. Les options disponibles sont : « Paid », « Partial » et « Pending ».");

p("Bouton d'action : un bouton en pointillés intitulé « + Add item to transaction ». Le clic ajoute l'article de stock configuré à la commande d'achat en brouillon.");

h3("Section 3 : Articles de cette transaction");
p("Une fois les articles ajoutés à la transaction, ils apparaissent dans un tableau récapitulatif :");
b("Colonnes||Supplier, Article (affiche les détails d'emballage et la date d'expiration), Location, Quantity, Total, Payment (badge de statut).");
b("Actions de ligne||Une icône de corbeille rouge permet de retirer un article de la transaction.");
b("Résumé en bas||Trois cartes résument les finances : Grand Total, Total Paid et Total Remaining.");

p("Action finale : un bouton vert plein intitulé « Confirm and finalize purchase ». Le clic traite l'ensemble de la transaction, met à jour l'inventaire et crée les enregistrements correspondants dans le système.");
p("Notification toast : après l'ajout réussi d'un article à la transaction, une notification toast temporaire apparaît en bas à droite pour confirmer l'action.");

// ===================== 9. FEEDING =====================
h1("9. Gestion de l'alimentation");
p("Le module Alimentation fournit des outils pour enregistrer les distributions quotidiennes d'aliments, suivre les quantités et coûts de consommation, et analyser l'efficacité de l'alimentation à travers des données historiques et des graphiques.");

h2("Aperçu de l'interface");
p("La page de gestion de l'alimentation est divisée en deux sections principales : un formulaire d'enregistrement à gauche et une liste des enregistrements historiques à droite. Une vue analytique est également accessible via un bouton dédié.");

h2("Cartes récapitulatives");
p("Trois cartes récapitulatives sont situées en haut de la vue :");
b("Feedings today||Affiche le nombre total d'événements d'alimentation enregistrés à la date du jour.");
b("Quantity today||Affiche la quantité totale d'aliments consommés sur l'ensemble des entrées du jour.");
b("Total cost||Affiche la valeur monétaire totale des enregistrements d'alimentation visibles.");

h2("Actions disponibles");
b("+ Record Feeding||Un bouton vert situé dans la zone en haut à droite. Le clic ouvre le formulaire pour enregistrer un nouvel événement d'alimentation.");
b("Analytics||Un bouton situé à côté du bouton Record Feeding qui mène au tableau de bord analytique des rapports d'alimentation.");

h2("Formulaire d'enregistrement d'alimentation");
p("Lors de l'enregistrement d'une alimentation, les champs suivants sont présentés sur le panneau de gauche :");
b("Groupe cible||Menu déroulant obligatoire intitulé « Select Target » pour choisir l'animal ou le lot spécifique nourri.");
b("Type d'aliment||Menu déroulant obligatoire pour sélectionner l'article alimentaire distribué.");
b("Lot d'inventaire||Menu déroulant pour sélectionner le lot d'inventaire spécifique à déduire. Une option peut être disponible pour prioriser automatiquement le stock le plus ancien (ex. « Auto (FIFO) »).");
b("Quantité distribuée||Champ numérique obligatoire pour saisir la quantité distribuée. L'unité de mesure s'affiche automatiquement à côté du champ.");
b("Heure d'alimentation||Sélecteur de date et d'heure pour consigner le moment exact de l'événement d'alimentation.");
b("Taux de consommation||Un interrupteur ou curseur permettant à l'utilisateur d'indiquer le pourcentage d'aliment réellement consommé par l'animal.");
b("Réaction de l'animal||Un menu déroulant pour consigner la réaction observée des animaux à l'aliment.");
b("Notes et commentaires||Zone de texte pour ajouter des observations ou informations complémentaires pertinentes.");
b("Bouton d'action||Un bouton vert « Complete Record » pour finaliser et enregistrer le journal d'alimentation.");

h2("Liste des enregistrements d'alimentation");
p("Le panneau de droite affiche une liste des entrées d'alimentation récentes.");
b("Recherche et filtres||Une barre de recherche intitulée « Search by feed or target... », accompagnée de deux sélecteurs de dates pour filtrer les enregistrements par plage spécifique.");
b("Liste de données||Chaque entrée est affichée sous forme de carte montrant le nom de l'animal ou du lot, le type d'aliment, l'horodatage, la quantité consommée avec son unité, et un bouton « View » (icône d'œil) pour consulter les détails complets.");

h2("Rapports d'alimentation / Analytique");
p("Le clic sur le bouton Analytics mène au tableau de bord des rapports d'alimentation.");
b("Plage de dates||Deux sélecteurs de dates intitulés « FROM » et « TO » pour filtrer la période du rapport, accompagnés d'un bouton « Apply Filters ».");
b("Onglets de navigation||Trois onglets sont disponibles : « Overview », « Performance » et « Distribution ».");
b("Zone de graphique||Affiche un graphique « Daily Consumption Trend », illustrant la consommation dans le temps avec une comparaison à la période précédente.");
b("Actions disponibles||Un bouton « Refresh » pour actualiser les données du rapport et un bouton « Export » pour télécharger le rapport.");

// ===================== 10. HEALTH =====================
h1("10. Suivi de la santé et des traitements");
p("Le module Santé centralise l'enregistrement et le suivi des activités de santé du bétail, incluant les vaccinations, prescriptions, journaux de maladies, visites vétérinaires, bilans de santé et alertes santé.");

h2("Aperçu de l'interface");
p("La page de suivi de la santé et des alertes de vaccination est divisée en une zone récapitulative en haut, une grille de tuiles d'action à gauche, et une liste des enregistrements récents à droite.");

h2("Cartes récapitulatives");
p("Trois cartes récapitulatives affichent les indicateurs de santé clés :");
b("Health checks||Le nombre total de bilans de santé enregistrés dans le système.");
b("Active alerts||Le nombre actuel d'alertes de santé actives.");
b("Vaccinations||Le nombre total d'événements de vaccination enregistrés.");

h2("Enregistrer une action de santé");
p("Cette section fournit un accès rapide aux différents formulaires d'enregistrement de santé via une grille de six tuiles d'action :");
b("Vaccination");
b("Prescription");
b("Log disease");
b("Schedule visit");
b("Health checkup");
b("Health alert");
p("Lorsqu'une tuile est sélectionnée, elle est mise en évidence avec un fond vert. Une description de l'action sélectionnée apparaît sous la grille, accompagnée d'un bouton vert « + Open form » pour lancer la fenêtre modale de saisie détaillée correspondante.");

h2("Liste des dossiers de santé");
p("Le panneau de droite affiche un historique des actions de santé récentes.");
b("Recherche et filtres||Une barre de recherche intitulée « Animal or action... », un menu déroulant de filtre pour sélectionner des types d'action spécifiques, et un sélecteur de date pour filtrer par date.");
b("Liste de données||Chaque carte d'enregistrement affiche le type d'action, l'horodatage, une étiquette indiquant la catégorie d'action, et un bouton « View » (icône d'œil) pour consulter l'entrée. Un bouton « Show more » est disponible en bas pour charger des enregistrements historiques supplémentaires.");

h2("Fenêtres modales et formulaires d'action de santé");

h3("1. Fenêtre modale d'enregistrement de vaccination");
p("Lorsque l'action Vaccination est sélectionnée, une fenêtre modale à plusieurs sections apparaît :");
b("Informations sur l'animal||Champ « Animal ID » obligatoire pour sélectionner l'animal cible.");
b("Types de vaccin||Menu déroulant obligatoire pour sélectionner le type de vaccin à administrer.");
b("Date de vaccination||Sélecteur de date obligatoire pour enregistrer la date d'administration.");
b("Article / Médicament||Menu déroulant obligatoire pour sélectionner l'article d'inventaire ou le médicament utilisé.");
b("Quantité à administrer||Champ numérique obligatoire pour préciser le dosage.");
b("Attribution du vétérinaire||Un groupe de boutons radio pour attribuer l'enregistrement. Options : « Assign to myself » (utilise le nom de l'utilisateur connecté) et « Assign to another veterinarian » (ouvre une liste de sélection).");
b("Planifier la prochaine vaccination||Une case à cocher qui, une fois sélectionnée, s'étend pour permettre de planifier un futur événement de vaccination.");
b("Boutons d'action||Un bouton « Cancel » et un bouton « Save » pour finaliser l'enregistrement de vaccination.");

h3("2. Fenêtre modale de nouvelle prescription");
p("Cette fenêtre modale permet d'enregistrer un lot de médicaments pour un animal avec une gestion automatisée du stock :");
b("Informations sur l'animal||Champ « Animal ID » obligatoire pour rechercher l'animal cible.");
b("Ajouter un médicament||Une section extensible contenant :");
b2("Médicament : menu déroulant obligatoire pour sélectionner le produit à prescrire.");
b2("Informations de dosage : quantité totale à utiliser pour le traitement (champ numérique obligatoire avec menu déroulant d'unité) ; dosage par administration (champ numérique obligatoire avec menu déroulant d'unité) ; fréquence d'administration (champ numérique obligatoire avec menu déroulant, ex. « Times per day »).");
b2("Date de début : sélecteur de date obligatoire.");
b2("Date de fin : sélecteur de date obligatoire.");
b2("Notes / instructions particulières : zone de texte pour les instructions d'administration et précautions.");
b2("Bouton d'action : un bouton « Add this medication to batch » pour ajouter le médicament configuré à la prescription.");
b("Total treatment days||Champ numérique, accompagné d'un texte d'aide indiquant la période de retrait : « Number of days before the animal is consumable again ».");
b("Attribution du vétérinaire||Groupe de boutons radio (« Assign to myself » / « Assign to another veterinarian »).");
b("Boutons d'action||« Cancel » et « Save entire prescription ».");

h3("3. Fenêtre modale d'enregistrement d'une maladie");
p("Cette fenêtre modale permet d'enregistrer un cas de maladie avec suivi de la sévérité :");
b("Informations sur l'animal||Champ « Animal ID » obligatoire.");
b("Nom de la maladie||Champ de texte obligatoire.");
b("Sévérité||Menu déroulant obligatoire (ex. mild, moderate, severe).");
b("Date de diagnostic||Sélecteur de date obligatoire.");
b("Statut||Menu déroulant obligatoire (ex. Open, Resolved).");
b("Symptômes||Zone de texte pour décrire les symptômes observés, avec compteur de caractères.");
b("Attribution du vétérinaire||Groupe de boutons radio (« Assign to myself » / « Assign to another veterinarian »).");
b("Boutons d'action||« Cancel » et « Save ».");

h3("4. Fenêtre modale de planification de visite");
p("Cette fenêtre modale permet de réserver un rendez-vous vétérinaire :");
b("Informations sur l'animal||Champ « Animal ID » obligatoire.");
b("Type de visite||Menu déroulant obligatoire pour préciser la nature de la visite.");
b("Durée (minutes)||Champ numérique pour définir la durée du rendez-vous.");
b("Date planifiée||Sélecteur de date obligatoire.");
b("Heure planifiée||Sélecteur d'heure obligatoire.");
b("Attribution du vétérinaire||Groupe de boutons radio (« Assign to myself » / « Assign to another veterinarian »).");
b("Notes||Zone de texte pour saisir les détails ou préoccupations liés à la visite.");
b("Boutons d'action||« Cancel » et « Save ».");

h3("5. Fenêtre modale de bilan de santé");
p("Cette fenêtre modale permet de réaliser une évaluation de santé avec suivi des signes vitaux :");
b("Informations cibles||Champ « Animal ID » obligatoire.");
b("Espèce||Menu déroulant obligatoire pour sélectionner l'espèce de l'animal.");
b("Date du bilan||Sélecteur de date obligatoire.");
b("État général||Menu déroulant obligatoire pour évaluer le statut de santé général de l'animal.");
b("Attribution du vétérinaire||Groupe de boutons radio (« Assign to myself » / « Assign to another veterinarian »).");
b("Observations||Zone de texte pour notes complémentaires.");
b("Boutons d'action||« Cancel » et « Record Health Check ».");

h3("6. Fenêtre modale de création d'une alerte santé");
p("Cette fenêtre modale permet de déclencher une alerte pour une attention vétérinaire immédiate :");
b("Informations cibles||Menu déroulant « Animal » obligatoire.");
b("Date du bilan||Sélecteur de date obligatoire.");
b("Type d'urgence||Menu déroulant obligatoire (ex. Urgent).");
b("Vétérinaire||Menu déroulant obligatoire pour assigner l'alerte à un praticien spécifique.");
b("Constatations cliniques||Zone de texte pour décrire les symptômes, comportements anormaux ou constats physiques.");
b("Action recommandée||Menu déroulant pour suggérer une marche à suivre.");
b("Boutons d'action||« Cancel » et « Create Alert ».");

// ===================== 11. PRODUCTION =====================
h1("11. Enregistrement de la production");
p("Le module Production est utilisé pour enregistrer les rendements quotidiens de la ferme, gérer les objectifs de production et suivre les incubations pour la volaille. Il est organisé autour d'un tableau de bord principal avec alertes et trois onglets de navigation principaux.");

h2("Aperçu de l'interface");
p("La page d'enregistrement de la production comporte un en-tête, un ensemble d'indicateurs récapitulatifs et trois onglets de navigation : Productions, Manage Productions et Incubations.");

h2("Cartes du tableau de bord (visibles en accédant à l'onglet)");
b("Aperçu de la production hebdomadaire||Une carte qui suit les entrées de production récentes. En l'absence de données pour la période sélectionnée, un état vide avec le texte « No production for this period » est affiché.");
b("Alertes et analyses||Une carte dédiée à l'affichage des alertes système liées à la production. Elle inclut un compte des alertes non traitées, un bouton d'actualisation et un ensemble de boutons de filtre de sévérité : All, Critical, High, Medium et Low. En l'absence d'alertes, un état vide avec le texte « No active alerts » est affiché.");

h2("Onglet 1 : Productions");

h3("Cartes récapitulatives");
p("Trois cartes récapitulatives sont affichées en haut de cet onglet :");
b("Egg Production||La quantité totale d'œufs enregistrés.");
b("Total Records||Le nombre total d'entrées d'enregistrement de production sauvegardées.");
b("Production types||Le nombre de catégories de production distinctes configurées.");

h3("Formulaire d'enregistrement d'une production (panneau de gauche)");
b("Animal||Champ déroulant obligatoire pour « Choose an animal ».");
b("Date de production||Sélecteur de date obligatoire (par défaut, la date du jour).");
b("Bouton d'action||Un bouton « Save » (icône plus) pour soumettre l'enregistrement de production.");

h3("Liste des productions enregistrées (panneau de droite)");
b("Recherche et filtres||Une barre de recherche intitulée « Search production... », accompagnée de boutons de filtre « 7 days », « 30 days » et « All ».");
b("Refresh||Un bouton d'actualisation pour mettre à jour la liste.");
b("Liste de données||Affiche l'historique de production. Un état vide avec le texte « No production records yet » est affiché en l'absence d'entrées.");

h2("Onglet 2 : Manage Productions");
p("Cet onglet permet d'affecter les articles de production enregistrés à des destinations spécifiques, telles que la vente, la reproduction ou le cheptel.");

h3("Statistiques récapitulatives");
p("Une barre horizontale affiche une répartition du statut actuel de l'inventaire de production :");
b("Productions||Le nombre total d'entrées de production.");
b("To assign||Le nombre d'articles de production non encore affectés.");
b("Available for sale||Le nombre d'articles affectés à la vente commerciale.");
b("Breeding / Incubation||Le nombre d'articles affectés à la conservation du cheptel ou à l'éclosion.");

h3("Recherche et filtres");
b("Barre de recherche||Champ de texte intitulé « Search... » pour filtrer la liste de production.");
b("Filtres de statut||Trois boutons d'activation pour filtrer la liste par statut d'affectation : All, To assign et Assigned. Chaque filtre affiche le nombre actuel d'enregistrements correspondant à ce statut.");

h3("Liste de données et état vide");
p("La zone principale affiche une liste des articles de production. En l'absence d'article créé, un état vide est affiché avec le texte « No production found » et une instruction : « Record a production in the 'Productions' tab ».");

h3("Actions disponibles");
b("Refresh||Un bouton d'actualisation situé en haut à droite de l'onglet pour mettre à jour les données affichées.");

h2("Onglet 3 : Incubations");

h3("Cartes récapitulatives");
p("Quatre cartes récapitulatives fournissent des indicateurs d'incubation :");
b("In incubation||Le nombre d'œufs actuellement en incubation.");
b("Ready to hatch||Le nombre d'œufs proches de la fin de la période d'incubation.");
b("Hatched animals||Le nombre total d'animaux ayant éclos avec succès.");
b("Avg. rate||Le taux d'éclosion moyen.");

h3("Onglets de filtre");
p("Une rangée de boutons de filtre permet de visualiser des segments spécifiques du lot d'incubation : « All », « In progress », « Hatched » et « Failed ».");

h3("Liste de données et état vide");
p("La zone principale affiche une liste des lots d'incubation. En l'absence de lot enregistré, un état vide est affiché avec le texte « No batch recorded », accompagné d'une instruction : « Record an egg production then choose 'Put in incubation' ».");

h3("Actions disponibles");
b("Refresh||Un bouton d'actualisation situé en haut à droite de la section Incubations.");

// ===================== 12. LOSSES =====================
h1("12. Gestion des pertes et de la mortalité");
p("Le module Pertes est conçu pour suivre les décès d'animaux, les blessures et autres incidents de perte, en fournissant des analyses détaillées sur les taux de mortalité et les impacts financiers.");

h2("Aperçu de l'interface");
p("La page « Record Death/Loss » est divisée en un formulaire à gauche pour signaler les incidents et une section à droite affichant les incidents récents et des graphiques analytiques.");

h2("Bascule de segments");
p("En haut à droite, un contrôle segmenté permet de filtrer la vue par segment : « All », « Livestock » ou « Poultry ».");

h2("Cartes récapitulatives");
p("Trois cartes récapitulatives présentent les indicateurs clés de pertes :");
b("Death Reports||Le nombre total de rapports de décès enregistrés dans le mois en cours.");
b("Financial Impact||La valeur totale de perte financière calculée à partir de tous les incidents.");
b("Mortality Rate||Le taux de mortalité calculé en pourcentage, accompagné d'une évaluation comparative (ex. « Below Average »).");

h2("Formulaire d'enregistrement de décès/perte (panneau de gauche)");
b("Sélectionner l'animal||Champ déroulant obligatoire intitulé « Select Animal » effectuant une recherche automatique via RFID, code QR ou lot.");
b("Type d'incident||Menu déroulant obligatoire pour classer le type d'événement de perte.");
b("Date de la perte||Sélecteur de date obligatoire pour enregistrer la date de l'incident.");
b("Cause||Menu déroulant obligatoire pour sélectionner la cause principale de la perte.");
b("Description||Zone de texte pour fournir une description détaillée de l'incident.");
b("Actions entreprises||Menu déroulant pour sélectionner la réponse ou l'action entreprise.");
b("Bouton d'action||Un bouton « Submit Report » pour finaliser l'entrée de perte.");

h2("Pertes / incidents récents (panneau de droite)");

h3("Recherche et filtres");
b("Type d'incident||Un filtre déroulant pour sélectionner des types d'incident spécifiques.");
b("Mode de filtrage||Un menu déroulant pour sélectionner la méthode de tri ou de filtrage (ex. « Date of loss »).");
b("Plage de dates||Deux sélecteurs de dates intitulés « From » et « To » pour filtrer les incidents par période.");

h3("Liste de données");
p("Les incidents récents sont affichés sous forme de cartes montrant :");
b("Le code RFID/lot de l'animal et la date de l'incident.");
b("L'étiquette de cause (ex. mass-mortality, injury, loss, death).");
b("L'impact financier affiché en valeur monétaire.");
b("Action||Un bouton « View » (icône d'œil) pour consulter les détails complets de l'incident.");
b("Un bouton extensible « Show more » pour charger des incidents supplémentaires.");

h3("Section analytique (bas de page)");
b("Répartition par cause||Un graphique à barres horizontales affichant la répartition des incidents de perte par cause (ex. Disease, Injury, Predator, Temperature), avec chiffres et pourcentages.");
b("Tendances mensuelles||Une liste chronologique résumant les données historiques par mois, montrant le nombre total d'enregistrements, les cas de décès et l'impact financier.");

// ===================== 13. CUSTOMER =====================
h1("13. Gestion des clients");
p("Le module Clients permet de gérer une base de données d'acheteurs commerciaux, en suivant leurs coordonnées, types d'activité et statuts de compte.");

h2("Aperçu de l'interface");
p("La page Clients affiche une liste complète des clients enregistrés sous forme de mise en page en cartes.");

h2("Actions disponibles");
b("+ Add a customer||Un bouton vert situé en haut à droite pour ouvrir la fenêtre modale de création de client.");

h2("Recherche et filtres");
b("Barre de recherche||Champ intitulé « Search customers by name or email » pour filtrer la liste des clients.");
b("Filtre de type||Menu déroulant intitulé « All customer types » pour filtrer par catégorie d'activité.");

h2("Liste des clients");
p("Chaque client est affiché sous forme de carte individuelle contenant :");
b("Nom||Le nom complet du client.");
b("Badge de statut||Un badge « active » (vert) indiquant le statut actuel du compte.");
b("Badge de type d'activité||Un badge de catégorie (ex. « Cooperative », « Individual »).");
b("Badge de niveau||Un badge de désignation (ex. « Basic »).");
b("Coordonnées||L'adresse email et le numéro de téléphone du client.");
b("Emplacement||L'adresse physique ou la ville.");
b("Actions de ligne||Trois boutons d'action sont disponibles pour chaque carte client :");
b2("View (icône d'œil) : ouvre le profil détaillé du client.");
b2("Edit (icône de crayon) : ouvre le formulaire de modification des informations du client.");
b2("Delete (icône de corbeille) : supprime le client de la base de données.");

h2("Fenêtre modale « Ajouter un nouveau client »");
p("Le clic sur « + Add a customer » ouvre une fenêtre modale avec les champs obligatoires suivants :");
b("Nom du client||Champ de texte.");
b("Type d'activité||Menu déroulant pour sélectionner la catégorie d'activité du client.");
b("Email||Champ de texte pour l'adresse email du client.");
b("Téléphone de contact||Champ de numéro de téléphone avec sélecteur d'indicatif pays.");
b("Emplacement||Champ de texte pour les informations d'adresse physique.");
b("Bouton d'action||Un bouton vert « Create customer » pour enregistrer le nouveau profil sur la plateforme.");

// ===================== 14. SALES =====================
h1("14. Ventes et configuration des revenus");
p("Le module Ventes fournit une vue centralisée pour gérer les ventes de la ferme, suivre les revenus, définir les règles de tarification et surveiller l'historique des équipes de caisse.");

h2("Aperçu de l'interface");
p("La page « Sales & Revenue Tracking » est structurée avec un en-tête et quatre onglets de navigation principaux : Dashboard, Pricing, Cashier Sessions et POS Settings.");

h2("Onglet 1 : Dashboard");
p("Cet onglet fournit un aperçu de haut niveau de la performance des ventes.");

h3("Filtres temporels et actions");
b("Filtres de période rapide||Boutons pour filtrer les données par « Today », « 7 days », « 30 days » et « All Time ».");
b("Refresh||Un bouton pour recharger les données du tableau de bord.");

h3("Cartes récapitulatives");
p("Quatre cartes récapitulatives affichent les indicateurs de vente clés :");
b("Revenue Today||Le revenu total des ventes pour le jour en cours, accompagné d'une comparaison en pourcentage avec la veille.");
b("Total Revenue (30 days)||Le revenu cumulé des 30 derniers jours, ainsi que le nombre total de commandes durant cette période.");
b("Unique Customers||Le nombre de clients distincts ayant effectué des achats durant la période sélectionnée.");
b("Average Cart||La valeur monétaire moyenne d'une transaction unique.");

h3("Sections principales");
b("Recent Sales||Un tableau de données affichant les dernières transactions. Colonnes visibles : Transaction ID, Date, Payment method, Total Price, Status (ex. « PAID ») et Actions (menu extensible).");
b("Top 5 Articles||Une carte affichant les produits les plus rentables pour la période sélectionnée, montrant le nom de l'article et le revenu total généré.");

h2("Onglet 2 : Pricing");
p("Cet onglet gère les règles de tarification dynamique. Un sous-titre indique : « Rules are evaluated at POS — highest priority wins. »");

h3("Actions disponibles");
b("New Rule||Un bouton vert situé en haut à droite pour ouvrir la fenêtre modale de création de règle de tarification.");
b("Refresh||Un bouton pour recharger la liste des règles.");

h3("Liste des règles de tarification dynamique");
p("Chaque règle de tarification est affichée sous forme de carte distincte contenant :");
b("Détails de la règle||Le nom du produit, un badge d'étiquette (ex. Bio, Seasonal, Promo) et le prix unitaire applicable.");
b("Dates de validité||Les dates de début et de fin de validité de la règle.");
b("Catégorie/Type||L'article ou la catégorie associée (ex. Livestock).");
b("Actions de ligne||Boutons pour Edit (icône de crayon), Toggle/Activate (icône d'alimentation) et Delete (icône de corbeille).");

h3("Fenêtre modale « Nouvelle règle de tarification »");
p("Le clic sur « New Rule » ouvre une fenêtre modale pour définir une règle de tarification personnalisée.");
b("Portée de la tarification||Un bouton de bascule pour appliquer la règle à un « Product / Item » ou à un « Animal ».");
b("Article spécifique||Menu déroulant pour sélectionner le produit exact de l'inventaire.");
b("Nom de la règle||Champ de texte obligatoire.");
b("Priorité||Champ numérique. Un texte d'aide explique : « Higher number means higher priority. If multiple rules match, the one with the highest priority is applied. »");
b("Prix unitaire||Champ numérique obligatoire pour définir le prix unitaire final des articles correspondants.");
b("Étiquette POS (facultatif)||Champ de texte pour définir une étiquette d'identification rapide au point de vente.");
b("Boutons d'action||« Cancel » et « Save ».");

h2("Onglet 3 : Cashier Sessions");
p("Cet onglet affiche l'historique des équipes (« Shift History ») de toutes les sessions de caisse.");

h3("Recherche et filtres");
b("Barre de recherche||Champ intitulé « Filter by cashier or terminal... ».");
b("Colonnes du tableau||Le tableau « Recent Sessions » affiche : Date, Customer Name / Terminal, Status (ex. « Discrepancy noted »), Initial Float, Expected (total système), Actual (espèces physiques comptées), Discrepancy (écart) et Actions.");

h3("Actions disponibles");
b("Refresh||Un bouton d'actualisation vert situé en haut à droite.");

h2("Onglet 4 : POS Settings");
p("Cet onglet permet de configurer les paramètres globaux du point de vente.");

h3("Formulaire de configuration");
b("Seuil de remise (%)||Champ numérique. Un texte d'aide explique : « Maximum discount percentage allowed without manager approval. »");
b("Taux de taxe (%)||Champ numérique. Un texte d'aide explique : « Applied after discount. Use 0 to disable tax. »");
b("PIN Manager||Champ masqué. Un texte d'aide explique : « 4-10 digit PIN required for overrides. » Une icône d'œil permet de basculer la visibilité.");
b("Bouton d'action||Un bouton « Save » pour mettre à jour les paramètres.");

h3("Avis de sécurité");
p("Une bannière jaune en bas indique : « These settings affect the security of your POS. Keep your PIN confidential. »");

// ===================== 15. POS =====================
h1("15. Point de vente (POS)");
p("L'écran du point de vente (POS) est une interface rapide conçue pour permettre aux caissiers de traiter les ventes, scanner les produits, gérer les pesées et effectuer les opérations d'équipe.");

h2("Aperçu de l'interface");
p("L'écran POS est divisé en une zone de recherche de produits à gauche et un panier d'achat à droite. Une barre d'en-tête affiche le nom de l'utilisateur, les informations du terminal et les contrôles d'équipe.");

h2("Cycle de vie de l'équipe (Shift)");
p("Pour utiliser le POS, un caissier doit gérer son équipe.");

h3("1. Fenêtre modale d'ouverture d'équipe");
p("Avant d'accéder à l'écran POS principal, le caissier doit ouvrir une équipe à l'aide de la fenêtre modale suivante :");
b("Sélectionner le terminal||Menu déroulant obligatoire pour choisir le terminal POS actif.");
b("Enregistrer un nouveau terminal||Un lien texte permettant d'ajouter un nouveau terminal.");
b("Fonds de caisse d'ouverture (facultatif)||Champ numérique pour saisir le montant de départ dans le tiroir-caisse.");
b("Bouton d'action||Un bouton vert « Start Shift » pour activer la session.");

h3("2. Interface POS principale (équipe active)");
b("En-tête supérieur||Affiche le nom du caissier, un bouton « Organisation », un bouton « Refresh », un sélecteur de langue et un bouton rouge « Shift Closing » pour terminer la session en cours.");
b("Recherche de produits||");
b2("Barre de scan : champ de texte intitulé « Scan barcode or enter manually » accompagné d'un bouton vert « Scan » pour déclencher la lecture du code-barres.");
b2("Barre de recherche : champ de texte intitulé « Search » pour trouver des produits par nom ou SKU.");
b2("Cartes de produits : chaque résultat de recherche affiche un nom de produit, un SKU, le stock disponible actuel et l'unité de mesure. Un bouton « + Weigh » est visible pour les articles vendus au poids, permettant l'intégration avec une balance numérique.");
b("Panier d'achat||Le panneau de droite affiche le « Cart ». S'il est vide, il montre une illustration de type espace réservé et le texte « Your cart is empty ». Le nombre total d'articles est affiché en haut.");

h3("3. Fenêtre modale de fermeture d'équipe (réconciliation et clôture)");
p("Lorsque le caissier clique sur « Shift Closing », une fenêtre modale apparaît :");
b("Résumé de session||Affiche le « Opening Float », le « Session ID » et l'identifiant du « Terminal ».");
b("Espèces réelles comptées||Champ numérique obligatoire où le caissier saisit les espèces physiquement présentes dans le tiroir.");
b("Écart estimé||Une zone dynamique qui calcule l'écart entre les espèces réelles et le total attendu par le système.");
b("Bouton d'action||Un bouton rouge « Confirm Closing » pour finaliser l'équipe.");

h3("4. Rapport de clôture de caisse");
p("Après confirmation de la clôture, une fenêtre modale de rapport récapitulatif est générée :");
b("Avertissement d'écart||En cas de différence, une zone d'avertissement jaune est affichée, indiquant le montant et précisant qu'un rapport d'écart a été généré et que les administrateurs ont été notifiés.");
b("Totaux||Des cartes côte à côte affichent le « EXPECTED TOTAL » (théorique) et le « COUNTED TOTAL » (réel).");
b("Répartition des flux de trésorerie||Une section montrant le « Initial float », le « Total sales (Session) » et le « Expected Total (Theoretical) ».");
b("Répartition détaillée||Des sections rétractables pour « By Payment Method » et « By Item Type » afin d'auditer la composition de la session.");
b("Notification toast||Une notification temporaire apparaît en bas à droite confirmant : « Shift closed successfully ».");

// ===================== 16. FINANCIAL =====================
h1("16. Analyse financière");
p("Le module Finances fournit une vue consolidée de la rentabilité de la ferme en agrégeant les revenus, les dépenses, les dettes en cours et la répartition des coûts.");

h2("Aperçu de l'interface");
p("La page d'analyse financière est structurée avec une barre de recherche en haut, un ensemble de cartes d'indicateurs récapitulatifs, des cartes de vue d'ensemble des dettes, un graphique de répartition des dépenses, des cartes de segments d'élevage, et des recommandations automatisées.");

h2("Recherche et filtres");
b("Barre de recherche||Champ intitulé « Search breeding type... ».");
b("Plage de dates||Deux sélecteurs de dates intitulés « Period ».");
b("Actions disponibles||Un bouton « Refresh » pour recharger les données et un bouton « Export CSV » pour télécharger le rapport financier.");

h2("Cartes récapitulatives");
p("Quatre cartes financières principales affichent :");
b("Revenue||Le revenu total généré durant la période sélectionnée.");
b("Expenses||Le coût total encouru.");
b("Net Profit||La différence calculée entre revenus et dépenses (qui peut apparaître comme une valeur négative indiquant une perte).");
b("Margin||La marge bénéficiaire exprimée en pourcentage.");

h2("Cartes de vue d'ensemble des dettes");
b("Customers owe the farm||La dette totale en cours due par les acheteurs, ainsi que le nombre de clients endettés.");
b("The farm owes suppliers||La dette totale en cours envers les fournisseurs, ainsi que le nombre de fournisseurs concernés.");

h2("Répartition des dépenses");
p("Un graphique à barres horizontales ou une liste affichant les principales catégories de dépenses. Chaque catégorie affiche le montant dépensé et son pourcentage du total des dépenses. Catégories visibles :");
b("Approvisionnement et fournitures");
b("Coûts d'achat des animaux");
b("Coûts de santé animale");
b("Coûts d'alimentation et de nutrition");
b("Pertes de stock");
b("Pertes animales");
b("Autres dépenses");

h2("Segments d'élevage");
p("Des cartes représentant différents segments d'exploitation (ex. Livestock Farming, Poultry Farming). Chaque carte fournit un résumé rapide :");
b("Statut d'activité||Une étiquette indiquant s'il y a « No activity » ou une marge positive.");
b("Résumé financier||Affiche le revenu, les dépenses et le profit pour ce segment spécifique.");
b("Navigation||Une flèche pointant vers la droite permet à l'utilisateur de cliquer et d'explorer le segment plus en détail.");

h2("Recommandations");
p("Une carte dédiée affichant des « alertes et conseils personnalisés » basés sur les données financières. Chaque recommandation comprend :");
b("Titre de l'alerte||Ex. « Low Profit Margin » (étiquetée « Urgent »), « High Health Costs », « High Procurement Costs ».");
b("Description||Une analyse spécifique reliant les indicateurs financiers globaux à l'alerte, comme une marge bénéficiaire tombant sous un seuil ou une catégorie de coût spécifique dépassant un pourcentage sain du revenu.");

// ===================== 17. NOTIFICATIONS =====================
h1("17. Notifications et alertes système");
p("FarmTinz dispose d'un système de notification en temps réel pour tenir les utilisateurs informés des événements critiques, des mises à jour système et des alertes opérationnelles.");

h2("Interface du panneau de notifications");
p("Le centre de notifications est accessible via une icône de cloche dans l'en-tête supérieur. Il s'ouvre sous forme de tiroir coulissant en superposition sur le côté droit de l'écran.");
b("En-tête||Affiche le titre « Notifications » et un sous-titre « All caught up » (en l'absence d'éléments non lus). Un bouton de fermeture (X) est situé en haut à droite.");
b("Onglets de catégorie||Une rangée d'onglets de filtre permet de visualiser des types de notifications spécifiques. Onglets visibles : All, Subscription, Inventory, Sales, Production (et potentiellement d'autres).");
b("Éléments de notification||Chaque notification est affichée sous forme d'élément de liste distinct contenant :");
b2("Icône : une icône colorée indiquant la catégorie de l'événement (ex. une icône de boîte pour les événements d'inventaire).");
b2("Titre : un résumé de l'événement, tel que « Items Received » ou « New Procurement Order ».");
b2("Description : une chaîne détaillée précisant l'action effectuée (ex. « Items have been received for order PO-... », « An action (procurement_created) was performed in inventory. »).");
b2("Action d'expansion : un lien texte « Show more » qui développe la notification pour révéler des détails supplémentaires.");
b2("Horodatage : le temps écoulé depuis le déclenchement de l'événement (ex. « 2 days ago »).");
b2("Action : une icône de corbeille (suppression) pour rejeter la notification individuelle.");
b("Bouton de pied de page||Un bouton « Clear All Notifications » en bas du tiroir pour rejeter toutes les alertes simultanément.");

h2("Diffusion des alertes");
b("Alertes intégrées à l'application||Le système délivre les notifications directement dans l'application via le panneau de notifications et des messages toast pour les mises à jour immédiates et non persistantes.");
b("Préférences de notification||Les utilisateurs peuvent gérer leurs préférences d'email et de notifications push dans l'onglet Paramètres.");

// ===================== 18. SETTINGS =====================
h1("18. Paramètres");
p("La section Paramètres fournit un emplacement centralisé pour les tâches administratives et de configuration.");
b("Paramètres de l'organisation||Gérer le profil de l'organisation, le logo, le nom et la devise standard.");
b("Gestion des utilisateurs et des sièges||Inviter de nouveaux membres dans l'organisation, consulter les connexions des utilisateurs actifs, assigner des rôles et suivre le nombre de sièges utilisateurs actifs par rapport aux limites du plan.");
b("Emplacements||Configurer la disposition géographique ou structurelle de la ferme. Enregistrer les enclos, parcs, bassins et salles pour organiser les animaux de manière logique.");
b("Codes des animaux et des commandes||Gérer les schémas système, y compris la personnalisation des règles de préfixe pour l'identification des animaux (RFID, étiquettes) et les reçus de commande en caisse.");
b("Préférences de notification||Une interface dédiée pour configurer comment et quand les alertes système sont reçues (email, in-app, push).");

module.exports = content;