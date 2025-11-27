// mode-circuit.js
import { makeSound, formatTime } from './utils.js';

// Liste des exercices prédéfinis pour la sélection
const AVAILABLE_EXERCISES = [
    "Pompes",
    "Squats",
    "Fentes",
    "Tractions",
    "Dips",
    "Burpees",
    "Levé de jambes",
    "Gainage (Secondes)" // Optionnel, si l'utilisateur veut quand même du temps
];

// Variables d'état pour la configuration
let exerciseCounter = 0;
let isCircuitInitialized = false;

// Variables d'état pour l'exécution
let circuitExercises = []; // Liste des objets exercices (ne contient plus de 'rest')
let currentExerciseIndex = 0;
let currentSet = 1;
let totalSets = 1;
let isResting = false; // true = repos, false = en train de faire des reps
let circuitTimer = null; // Pour le décompte du repos
let remainingRestTime = 0;

/**
 * Initialise l'interface avec 3 exercices par défaut.
 */
export function initializeCircuitSetup() {
    if (!isCircuitInitialized) {
        const list = document.getElementById('exercise-list');
        if (list) list.innerHTML = '';

        // Ajout avec Répétitions (reps) - Le temps de repos est maintenant GÉRÉ GLOBALEMENT
        addExercise("Pompes", 15);
        addExercise("Squats", 20);
        addExercise("Tractions", 10);
        
        isCircuitInitialized = true;
    }
}

/**
 * Génère les options HTML pour la liste déroulante.
 * @param {string} selectedName - Le nom de l'exercice à sélectionner par défaut.
 * @returns {string} Le HTML des options.
 */
function getExerciseOptions(selectedName) {
    let optionsHtml = '';
    AVAILABLE_EXERCISES.forEach(name => {
        const isSelected = name === selectedName ? 'selected' : '';
        optionsHtml += `<option value="${name}" ${isSelected}>${name}</option>`;
    });
    return optionsHtml;
}

/**
 * Ajoute un bloc d'exercice dans la liste HTML.
 * @param {string} name - Nom par défaut
 * @param {number} reps - Nombre de répétitions
 * @param {number} restTime - ANCIEN PARAMÈTRE: Retiré car le repos est global
 */
export function addExercise(name = AVAILABLE_EXERCISES[0], reps = 10) {
    exerciseCounter++;
    
    const listContainer = document.getElementById('exercise-list');
    if (!listContainer) return;
    
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = "exercise-block"; 
    exerciseDiv.id = `exercise-${exerciseCounter}`;
    
    // HTML mis à jour : 
    // 1. Suppression du h4 (numéro d'exercice)
    // 2. Suppression de toute la section Repos
    exerciseDiv.innerHTML = `
        <div class="exercise-header simplified">
            <select id="name-${exerciseCounter}" class="exercise-select">
                ${getExerciseOptions(name)}
            </select>
            <button type="button" onclick="removeExercise(${exerciseCounter})" class="remove-btn compact">&times;</button>
        </div>
        
        <div class="exercise-controls simplified">
            <!-- Contrôle des Répétitions (Reps) -->
            <label> Répétions :</label>
            <div class="control stepper-single compact-stepper">
                <button type="button" onclick="changeExerciseData(${exerciseCounter}, 'reps', -1)">-</button>
                <input type="number" id="reps-${exerciseCounter}" value="${reps}" min="1">
                <button type="button" onclick="changeExerciseData(${exerciseCounter}, 'reps', 1)">+</button>
            </div>
            
            <!-- La section Repos a été supprimée d'ici -->
        </div>
    `;
    
    listContainer.appendChild(exerciseDiv);
}

export function removeExercise(index) {
    const element = document.getElementById(`exercise-${index}`);
    if (element) element.remove();
}

/**
 * Modifie les données d'un exercice (Uniquement Reps maintenant).
 */
export function changeExerciseData(index, type, delta) {
    // type est forcément 'reps' désormais
    const inputId = `reps-${index}`;
    const input = document.getElementById(inputId);
    if (!input) return;

    let val = parseInt(input.value) || 0;
    val += delta;

    // Limite : min 1 pour reps
    const min = 1;
    if (val < min) val = min;

    input.value = val;
}

export function resetCircuitSetup() {
    const list = document.getElementById('exercise-list');
    if (list) list.innerHTML = '';
    exerciseCounter = 0;
    resetTimer();
}

// ========================================================
// LOGIQUE D'EXÉCUTION DU CIRCUIT (Mise à jour pour Repos global)
// ========================================================

