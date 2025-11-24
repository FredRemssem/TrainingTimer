let timer;
let remainingTime;
let currentRound = 1;
let isWorking = true;
let totalRoundsInput, workTimeInput, restTimeInput;

// =================================================================
// 🎶 Fonction pour générer un bip sonore 🎶
// =================================================================
function makeSound(frequency, duration) {
    // Crée un contexte audio (le moteur de son)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Crée un oscillateur (la source du son)
    const oscillator = audioContext.createOscillator();
    // Crée un gain (le volume)
    const gainNode = audioContext.createGain();

    // Connecte l'oscillateur au gain, et le gain à la sortie audio
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configuration du son
    oscillator.type = 'sine'; // type d'onde : sinusoïdale
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); // fréquence en Hertz
    
    // Démarre l'oscillateur immédiatement
    oscillator.start();

    // Arrête l'oscillateur après la durée spécifiée
    setTimeout(() => {
        oscillator.stop();
    }, duration);
}

// =================================================================
// Démarrage et gestion du "Get Ready"
// =================================================================

function startTimer() {
    // 1. Récupérer les valeurs
    totalRoundsInput = parseInt(document.getElementById('rounds').value);
    workTimeInput = parseInt(document.getElementById('work').value);
    restTimeInput = parseInt(document.getElementById('rest').value);

    // 2. Masquer la config, afficher le timer
    document.getElementById('setup').classList.add('hidden');
    document.getElementById('timer-display').classList.remove('hidden');
    
    // 3. Initialiser pour le compte à rebours initial
    document.getElementById('total-rounds').innerText = totalRoundsInput;
    currentRound = 1;
    isWorking = true;
    
    // Lancement du compte à rebours initial
    startCountdown(3); 
}

function startCountdown(duration) {
    let countdown = duration;
    
    document.getElementById('status').innerText = "PRÉPAREZ-VOUS !";
    document.getElementById('status').className = "get-ready-mode"; // On pourrait ajouter ce style en CSS
    document.getElementById('current-round').innerText = currentRound;
    
    const countdownTimer = setInterval(() => {
        document.getElementById('time-left').innerText = countdown;
        makeSound(440, 100); // Bip à 440 Hz (La)

        if (countdown <= 0) {
            clearInterval(countdownTimer);
            startRound();
        }
        
        countdown--;
    }, 1000);
}


// =================================================================
// Logique des Rounds
// =================================================================

function startRound() {
    // Définir le temps et la couleur selon le mode
    if (isWorking) {
        remainingTime = workTimeInput;
        document.getElementById('status').innerText = "TRAVAIL";
        document.getElementById('status').className = "work-mode";
    } else {
        // Le premier repos est après le premier round, donc on incrémente l'affichage du round avant le repos.
        document.getElementById('current-round').innerText = currentRound - 1; 

        remainingTime = restTimeInput;
        document.getElementById('status').innerText = "REPOS";
        document.getElementById('status').className = "rest-mode";
    }

    document.getElementById('current-round').innerText = currentRound;
    updateDisplay();

    // Lancer la boucle du minuteur
    timer = setInterval(() => {
        remainingTime--;
        updateDisplay();
        
        // Bip pour les 3 dernières secondes
        if (remainingTime <= 3 && remainingTime > 0) {
            makeSound(660, 150); // Bip plus aigu
        }
        
        // Bip pour la fin de la phase
        if (remainingTime === 0) {
            makeSound(880, 500); // Bip fort et long
        }

        if (remainingTime < 0) {
            clearInterval(timer);
            handlePhaseEnd();
        }
    }, 1000);
}

function handlePhaseEnd() {
    if (isWorking) {
        // Fin de la phase de travail. On regarde s'il reste des rounds.
        if (currentRound < totalRoundsInput) {
            isWorking = false; // On passe au repos
            startRound(); // Compte à rebours avant le repos
        } else {
            finish();
        }
    } else {
        // Fin de la phase de repos. On passe au prochain round.
        currentRound++; 
        isWorking = true; 
        
        if (currentRound <= totalRoundsInput) {
            startCountdown(3); // Compte à rebours avant le travail
        } else {
            finish();
        }
    }
}

function updateDisplay() {
    document.getElementById('time-left').innerText = remainingTime >= 0 ? remainingTime : 0;
    
    // On met à jour l'affichage du round en temps réel (pour la lisibilité)
    document.getElementById('current-round').innerText = currentRound + (isWorking ? '' : ' (Repos)');
    if (currentRound > totalRoundsInput && isWorking) {
         document.getElementById('current-round').innerText = totalRoundsInput + ' / ' + totalRoundsInput;
    }
    
    // Si on est en phase de repos, on affiche le round précédent + Repos.
    if (!isWorking && currentRound > 1) {
        document.getElementById('current-round').innerText = (currentRound - 1) + ' / ' + totalRoundsInput + ' (Repos)';
    }

    if (currentRound > totalRoundsInput) {
         document.getElementById('current-round').innerText = totalRoundsInput + ' / ' + totalRoundsInput;
    }
}

function finish() {
    document.getElementById('status').innerText = "TERMINÉ !";
    document.getElementById('status').className = "finish-mode";
    document.getElementById('time-left').innerText = "Bravo";
    makeSound(2000, 1000); // Bip de fin très aigu et long
}

function resetTimer() {
    clearInterval(timer);
    document.getElementById('setup').classList.remove('hidden');
    document.getElementById('timer-display').classList.add('hidden');
    // Réinitialisation de l'état
    remainingTime = 0;
    currentRound = 1;
    isWorking = true;
    document.getElementById('status').innerText = "PRÊT";
    document.getElementById('status').className = "";
}