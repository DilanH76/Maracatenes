// Config
// Les Constantes : Ce sont des valeurs qui ne changeront JAMAIS
const PRICE_SEMI = 90;
const PRICE_FULL = 130;

// Compteur participants 
// participantsCount : Sert à donner un ID unique (1, 2, 3...) à chaque personne
let participantsCount =0;
// currentMode : Se souvient si on est en "solo" ou "team" pour adapter les règles.
let currentMode = 'solo';

// Element DOM
// On va chercher les éléments par leur ID HTML et on les stocke dans des variables
const container = document.getElementById('participants-container');
const btnAdd = document.getElementById('btn-add-participant');
const cartDetails = document.getElementById('cart-details');
const totalPriceEl = document.getElementById('total-price');



// Fonction créer formulaire 
// Décider si on affiche le bouton supprimer
function createParticipantHTML(id) {
    // je calcule la condition pour afficher le bouton
    // Si on est en TEAM j'affiche le bouton seulement si l'id est > 2
    // Sinon SOLO on affiche le bouton si l'id est > 1
    const showDeleteBtn = (currentMode === 'team') ? (id > 2) : (id > 1);
    // ${id} permet d'insérer le numéro dynamique partout (pour les names, les ids, etc)
    return `
    <div class="participant-card" id="card-${id}" data-id="${id}">
    <h3>Participant ${id}
    ${showDeleteBtn ? `<button type="button" class="btn-delete"onclick="removeParticipant(${id})">Supprimer</button>` : ''}
    </h3>

    <div class="form-group">
    <label>Nom <span class="stars">*</span></label>
    <input type="text" name="lastName_${id}" class="input-check" required>
    </div>

    <div class="form-group">
            <label>Prénom <span class="stars">*</span></label>
            <input type="text" name="firstName_${id}" class="input-check" required>
        </div>

        <div class="form-group">
            <label>Age <span class="stars">*</span></label>
            <input type="number" name="age_${id}" class="input-check" min="18" max="99" required>
        </div>

        <div class="form-group">
            <label>Email <span class="stars">*</span> (ex: nom@mail.com)</label>
            <input type="email" name="email_${id}" class="input-check" required placeholder="nom@mail.com">
        </div>

        <div class="form-group">
            <label>Téléphone <span class="stars">*</span> (10 chiffres)</label>
            <input type="tel" name="phone_${id}" class="input-check" required placeholder="0600000000">
        </div>
        <p>(<span class="stars">*</span>) Ces champs sont obligatoires</p>
        <div class="radio-group">
            <p>Type de course :</p>
            <input id="radio-semi" type="radio" name="race_${id}" value="semi"  onchange="updateCart()"> 
            <label for="radio-semi">Semi-Marathon (${PRICE_SEMI}€)</label><br>
            
            <input id="radio-full" type="radio" name="race_${id}" value="full" onchange="updateCart()"> 
            <label for="radio-full">Marathon Complet (${PRICE_FULL}€)</label>
        </div>

        <div class="radio-group">
            <input id="radio-captain${id}" type="radio" name="captain" value="${id}" ${id === 1 ? 'checked' : ''}>
            <label for="radio-captain${id}">Je suis le capitaine</label>
        </div>
    </div>
    `;

}

// Ajouter un participant 
// Paramètre force = false : Par défaut, c'est un clic utilisateur (donc on vérifie).
// Si le code envoie "true", c'est une initialisation (on force sans vérifier).
function addParticipant(force = false) {
    // LA SÉCURITÉ :
    // 1. Si on ne force pas (force !== true)
    // 2. ET qu'il y a déjà des formulaires (length > 0)
    // 3. ET que les champs actuels sont mal remplis (!checkAllInputsValid)
    // ALORS : On bloque tout (return) et on affiche une alerte.

    if (force !== true && container.children.length > 0 && !checkAllInputsValid()) {
        alert("Veuillez remplir correctement tous les champs précédents avant d'ajouter un participant.");
        return;
    }
    // On incrémente le compteur (Participant 1 devient 2, etc.)
    participantsCount++;
    // div temporaire pour creer le html
    const tempDiv = document.createElement('div');
    // note : on passe true/false au moment de l'appel pas ici
    tempDiv.innerHTML = createParticipantHTML(participantsCount);
    // On prend l'enfant de cette div (le formulaire) et on l'ajoute physiquement au container HTML
    container.appendChild(tempDiv.firstElementChild);
    // À chaque ajout, on recalcule le prix
    updateCart();
}

