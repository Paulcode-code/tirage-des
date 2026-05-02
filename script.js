const resultat = document.getElementById("resultat");
const modeSelect = document.getElementById("mode");
const btnTirer = document.getElementById("btn-tirer");
const btnProbas = document.getElementById("btn-probas");
const btnReset = document.getElementById("btn-reset");
const boutonsSecondaires = document.getElementById("boutons-secondaires");
const zoneProbas = document.getElementById("probas");

const probaBase = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 6,
  8: 5,
  9: 4,
  10: 3,
  11: 2,
  12: 1
};

let proba = {};
let compteur = {};
let paquet = [];
const forceBaisse = 0.6;
let probasOuvertes = false;

function resetCompteur() {
  compteur = {};
  for (let n = 2; n <= 12; n++) {
    compteur[n] = 0;
  }
}

function resetMode3() {
  proba = { ...probaBase };
  resetCompteur();
  actualiserProbasSiOuvertes();
}

function resetPaquet() {
  paquet = [];

  let i = 1;
  for (let n = 2; n <= 12; n++) {
    for (let k = 0; k < i; k++) {
      paquet.push(n);
    }

    if (n < 7) {
      i++;
    } else {
      i--;
    }
  }

  melanger(paquet);
}

function melanger(liste) {
  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
}

function tirerMode1() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return d1 + d2;
}

function tirerMode2() {
  if (paquet.length === 0) {
    resetPaquet();
  }

  return paquet.shift();
}

function tirerMode3() {
  const nombres = Object.keys(proba).map(Number);
  const total = nombres.reduce((somme, n) => somme + proba[n], 0);

  let r = Math.random() * total;
  let tirage = nombres[0];

  for (const n of nombres) {
    r -= proba[n];

    if (r <= 0) {
      tirage = n;
      break;
    }
  }

  compteur[tirage]++;

  const perte = proba[tirage] * forceBaisse;
  proba[tirage] -= perte;

  const totalBaseAutres = nombres
    .filter(n => n !== tirage)
    .reduce((somme, n) => somme + probaBase[n], 0);

  for (const n of nombres) {
    if (n !== tirage) {
      const part = probaBase[n] / totalBaseAutres;
      proba[n] += perte * part;
    }
  }

  return tirage;
}

function tirer() {
  const mode = modeSelect.value;
  let tirage;

  if (mode === "1") {
    tirage = tirerMode1();
  } else if (mode === "2") {
    tirage = tirerMode2();
  } else {
    tirage = tirerMode3();
  }

  resultat.textContent = "Tirage : " + tirage;
  actualiserProbasSiOuvertes();
}

function construireProbas() {
  const total = Object.values(proba).reduce((somme, valeur) => somme + valeur, 0);

  let html = `
    <h2>Probabilités actuelles</h2>
    <div class="ligne-proba entete-proba">
      <span>Nombre</span>
      <span>Probabilité</span>
      <span>Tombé</span>
    </div>
  `;

  for (let n = 2; n <= 12; n++) {
    const pourcentage = (proba[n] / total) * 100;

    html += `
      <div class="ligne-proba">
        <span>${n}</span>
        <span>${pourcentage.toFixed(2)} %</span>
        <span>${compteur[n]} fois</span>
      </div>
    `;
  }

  zoneProbas.innerHTML = html;
}

function afficherOuFermerProbas() {
  probasOuvertes = !probasOuvertes;

  if (probasOuvertes) {
    construireProbas();
    zoneProbas.style.display = "block";
    btnProbas.textContent = "Fermer les probabilités";
  } else {
    zoneProbas.style.display = "none";
    btnProbas.textContent = "Voir les probabilités";
  }
}

function actualiserProbasSiOuvertes() {
  if (probasOuvertes) {
    construireProbas();
  }
}

function reset() {
  const mode = modeSelect.value;

  if (mode === "2") {
    resetPaquet();
    resultat.textContent = "Paquet reset";
  }

  if (mode === "3") {
    resetMode3();
    resultat.textContent = "Probabilités reset";
  }
}

function fermerProbas() {
  probasOuvertes = false;
  zoneProbas.style.display = "none";
  btnProbas.textContent = "Voir les probabilités";
}

function mettreAJourBoutons() {
  const mode = modeSelect.value;

  fermerProbas();

  if (mode === "1") {
    btnProbas.style.display = "none";
    btnReset.style.display = "none";
    boutonsSecondaires.style.display = "none";
    resultat.textContent = "Mode 1 : vrais dés";
  } else if (mode === "2") {
    btnProbas.style.display = "none";
    btnReset.style.display = "block";
    boutonsSecondaires.style.display = "flex";
    resultat.textContent = "Mode 2 : paquet de 36";
  } else {
    btnProbas.style.display = "block";
    btnReset.style.display = "block";
    boutonsSecondaires.style.display = "flex";
    resultat.textContent = "Mode 3 : probas rééquilibrées";
  }
}

btnTirer.addEventListener("click", tirer);
btnProbas.addEventListener("click", afficherOuFermerProbas);
btnReset.addEventListener("click", reset);

modeSelect.addEventListener("change", () => {
  mettreAJourBoutons();
});

resetPaquet();
resetMode3();
mettreAJourBoutons();
