import spellsData from '../../5e-SRD-Spells.json';

import abjurationIMG from '../img/abjuration.png';
import conjurationIMG from '../img/conjuration.png';
import divinationIMG from '../img/divination.png';
import enchantmentIMG from '../img/enchantment.png';
import evocationIMG from '../img/evocation.png';
import illusionIMG from '../img/illusion.jpg';
import necromancyIMG from '../img/necromancy.jpg';
import transmutationIMG from '../img/transmutation.jpg';


const schoolImages = {
    abjuration: abjurationIMG,
    conjuration: conjurationIMG,
    divination: divinationIMG,
    enchantment: enchantmentIMG,
    evocation: evocationIMG,
    illusion: illusionIMG,
    necromancy: necromancyIMG,
    transmutation: transmutationIMG,

}

let spellList = document.getElementById("spell-list");
let mySpellList = document.getElementById("my-spells");
let searchInput = document.getElementById("search");
let levelFilter = document.getElementById("level-filter");
let schoolFilter = document.getElementById("school-filter");
let clearSpellsBtn = document.getElementById("clear-spells");



// Hämta sparade spells från localStorage
let mySpells = JSON.parse(localStorage.getItem("mySpells")) || [];

// Funktion för att visa spells
function displaySpells(spells) {
    spellList.innerHTML = ""; 
    spells.forEach(spell => {
        let spellElement = document.createElement("div");
        spellElement.classList.add("spell-card");

        let schoolName = spell.school.name.toLowerCase();  

        let imageUrl = schoolImages[schoolName];

        spellElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <h2>${spell.name}</h2>
                    <img src="${imageUrl}" alt="${spell.school.name} image" class="spell-image" />
                </div>
                <div class="card-back">
                    <h2>${spell.name}</h2>
                    <p><strong>Level:</strong> ${spell.level}</p>
                    <p><strong>School:</strong> ${spell.school.name}</p>
                    <p><strong>Range:</strong> ${spell.range}</p>
                    <p><strong>Components:</strong> ${spell.components.join(", ")}</p>
                    <p>${spell.desc.join(" ")}</p>
                    <button class="add-spell" data-index="${spell.index}">Add to My Spells</button>
                </div>
            </div>
        `;
        spellList.appendChild(spellElement);
    });

    // Lägg till event listeners på knapparna
    document.querySelectorAll(".add-spell").forEach(button => {
        button.addEventListener("click", (e) => {
            const spellIndex = e.target.dataset.index;
            const spell = spellsData.find(sp => sp.index === spellIndex);
            addSpellToMyList(spell);
        });
    });
}


// Funktion för att filtrera spells
function filterSpells() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedLevel = levelFilter.value;
    const selectedSchool = schoolFilter.value;

    const filteredSpells = spellsData.filter(spell => {
        const matchesSearch = spell.name.toLowerCase().includes(searchTerm);
        const matchesLevel = selectedLevel === "" || spell.level.toString() === selectedLevel;
        const matchesSchool = selectedSchool === "" || spell.school.name === selectedSchool;

        return matchesSearch && matchesLevel && matchesSchool;
    });

    displaySpells(filteredSpells);
}

// Funktion för att lägga till en spell i listan
function addSpellToMyList(spell) {
    if (!mySpells.some(sp => sp.index === spell.index)) {
        mySpells.push(spell);
        localStorage.setItem("mySpells", JSON.stringify(mySpells));
        displayMySpells();
    }
}

// Funktion för att visa användarens spell-lista
function displayMySpells() {
    mySpellList.innerHTML = ""; // Rensa innan rendering
    mySpells.forEach(spell => {
        const spellElement = document.createElement("div");
        spellElement.classList.add("spell");
        spellElement.innerHTML = `
            <h3>${spell.name}</h3>
            <button class="remove-spell" data-index="${spell.index}">Remove</button>
        `;
        mySpellList.appendChild(spellElement);
    });

    // Lägg till event listeners på "Remove"-knappar
    document.querySelectorAll(".remove-spell").forEach(button => {
        button.addEventListener("click", (e) => {
            const spellIndex = e.target.dataset.index;
            mySpells = mySpells.filter(sp => sp.index !== spellIndex);
            localStorage.setItem("mySpells", JSON.stringify(mySpells));
            displayMySpells();
        });
    });
}

// Funktion för att rensa hela spell-listan
clearSpellsBtn.addEventListener("click", () => {
    mySpells = [];
    localStorage.setItem("mySpells", JSON.stringify(mySpells));
    displayMySpells();
});

// Event listeners för sökning och filtrering
searchInput.addEventListener("input", filterSpells);
levelFilter.addEventListener("change", filterSpells);
schoolFilter.addEventListener("change", filterSpells);


import { DiceRoller } from "@dice-roller/rpg-dice-roller";

document.addEventListener("DOMContentLoaded", () => {
    const diceSelect = document.getElementById("dice-select");
    const rollButton = document.getElementById("roll-dice");
    const resultDisplay = document.getElementById("roll-result");

    rollButton.addEventListener("click", () => {
        const diceNotation = diceSelect.value;
        if (!diceNotation) return;

        const roller = new DiceRoller();
        const roll = roller.roll(diceNotation);

        resultDisplay.textContent = `Result: ${roll.total} (${roll})`;
    });
});


displaySpells(spellsData);
displayMySpells();