// supprimer un participanrt

// window.removeParticipant : On l'attache à "window" pour qu'elle soit accessible 
// directement depuis le HTML (onclick="removeParticipant(...)")
window.removeParticipant = function(id) {
    // On cherche la carte précise grâce à son ID unique
    const card = document.getElementById(`card-${id}`);
    if (card) {
        card.remove(); // On la supprime du DOM
        updateCart(); // calcul du prix après suppression 
    } 

};

function validateInput(input) {
    const value = input.value; // Ce que l'utilisateur a écrit
    const name = input.name; // On part du principe que c'est bon, sauf preuve du contraire
    let isValid = true;

    // Les Regex (Expressions Régulières) : Des motifs pour vérifier les formats.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Vérifie forme a@b.c
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/; // Vérifie numéros français
    
    // On regarde le TYPE ou le NOM de l'input pour choisir le bon test
    if (input.type === "email") {
        isValid = emailRegex.test(value);
    } else if (input.type === "tel") {
        isValid = phoneRegex.test(value);
    } else if (input.name.startsWith("age_")) {
        // Pour l'âge : On convertit le texte en nombre (parseInt) et on vérifie >= 18
        isValid = (value !== "" && parseInt(value) >= 18 && parseInt(value) <= 99);
    } else {
        // Pour Nom/Prénom : Juste vérifier que ce n'est pas vide (trim enlève les espaces inutiles)
        isValid = value.trim() !== "";
    }
    // GESTION VISUELLE : Ajoute ou enlève la classe CSS "invalid" (bordure rouge)
    if (isValid) {
        input.classList.remove('invalid');
    } else {
        input.classList.add('invalid');
    }

    return isValid;

}



// C'est ici qu'on vérifie si une personne s'inscrit deux fois
function checkForDuplicates() {
    const cards = document.querySelectorAll('.participant-card'); // On récupère toutes les cartes
    const identities = []; // Une liste vide pour noter les noms qu'on croise
    let hasDuplicate = false; // Drapeau : pour l'instant, pas de doublon

    cards.forEach(card => {
        const id = card.getAttribute('data-id');
        // On cible les inputs Nom et Prénom de CETTE carte
        const lastNameInput = card.querySelector(`input[name="lastName_${id}"]`);
        const firstNameInput = card.querySelector(`input[name="firstName_${id}"]`);

        // On ne travaille que si les deux champs sont remplis
        if (lastNameInput.value && firstNameInput.value) {
            
            // CRÉATION DE L'EMPREINTE : 
            // On colle Nom + Prénom en minuscules (ex: "dupont-jean").
            // toLowerCase() sert à éviter que "Jean" et "jean" soient vus comme différents.
            const identity = `${lastNameInput.value.trim().toLowerCase()}-${firstNameInput.value.trim().toLowerCase()}`;

            // VERIFICATION : Est-ce que cette empreinte est DÉJÀ dans notre liste ?
            if (identities.includes(identity)) {
                // OUI -> C'est un doublon !
                firstNameInput.classList.add('invalid');
                lastNameInput.classList.add('invalid');
                hasDuplicate = true; // On lève le drapeau d'erreur
            } else {
                // NON -> On l'ajoute à la liste pour les suivants
                identities.push(identity);
                
            }
        }
    });
    
    return hasDuplicate; // Renvoie true si on a trouvé au moins un doublon
}

