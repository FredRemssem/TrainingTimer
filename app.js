let currentMode = null;

import * as IntervalMode from './mode-interval.js';
import * as CircuitMode from './mode-circuit.js';

// ===========================================
// FONCTIONS GLOBALES (MENU & NAVIGATION)
// ===========================================

// EXPOSÉE à WINDOW pour onclick="selectMode(...)"
window.selectMode = function(mode) {
    currentMode = mode;    
    document.getElementById('title-bar')?.classList.add('hidden');
    document.getElementById('mode-selection')?.classList.add('hidden');
    if (mode === 'interval') {
        document.getElementById('setup')?.classList.remove('hidden');
    } else if (mode === 'circuit') {
        document.getElementById('setup-circuit')?.classList.remove('hidden');
    }
};

// EXPOSÉE à WINDOW pour onclick="goBack()"
window.goBack = function() {
    IntervalMode.resetTimer(); 
    document.getElementById('setup')?.classList.add('hidden');
    document.getElementById('setup-circuit')?.classList.add('hidden');    
    document.getElementById('title-bar')?.classList.remove('hidden'); 
    document.getElementById('mode-selection')?.classList.remove('hidden');
    currentMode = null;
}

// ===========================================
// FONCTION GENERIQUES
//  - Modification des inputs de type number avec boutons + / -
// ===========================================

// EXPOSÉE à WINDOW pour onclick="changeValue(...)"
window.changeValue = function(id, delta) {
    const input = document.getElementById(id);
    let currentValue = parseInt(input.value) || 0; 
    let newValue = currentValue + delta;
    
    if (newValue >= 1) {
        input.value = newValue;
    } else {
        input.value = 1; 
    }
}

// EXPOSÉE à WINDOW pour onclick="changeTime(...)"
window.changeTime = function(mode, unit, delta) {
    const input = document.getElementById(`${mode}-${unit}`);
    let currentValue = parseInt(input.value) || 0;
    let newValue = currentValue + delta;
    if (unit === 'sec') {
        // Logique pour les secondes : boucle entre 0 et 59
        if (newValue > 59) {
            newValue = 0;
            // On incrémente la minute si on passe de 59 à 60
            if (delta > 0) changeTime(mode, 'min', 1);
        } else if (newValue < 0) {
            newValue = 55; // On va à 55s si on décrémente en dessous de 0
            // On décrémente la minute si on passe de 0 à -1
            if (delta < 0) changeTime(mode, 'min', -1);
        }
    } else if (unit === 'min') {
        // Logique pour les minutes : ne descend pas sous zéro
        if (newValue < 0) {
            newValue = 0;
        }
    }
    // Met à jour l'affichage en ajoutant un zéro si nécessaire (padStart)
    input.value = String(newValue).padStart(2, '0');
}

// ===========================================
// EXPOSITION DES FONCTIONS DU MODE INTERVALLE AU HTML
// ===========================================
// Ces lignes exposent les fonctions du module au DOM global
window.startTimer = IntervalMode.startTimer;
window.resetTimer = IntervalMode.resetTimer;

// ===========================================
// EXPOSITION DES FONCTIONS DU MODE CIRCUIT AU HTML
// ===========================================
// Ces lignes exposent les fonctions du module au DOM global


// =================================================
// Enregistrement du Service Worker
// =================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('SW enregistré avec succès: ', registration);
      })
      .catch(error => {
        console.log('Échec de l\'enregistrement du SW: ', error);
      });
  });
}