export function startCircuitTimer() {
    // 1. Récupération de la configuration
    totalSets = parseInt(document.getElementById('sets').value) || 1;
    const breakMin = parseInt(document.getElementById('break-min').value) || 0;
    const breakSec = parseInt(document.getElementById('break-sec').value) || 0;
    const breakTime = breakMin * 60 + breakSec;

    // 2. Construction de la liste d'exercices
    circuitExercises = [];
    const blocks = document.getElementById('exercise-list').children;
    
    if (blocks.length === 0) {
        console.error("Erreur: Ajoutez au moins un exercice !");
        return;
    }

    for (let block of blocks) {
        const idNum = block.id.split('-')[1];
        const name = document.getElementById(`name-${idNum}`).value || `Exercice ${idNum}`;
        const reps = parseInt(document.getElementById(`reps-${idNum}`).value) || 10;
        
        // IMPORTANT: Plus de champ 'rest' à récupérer
        circuitExercises.push({ name, reps }); 
    }

    // Le temps de pause global entre les séries
    window.circuitBreakTime = breakTime;

    // 3. Initialisation de l'affichage
    document.getElementById('setup-circuit').classList.add('hidden');
    document.getElementById('timer-display').classList.remove('hidden');
    
    currentSet = 1;
    currentExerciseIndex = 0;
    
    startExercisePhase();
}

function startExercisePhase() {
    isResting = false;
    const ex = circuitExercises[currentExerciseIndex];
    
    // Mise à jour de l'affichage pour l'exercice
    document.getElementById('status').innerText = ex.name.toUpperCase();
    document.getElementById('status').className = "work-mode"; // Vert
    
    // Affichage des répétitions à la place du temps
    document.getElementById('time-left').innerText = `${ex.reps} Reps`;
    document.getElementById('time-left').style.fontSize = "4rem"; // Un peu plus petit pour le texte
    
    document.getElementById('current-round').innerText = `Ex: ${currentExerciseIndex + 1}/${circuitExercises.length} - Série: ${currentSet}/${totalSets}`;

    // Gestion du bouton "Suivant / Fait"
    let nextBtn = document.getElementById('btn-circuit-next');
    if (!nextBtn) {
        nextBtn = document.createElement('button');
        nextBtn.id = 'btn-circuit-next';
        nextBtn.innerText = "Exercice Terminé >";
        nextBtn.className = "btn-next-exercise";
        nextBtn.onclick = completeExercise;
        document.getElementById('time-left').after(nextBtn);
    }
    nextBtn.style.display = "block";
    nextBtn.innerText = `Valider ${ex.reps} Reps`;
}

function completeExercise() {
    // L'utilisateur a cliqué sur "Fait"
    makeSound(880, 200); // Bip de validation
    
    // Masquer le bouton suivant
    const nextBtn = document.getElementById('btn-circuit-next');
    if (nextBtn) nextBtn.style.display = "none";

    // On passe directement à l'étape suivante, car il n'y a plus de repos individuel
    nextStep();
}

/**
 * Démarre le repos de fin de série (Utilisé uniquement pour le repos global)
 * @param {number} duration - Temps de repos en secondes
 * @param {boolean} isSetBreak - Toujours true dans cette version simplifiée
 */
function startRestPhase(duration, isSetBreak) {
    isResting = true;
    remainingRestTime = duration;
    
    document.getElementById('status').innerText = "REPOS SÉRIE";
    document.getElementById('status').className = "rest-mode"; // Rouge
    
    document.getElementById('time-left').innerText = formatTime(remainingRestTime);
    document.getElementById('time-left').style.fontSize = "5rem"; // Taille normale pour le temps
    
    updateRestDisplay(); 

    // Lancer le décompte
    circuitTimer = setInterval(() => {
        remainingRestTime--;
        updateRestDisplay();
        
        if (remainingRestTime <= 3 && remainingRestTime > 0) {
            makeSound(660, 150);
        }

        if (remainingRestTime <= 0) {
            clearInterval(circuitTimer);
            makeSound(440, 300);
            currentExerciseIndex = -1;
            nextStep(); // Cette fois, nextStep va lancer l'exercice suivant (Ex1 de la prochaine série)
        }
    }, 1000);
}

function updateRestDisplay() {
    document.getElementById('time-left').innerText = formatTime(remainingRestTime);
}

function nextStep() {
    // Incrémente l'index de l'exercice
    currentExerciseIndex++;

    // Si on a fini tous les exercices de la série
    if (currentExerciseIndex >= circuitExercises.length) {
        // Fin de la série
        if (currentSet < totalSets) {
            // On lance le repos de fin de série
            currentSet++;
            currentExerciseIndex = 0; // Reset pour la prochaine série
            
            if (window.circuitBreakTime > 0) {
                // Démarre la phase de repos entre les séries
                startRestPhase(window.circuitBreakTime, true);
            } else {
                // Pas de repos, on enchaîne directement avec la série suivante
                startExercisePhase();
            }
        } else {
            // C'est vraiment fini
            finishCircuit();
        }
    } else {
        // Exercice suivant dans la même série
        startExercisePhase();
    }
}

function finishCircuit() {
    document.getElementById('status').innerText = "CIRCUIT TERMINÉ !";
    document.getElementById('status').className = "finish-mode";
    document.getElementById('time-left').innerText = "Bravo";
    document.getElementById('time-left').style.fontSize = "5rem";
    makeSound(1000, 800);
    
    const nextBtn = document.getElementById('btn-circuit-next');
    if (nextBtn) nextBtn.style.display = "none";
}

export function resetTimer() {
    if (circuitTimer) clearInterval(circuitTimer);
    const nextBtn = document.getElementById('btn-circuit-next');
    if (nextBtn) nextBtn.remove();
    
    document.getElementById('timer-display').classList.add('hidden');
}