// verfier TOUT les inputs pour afficher ou masqué le bouton

function checkAllInputsValid() {
    const allInputs = document.querySelectorAll('.input-check'); // Tous les champs
    let allValid = true;
    // 1. On passe chaque champ au contrôle technique (validateInput)
    allInputs.forEach(input => {
        if (!validateInput(input)) {
            allValid = false; // Si un seul échoue, tout échoue
        }
    });

    // verifier les doublons
    // si checkForDuplicates renvoie true alors y'a un doublon, donc allValid devient false
    if (checkForDuplicates()) {
        allValid = false;
    }

    // activer ou désactiver btn ajouter
    btnAdd.disabled = !allValid;

    return allValid;
}

// gestion du panier 

function updateCart() {
    let total = 0;
    let htmlContent = "" ; 

    const cards = document.querySelectorAll('.participant-card');

    cards.forEach((card, index) => {
        // on recup quel radio es coché dans cette carte
        const id = card.getAttribute('data-id');
        const raceInput = card.querySelector(`input[name="race_${id}"]:checked`);
        // Sécurité : on ne calcule que si un bouton est bien coché
        if(raceInput) {
            const raceType = raceInput.value;
            // Opérateur ternaire pour définir le prix et le nom
            const price = (raceType === 'semi') ? PRICE_SEMI : PRICE_FULL;
            const raceName = (raceType === 'semi') ? "Semi-Marathon" : "Marathon Complet";
    
            total += price; // On ajoute au total
            // On ajoute une ligne au résumé HTML
            htmlContent += `<p>Participant ${index + 1} (${raceName}) <span>${price}€</span></p>`;
        }
    
    });
    // On affiche le tout à l'écran
    cartDetails.innerHTML = htmlContent;
    totalPriceEl.textContent = total;

    // Astuce : À chaque fois qu'on change un prix, on revérifie aussi si les boutons doivent être grisés
    checkAllInputsValid();
}

// mode solo ou equipe

function switchMode(mode) {
    currentMode = mode; // On met à jour la variable globale (la mémoire)
    container.innerHTML = ''; // On vide tout l'écran (reset)
    participantsCount = 0; // On remet les compteurs à zéro
    // je regarde le mode choisit 
    if (mode === 'solo') {
        // Mode Solo : On force l'ajout de 1 personne.
        // On cache le bouton "Ajouter" (car solo = 1 personne max)
        addParticipant(true);
        // désactiver le btn ajouter car mode solo
        btnAdd.style.display = 'none';

    } else if (mode === 'team') {
        // mode équipe  on FORCE l'ajout des deux premier
        // Le "true" dit à la fonction = "T'inquiète c'est vide c'est normal, ajoute quand même"
        addParticipant(true); 
        addParticipant(true); 
        // On affiche le bouton pour en ajouter d'autres.
        btnAdd.style.display = 'block';
    }
    // On met à jour le panier (90€ ou 180€ direct)
    updateCart();
}

// ecouteur d'evenement 

// 1. Quand on clique sur le bouton "+", on lance addParticipant
btnAdd.addEventListener('click', addParticipant);


// 2. DÉLÉGATION D'ÉVÉNEMENT
// On écoute "input" sur le container GLOBAL.
// Pourquoi ? Parce que les champs input n'existent pas encore au début !
// Si on écoutait directement les inputs, ça ne marcherait pas pour les nouveaux ajoutés.
container.addEventListener('input', (e) => {
    // Si l'élément qui a déclenché l'événement a la classe 'input-check'
    if (e.target.classList.contains('input-check')) {
        validateInput(e.target); // On le valide
        checkAllInputsValid(); // On vérifie tout le formulaire
    }
});


// INITIALISATION
// On enlève le "addParticipant()" qui était ici, car switchMode le fait déjà !
// On lance le mode solo par défaut au chargement de la page.
addParticipant();

btnAdd.disabled = false;

switchMode('solo');