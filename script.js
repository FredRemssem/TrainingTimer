let timer;              // Pour stocker l'ID de l'intervalle
let remainingTime;      // Temps restant actuel
let currentRound = 1;   // Round actuel
let isWorking = true;   // Booléen : true = travail, false = repos
let totalRoundsInput, workTimeInput, restTimeInput; // Variables de config

function startTimer() {
    // 1. Récupérer les valeurs (comme un std::cin)
    totalRoundsInput = parseInt(document.getElementById('rounds').value);
    workTimeInput = parseInt(document.getElementById('work').value);
    restTimeInput = parseInt(document.getElementById('rest').value);

    // 2. Masquer la config, afficher le timer
    document.getElementById('setup').classList.add('hidden');
    document.getElementById('timer-display').classList.remove('hidden');
    
    // 3. Initialiser
    document.getElementById('total-rounds').innerText = totalRoundsInput;
    currentRound = 1;
    isWorking = true;
    
    startRound();
}

function startRound() {
    // Définir le temps et la couleur selon le mode
    if (isWorking) {
        remainingTime = workTimeInput;
        document.getElementById('status').innerText = "TRAVAIL";
        document.getElementById('status').className = "work-mode";
    } else {
        remainingTime = restTimeInput;
        document.getElementById('status').innerText = "REPOS";
        document.getElementById('status').className = "rest-mode";
    }

    document.getElementById('current-round').innerText = currentRound;
    updateDisplay();

    // Lancer la boucle (équivalent d'un while loop avec délai)
    // setInterval exécute le code toutes les 1000ms (1 seconde)
    timer = setInterval(() => {
        remainingTime--;
        updateDisplay();

        if (remainingTime < 0) {
            clearInterval(timer); // Stop le timer actuel
            handlePhaseEnd();     // Gérer la fin de phase
        }
    }, 1000);
}

function handlePhaseEnd() {
    // Logique de changement d'état
    if (isWorking) {
        isWorking = false; // On passe au repos
        // Si c'était le dernier round et qu'on a fini le travail, c'est fini ?
        // Souvent on veut un repos après le dernier round, sinon :
        if (currentRound > totalRoundsInput) {
            finish();
            return;
        }
        startRound();
    } else {
        isWorking = true; // On repasse au travail
        currentRound++;
        
        if (currentRound > totalRoundsInput) {
            finish();
        } else {
            startRound();
        }
    }
}

function updateDisplay() {
    document.getElementById('time-left').innerText = remainingTime >= 0 ? remainingTime : 0;
}

function finish() {
    document.getElementById('status').innerText = "TERMINÉ !";
    document.getElementById('status').className = "";
    document.getElementById('time-left').innerText = "Bravo";
}

function resetTimer() {
    clearInterval(timer);
    document.getElementById('setup').classList.remove('hidden');
    document.getElementById('timer-display').classList.add('hidden');
}