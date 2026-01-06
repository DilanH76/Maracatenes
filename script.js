// Config

const PRICE_SEMI = 90;
const PRICE_FULL = 130;

// Compteur participants 

let participantsCount =0;
let currentMode = 'solo';

// Element DOM
const container = document.getElementById('participants-container');
const btnAdd = document.getElementById('btn-add-participant');
const cartDetails = document.getElementById('cart-details');
const totalPriceEl = document.getElementById('total-price');



// Fonction créer formulaire 

function createParticipantHTML(id) {
    // je calcule la condition pour afficher le bouton
    // Si on est en TEAM j'affiche le bouton seulement si l'id est > 2
    // Sinon (SOLO), on affiche le bouton si l'id est > 1
    const showDeleteBtn = (currentMode === 'team') ? (id > 2) : (id > 1);

    return `
    <div class="participant-card" id="card-${id}" data-id="${id}">
    <h3>Participant ${id}
    ${showDeleteBtn ? `<button type="button" class="btn-delete"onclick="removeParticipant(${id})">Supprimer</button>` : ''}
    </h3>

    <div class="form-group">
    <label>Nom*</label>
    <input type="text" name="lastName_${id}" class="input-check" required>
    </div>

    <div class="form-group">
            <label>Prénom *</label>
            <input type="text" name="firstName_${id}" class="input-check" required>
        </div>

        <div class="form-group">
            <label>Age *</label>
            <input type="number" name="age_${id}" class="input-check" min="10" max="99" required>
        </div>

        <div class="form-group">
            <label>Email * (ex: nom@mail.com)</label>
            <input type="email" name="email_${id}" class="input-check" required placeholder="nom@mail.com">
        </div>

        <div class="form-group">
            <label>Téléphone * (10 chiffres)</label>
            <input type="tel" name="phone_${id}" class="input-check" required placeholder="0600000000">
        </div>

        <div class="radio-group">
            <p>Type de course :</p>
            <input type="radio" name="race_${id}" value="semi" checked onchange="updateCart()"> 
            <label>Semi-Marathon (${PRICE_SEMI}€)</label><br>
            
            <input type="radio" name="race_${id}" value="full" onchange="updateCart()"> 
            <label>Marathon Complet (${PRICE_FULL}€)</label>
        </div>

        <div class="radio-group">
            <input type="radio" name="captain" value="${id}" ${id === 1 ? 'checked' : ''}>
            <label>Je suis le capitaine</label>
        </div>
    </div>
    `;

}

// Ajouter un participant 

function addParticipant(force = false) {
    /* Si 'force' n'est pas égal à true donc c'est un clic utilisateur classique,
    alors on fait la verif habituelle*/
    if (force !== true && container.children.length > 0 && !checkAllInputsValid()) {
        alert("Veuillez remplir correctement tous les champs précédents avant d'ajouter un participant.");
        return;
    }

    participantsCount++;
    // div temporaire pour creer le html
    const tempDiv = document.createElement('div');
    // note : on passe true/false au moment de l'appel pas ici
    tempDiv.innerHTML = createParticipantHTML(participantsCount);

    container.appendChild(tempDiv.firstElementChild);

    updateCart();
}

// supprimer un participanrt

window.removeParticipant = function(id) {
    const card = document.getElementById(`card-${id}`);
    if (card) {
        card.remove();
        updateCart(); // calcul du prix après suppression 
    } 

};

function validateInput(input) {
    const value = input.value;
    const name = input.name;
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

    if (input.type === "email") {
        isValid = emailRegex.test(value);
    } else if (input.type === "tel") {
        isValid = phoneRegex.test(value);
    } else if (input.type === "text" || input.type === "number") {
        isValid = value.trim() !== "";
    }

    if (isValid) {
        input.classList.remove('invalid');
    } else {
        input.classList.add('invalid');
    }

    return isValid;

}

// verfier TOUT les inputs pour afficher ou masqué le bouton

function checkAllInputsValid() {
    const allInputs = document.querySelectorAll('.input-check');
    let allValid = true;

    allInputs.forEach(input => {
        if (!validateInput(input)) {
            allValid = false;
        }
    });

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
        
        if(raceInput) {
            const raceType = raceInput.value;
            const price = (raceType === 'semi') ? PRICE_SEMI : PRICE_FULL;
            const raceName = (raceType === 'semi') ? "Semi-Marathon" : "Marathon Complet";
    
            total += price;
            
            htmlContent += `<p>Participant ${index + 1} (${raceName}) <span>${price}€</span></p>`;
        }
    
    });

    cartDetails.innerHTML = htmlContent;
    totalPriceEl.textContent = total;

    checkAllInputsValid();
}

// mode solo ou equipe

function switchMode(mode) {
    currentMode = mode;
    // je vide les conteneurs
    container.innerHTML = '';
    participantsCount = 0; // reset compteur
    // je regarde le mode choisit 
    if (mode === 'solo') {
        // mode Solo  on force l'ajout du 1er (pas besoin de verif car c'est vide)
        addParticipant(true);
        // désactiver le btn ajouter car mode solo
        btnAdd.style.display = 'none';

    } else if (mode === 'team') {
        // mode équipe  on FORCE l'ajout des deux premier
        // Le "true" dit à la fonction = "T'inquiète c'est vide c'est normal, ajoute quand même"
        addParticipant(true); 
        addParticipant(true); 
        
        btnAdd.style.display = 'block';
    }
    // Maj du total
    updateCart();
}

// ecouteur d'evenement 

// btn ajouté 
btnAdd.addEventListener('click', addParticipant);

container.addEventListener('input', (e) => {
    if (e.target.classList.contains('input-check')) {
        validateInput(e.target);
        checkAllInputsValid();
    }
});

addParticipant();

btnAdd.disabled = false;

switchMode('solo');