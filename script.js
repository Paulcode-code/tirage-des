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

let paquet = [];
let proba = {...probaBase};
const forceBaisse = 0.6;

const resultat = document.getElementById("resultat");
const infos = document.getElementById("infos");

document.getElementById("btnTirer").addEventListener("click", tirer);
document.getElementById("btnProbas").addEventListener("click", afficherProbas);
document.getElementById("btnReset").addEventListener("click", reset);

function modeActuel() {
  return document.querySelector("input[name='mode']:checked").value;
}

function tirer() {
  const mode = modeActuel();

  if (mode === "1") {
    tirerMode1();
  } else if (mode === "2") {
    tirerMode2();
  } else {
    tirerMode3();
  }
}

function tirerMode1() {
  const d1 = entierAleatoire(1, 6);
  const d2 = entierAleatoire(1, 6);
  const somme = d1 + d2;

  resultat.textContent = `Somme : ${somme}`;
  infos.innerHTML = `Dé 1 : ${d1}<br>Dé 2 : ${d2}`;
}

function tirerMode2() {
  if (paquet.length === 0) {
    creerPaquet();
  }

  const somme = paquet.shift();

  resultat.textContent = `Somme : ${somme}`;
  infos.innerHTML = `Il reste ${paquet.length} tirages dans le paquet.`;
}

function tirerMode3() {
  const nombres = Object.keys(proba).map(Number);
  const poids = nombres.map(n => proba[n]);

  const somme = tiragePondere(nombres, poids);

  resultat.textContent = `Somme : ${somme}`;

  const perte = proba[somme] * forceBaisse;
  proba[somme] -= perte;

  let totalBaseAutres = 0;
  for (const n of nombres) {
    if (n !== somme) {
      totalBaseAutres += probaBase[n];
    }
  }

  for (const n of nombres) {
    if (n !== somme) {
      const part = probaBase[n] / totalBaseAutres;
      proba[n] += perte * part;
    }
  }

  infos.innerHTML = "Les probabilités ont été rééquilibrées.";
}

function afficherProbas() {
  const mode = modeActuel();

  if (mode === "1") {
    afficherProbasFixes("Mode 1 : probabilités normales des 2 dés");
  } else if (mode === "2") {
    afficherProbasPaquet();
  } else {
    afficherProbasMode3();
  }
}

function afficherProbasFixes(titre) {
  let html = `<strong>${titre}</strong><br><br>`;
  const total = 36;

  for (let n = 2; n <= 12; n++) {
    const pourcentage = (probaBase[n] / total * 100).toFixed(2);
    html += ligneProba(n, pourcentage);
  }

  infos.innerHTML = html;
}

function afficherProbasPaquet() {
  if (paquet.length === 0) {
    creerPaquet();
  }

  let html = `<strong>Mode 2 : probabilités dans le paquet actuel</strong><br><br>`;

  for (let n = 2; n <= 12; n++) {
    const nb = paquet.filter(x => x === n).length;
    const pourcentage = (nb / paquet.length * 100).toFixed(2);
    html += ligneProba(n, pourcentage);
  }

  infos.innerHTML = html;
}

function afficherProbasMode3() {
  let html = `<strong>Mode 3 : probabilités actuelles</strong><br><br>`;
  const total = Object.values(proba).reduce((a, b) => a + b, 0);

  for (let n = 2; n <= 12; n++) {
    const pourcentage = (proba[n] / total * 100).toFixed(2);
    html += ligneProba(n, pourcentage);
  }

  infos.innerHTML = html;
}

function ligneProba(nombre, pourcentage) {
  return `<div class="proba-ligne"><span>${nombre}</span><span>${pourcentage} %</span></div>`;
}

function creerPaquet() {
  paquet = [];

  let i = 1;
  for (let n = 2; n <= 12; n++) {
    for (let j = 0; j < i; j++) {
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

function reset() {
  paquet = [];
  proba = {...probaBase};
  resultat.textContent = "Reset fait";
  infos.innerHTML = "Tout est revenu au début.";
}

function entierAleatoire(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function melanger(liste) {
  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
}

function tiragePondere(nombres, poids) {
  const total = poids.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;

  for (let i = 0; i < nombres.length; i++) {
    r -= poids[i];
    if (r <= 0) {
      return nombres[i];
    }
  }

  return nombres[nombres.length - 1];
}
