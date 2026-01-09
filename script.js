// Config
// Les Constantes : Ce sont des valeurs qui ne changeront JAMAIS
const PRICE_SEMI = 90;
const PRICE_FULL = 130;
const themeBtn=document.getElementById("theme-toggle");

// Compteur participants 
// participantsCount : Sert à donner un ID unique (1, 2, 3...) à chaque personne
let participantsCount = 0;
// currentMode : Se souvient si on est en "solo" ou "team" pour adapter les règles.
let currentMode = 'solo';

// Element DOM
// On va chercher les éléments par leur ID HTML et on les stocke dans des variables
const container = document.getElementById('participants-container');
const btnAdd = document.getElementById('btn-add-participant');
const cartDetails = document.getElementById('cart-details');
const totalPriceEl = document.getElementById('total-price');
const btnCancel = document.querySelector('.btn-cancel');
const btnTop = document.getElementById('btn-back-to-top');



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
        ${showDeleteBtn ? `<button type="button" class="btn-delete" onclick="removeParticipant(${id})">Supprimer</button>` : ''}
        </h3>

        <div class="form-group">
            <label>Nom<span class="stars">*</span></label>
            <div class="input-wrapper">
                <input type="text" name="lastName_${id}" class="input-check" required>
                <span class="status-icon"></span>
            </div>
        </div>

        <div class="form-group">
            <label>Prénom<span class="stars">*</span></label>
            <div class="input-wrapper">
                <input type="text" name="firstName_${id}" class="input-check" required>
                <span class="status-icon"></span>
            </div>
        </div>

        <div class="form-group">
            <label>Age<span class="stars">*</span></label>
            <div class="input-wrapper">
                <input type="number" name="age_${id}" class="input-check" min="18" max="99" required>
                <span class="status-icon"></span>
            </div>
        </div>

        <div class="form-group">
            <label>Email<span class="stars">*</span></label>
            <div class="input-wrapper">
                <input type="email" name="email_${id}" class="input-check" required placeholder="nom@mail.com">
                <span class="status-icon"></span>
            </div>
        </div>

        <div class="form-group">
            <label>Téléphone<span class="stars">*</span></label>
            <div class="input-wrapper">
                <input type="tel" name="phone_${id}" class="input-check" required placeholder="0600000000">
                <span class="status-icon"></span>
            </div>
        </div>
        
        <p>(<span class="stars">*</span>) Ces champs sont obligatoires</p>
        <div class="radio-group">
            <p>Type de course :</p>
            <input id="radio-semi-${id}" type="radio" class="input-race" name="race_${id}" value="semi" onchange="updateCart()"> 
            <label for="radio-semi-${id}">Semi-Marathon (${PRICE_SEMI}€)</label><br>
            
            <input id="radio-full-${id}" type="radio" class="input-race" name="race_${id}" value="full" onchange="updateCart()"> 
            <label for="radio-full-${id}">Marathon Complet (${PRICE_FULL}€)</label>
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
window.removeParticipant = function (id) {
    // On cherche la carte précise grâce à son ID unique
    const card = document.getElementById(`card-${id}`);
    if (card) {
        card.remove(); // On la supprime du DOM
        updateCart(); // calcul du prix après suppression 
    }

};

function validateInput(input) {
    const value = input.value; // Ce que l'utilisateur a écrit
    const name = input.name;
    let isValid = false;

    // Les Regex (Expressions Régulières) : Des motifs pour vérifier les formats.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Vérifie forme a@b.c
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/; // Vérifie numéros français

    if (value.trim() === "") {
        input.classList.remove('valid');
        input.classList.remove('invalid');
        return false;
    }


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
        // C'est BON -> VERT
        input.classList.remove('invalid');
        input.classList.add('valid');
    } else {
        // C'est FAUX -> ROUGE
        input.classList.remove('valid');
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
                firstNameInput.classList.remove('valid');
                firstNameInput.classList.add('invalid');

                lastNameInput.classList.remove('valid');
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

    const cards = document.querySelectorAll('.participant-card');
    cards.forEach(function(card) {
        const id = card.getAttribute('data-id');
        //Est ce qu'il y'a une course coché pour ce participant ?
        const raceChecked = card.querySelector(`input[name="race_${id}"]:checked`);

        // Si non, le formulaire n'est pas valide
        if (!raceChecked) {
            allValid = false;
        }
    });

    // activer ou désactiver btn ajouter
    btnAdd.disabled = !allValid;

    return allValid;
}


// GESTION DU PANIER  

function updateCart() {
    let total = 0;
    let htmlContent = "";

    const cards = document.querySelectorAll('.participant-card');

    cards.forEach((card, index) => {
        // on recup quel radio es coché dans cette carte
        const id = card.getAttribute('data-id');
        //On récupère les noms
        const lastNameInput = card.querySelector(`input[name="lastName_${id}"]`);
        const firstNameInput = card.querySelector(`input[name="firstName_${id}"]`);
        //On récupère le type de course
        const raceInput = card.querySelector(`input[name="race_${id}"]:checked`);
        // Sécurité : on ne calcule que si un bouton est bien coché
        if (raceInput) {
            const raceType = raceInput.value;
            let price = 0;
            let raceName = "";
            
            if (raceType === 'semi') {
                price = PRICE_SEMI;
                raceName = "semi";
            } else {
                price = PRICE_FULL;
                raceName = "Marathon";
            }
            
            total += price; // On ajoute au total


            let displayName = "Participant " + (index+1);

            if (lastNameInput.value.trim() !== "" || firstNameInput.value.trim() !== "") {
                displayName = lastNameInput.value.toUpperCase() + " " + firstNameInput.value;
            }

            // On ajoute une ligne au résumé HTML
            htmlContent += `<p><strong>${displayName}</strong> (${raceName}) <span>${price}€</span></p>`;
        }

    });
    // On affiche le tout à l'écran
    cartDetails.innerHTML = htmlContent;
    totalPriceEl.textContent = total;

    // Astuce : À chaque fois qu'on change un prix, on revérifie aussi si les boutons doivent être grisés
    checkAllInputsValid();
}

