const resultat = document.getElementById("resultat");
const modeSelect = document.getElementById("mode");
const btnTirer = document.getElementById("btn-tirer");
const btnDetails = document.getElementById("btn-details");
const btnReset = document.getElementById("btn-reset");
const boutonsSecondaires = document.getElementById("boutons-secondaires");
const zoneDetails = document.getElementById("details");
const nbTiragesAffichage = document.getElementById("nb-tirages");

const probaBase = {2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 8:5, 9:4, 10:3, 11:2, 12:1};

let proba = {};
let compteur = {};
let paquet = [];
let nbTirages = 0;
let detailsOuverts = false;

const forceBaisse = 0.6;

function resetCompteur() {
  compteur = {};
  for (let n = 2; n <= 12; n++) compteur[n] = 0;
}

function afficherNbTirages() {
  nbTiragesAffichage.textContent = nbTirages;
}

function resetStats() {
  nbTirages = 0;
  resetCompteur();
  afficherNbTirages();
}

function resetMode3() {
  proba = {...probaBase};
  resetStats();
  actualiserDetailsSiOuverts();
}

function resetPaquet() {
  paquet = [];
  let i = 1;

  for (let n = 2; n <= 12; n++) {
    for (let k = 0; k < i; k++) paquet.push(n);
    if (n < 7) i++;
    else i--;
  }

  melanger(paquet);
}

function resetMode2() {
  resetPaquet();
  resetStats();
  actualiserDetailsSiOuverts();
}

function melanger(liste) {
  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
}

function ajouterTirage(tirage) {
  nbTirages++;
  compteur[tirage]++;
  afficherNbTirages();
}

function tirerMode1() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return d1 + d2;
}

function tirerMode2() {
  if (paquet.length === 0) resetPaquet();
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

  if (mode === "1") tirage = tirerMode1();
  else if (mode === "2") tirage = tirerMode2();
  else tirage = tirerMode3();

  ajouterTirage(tirage);
  resultat.textContent = "Tirage : " + tirage;
  actualiserDetailsSiOuverts();
}

function construireProbasMode3() {
  const total = Object.values(proba).reduce((somme, valeur) => somme + valeur, 0);

  let html = `
    <h2>Probabilités actuelles</h2>
    <div class="petite-info">Chance au prochain tirage + résultats constatés depuis le dernier reset.</div>
    <div class="ligne-proba entete">
      <span>Nombre</span>
      <span>Prochain</span>
      <span>Tombé</span>
      <span>Constaté</span>
    </div>
  `;

  for (let n = 2; n <= 12; n++) {
    const pourcentageProchain = (proba[n] / total) * 100;
    const pourcentageConstate = nbTirages === 0 ? 0 : (compteur[n] / nbTirages) * 100;

    html += `
      <div class="ligne-proba">
        <span>${n}</span>
        <span>${pourcentageProchain.toFixed(2)} %</span>
        <span>${compteur[n]} fois</span>
        <span>${pourcentageConstate.toFixed(2)} %</span>
      </div>
    `;
  }

  zoneDetails.innerHTML = html;
}

function construireSacMode2() {
  const contenu = {};
  for (let n = 2; n <= 12; n++) contenu[n] = 0;
  for (const n of paquet) contenu[n]++;

  let html = `
    <h2>Contenu du sac</h2>
    <div class="petite-info">Il reste ${paquet.length} tirages dans le sac. L'ordre est caché.</div>
    <div class="ligne-sac entete">
      <span>Nombre</span>
      <span>Quantité restante</span>
    </div>
  `;

  for (let n = 2; n <= 12; n++) {
    html += `
      <div class="ligne-sac">
        <span>${n}</span>
        <span>${contenu[n]} fois</span>
      </div>
    `;
  }

  zoneDetails.innerHTML = html;
}

function construireDetails() {
  if (modeSelect.value === "2") construireSacMode2();
  if (modeSelect.value === "3") construireProbasMode3();
}

function afficherOuFermerDetails() {
  detailsOuverts = !detailsOuverts;

  if (detailsOuverts) {
    construireDetails();
    zoneDetails.style.display = "block";
    btnDetails.textContent = modeSelect.value === "2" ? "Fermer le sac" : "Fermer les probabilités";
  } else {
    fermerDetails();
  }
}

function actualiserDetailsSiOuverts() {
  if (detailsOuverts) construireDetails();
}

function reset() {
  const mode = modeSelect.value;

  if (mode === "1") {
    resetStats();
    resultat.textContent = "Mode 1 reset";
  } else if (mode === "2") {
    resetMode2();
    resultat.textContent = "Paquet reset";
  } else {
    resetMode3();
    resultat.textContent = "Probabilités reset";
  }
}

function fermerDetails() {
  detailsOuverts = false;
  zoneDetails.style.display = "none";
  btnDetails.textContent = modeSelect.value === "2" ? "Voir le sac" : "Voir les probabilités";
}

function mettreAJourBoutons() {
  const mode = modeSelect.value;
  fermerDetails();

  if (mode === "1") {
    btnDetails.style.display = "none";
    btnReset.style.display = "block";
    boutonsSecondaires.style.display = "flex";
    resultat.textContent = "Mode 1 : vrais dés";
  } else if (mode === "2") {
    btnDetails.style.display = "block";
    btnReset.style.display = "block";
    boutonsSecondaires.style.display = "flex";
    btnDetails.textContent = "Voir le sac";
    resultat.textContent = "Mode 2 : paquet de 36";
  } else {
    btnDetails.style.display = "block";
    btnReset.style.display = "block";
    boutonsSecondaires.style.display = "flex";
    btnDetails.textContent = "Voir les probabilités";
    resultat.textContent = "Mode 3 : probas rééquilibrées";
  }

  resetStats();
}

btnTirer.addEventListener("click", tirer);
btnDetails.addEventListener("click", afficherOuFermerDetails);
btnReset.addEventListener("click", reset);

modeSelect.addEventListener("change", mettreAJourBoutons);

resetPaquet();
resetMode3();
mettreAJourBoutons();