// MODE SOLO OU EQUIPE

function switchMode(mode) {

    const savedData = getParticipantOneData();

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

    // restauration : Maintenant que les formulaires sont recréés, on remet les infos
    restoreParticipantOneData(savedData);

    // On met à jour le panier (90€ ou 180€ direct)
    updateCart();
    checkAllInputsValid();
}

// Fonctions de sauvegarde de données du form solo
// Fonction pour lire les données du participant 1 
function getParticipantOneData () {
    // Si le formulaire n'existe pas encore (au tout début), on ne renvoie rien
    const lastNameInput = document.querySelector('input[name="lastName_1"]');
    if (!lastNameInput) return null;

    const raceInput = document.querySelector('input[name="race_1"]:checked');
    const raceValue= raceInput ? raceInput.value : null;
    
    // On retourne un objet ( une boîte) avec toutes les valeurs
    return {
        lastName: lastNameInput.value,
        firstName: document.querySelector('input[name="firstName_1"]').value,
        age: document.querySelector('input[name="age_1"]').value,
        email: document.querySelector('input[name="email_1"]').value,
        phone: document.querySelector('input[name="phone_1"]').value,
        // Pour les radios, on recup celui qui es coché
        race: raceValue
    };
}

// Fonction pour "Ré-écrire" les données dans le Participant 1

function restoreParticipantOneData(data) {
    if (!data) return; // Si il y'avait rien à sauvegarder, on s'arrête
    
    // Sinon
    // On remplit les champs de texte
    const inputs = [
        { name: 'lastName_1', value: data.lastName },
        { name: 'firstName_1', value: data.firstName },
        { name: 'age_1', value: data.age },
        { name: 'email_1', value: data.email },
        { name: 'phone_1', value: data.phone }
    ];

    inputs.forEach(item => {
        const input = document.querySelector(`input[name="${item.name}"]`);
        if (input) {
            input.value = item.value;
            validateInput(input);
        }

    });

    // On recoche le bon bouton radio ( course )
    if (data.race){
        const raceRadio = document.querySelector(`input[name="race_1"][value="${data.race}"]`);
        if (raceRadio) {
        raceRadio.checked = true;
        }
    }
}


// MODE JOUR / NUIT

function toggleMode () {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")){
        themeBtn.textContent="☀️";
    }
    else {themeBtn.textContent="🌙";}
}



// ECOUTEUR D'EVENEMENTS ( LISTENER ) 

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
        updateCart(); // on met à jour le panier
    }
});


// BOUTONS 

if (btnCancel) {
    btnCancel.addEventListener('click', function() {

        let confirmReset = confirm("Êtes-vous sûr de vouloir tout effacer ?")
        if (!confirmReset) return;
        // Si on est en équipe, on doit supprimer les participants en trop (3, 4, 5 ... )
        // pour garder les 2 obligatoires
        if (currentMode === 'team') {
            const allCards = document.querySelectorAll('.participant-card');
            // Boucle "pour chaque carte dans la liste"
            for (const card of allCards) {
                // on lit l'id (ex 3 ) et on le transforme en chiffre
                let id = parseInt(card.getAttribute('data-id'));

                // Si c'est le participant 3 ou plus...
                if (id > 2) {
                    card.remove();//...on le supprime
                }
            }

            // IMPORTANT : On remet le compteur à 2.
            // Sinon le compteur continue de s'incrémenter 
            participantsCount = 2;

        }

        // Nettoyage des champs ( ceux qui restent)
        const remainingInputs = document.querySelectorAll('.input-check');

        for (const input of remainingInputs) {
            input.value = ""; // on vide le texte
            input.classList.remove('valid');
            input.classList.remove('invalid');
        }


        // Nettoyage des boutons
        const allRaceRadios = document.querySelectorAll('.input-race');

        for (const radio of allRaceRadios) {
            radio.checked = false; // on décoche tout 
        }

        // Reset du capitaine
        //on cherche le bouton radio qui a le name="captain" ET la value="1"
        const captainOne = document.querySelector('input[name="captain"][value="1"]');
        if (captainOne) {
            captainOne.checked = true; // on force le cochage sur le premier
        }

        updateCart();
        checkAllInputsValid();


    });
}

if (btnTop) {

    // GEstion de l'apparition
    //on doit écouter le défilement de la fenêtre " window "
    window.addEventListener('scroll', function() {
        // window.scrollY = Nombre de pixel qu'on a descendu
        if (window.scrollY > 300) {
            // Si on a descendu de plus de 300px, on montre le bouton
            btnTop.classList.add('visible');
        } else {
            // sinon on le cache
            btnTop.classList.remove('visible');
        }
    });

    // Geestion du clique
    btnTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });
}


// INITIALISATION
// On lance le mode solo par défaut au chargement de la page.

btnAdd.disabled = false;

switchMode('solo');

themeBtn.addEventListener('click',toggleMode);