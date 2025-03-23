import spellsData from '../../5e-SRD-Spells.json';

import abjurationIMG from '../img/abjuration.png';
import conjurationIMG from '../img/conjuration.png';
import divinationIMG from '../img/divination.png';
import enchantmentIMG from '../img/enchantment.png';
import evocationIMG from '../img/evocation.png';
import illusionIMG from '../img/illusion.png';
import necromancyIMG from '../img/necromancy.png';
import transmutationIMG from '../img/transmutation.png';

/**
 * Kopplar skolnamn till motsvarande bild för att kunna använda dessa.
 */
 
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



let mySpells = JSON.parse(localStorage.getItem("mySpells")) || [];

/**
 * Visar en lista över alla spells baserat på datan i json filen 
 * @param {Array} spells - Array med de spells som ska visas
 */
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

    
    document.querySelectorAll(".add-spell").forEach(button => {
        button.addEventListener("click", (e) => {
            const spellIndex = e.target.dataset.index;
            const spell = spellsData.find(sp => sp.index === spellIndex);
            addSpellToMyList(spell);
        });
    });
}


/**
 * Funktion för att filtrera spells baserat på sökord, nivå eller skola.
 */
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

/**
 * Lägger till en spell i användarens egen lista om den inte finns med
 * @param {Object} spell 
 */
function addSpellToMyList(spell) {
    if (!mySpells.some(sp => sp.index === spell.index)) {
        mySpells.push(spell);
        sortAndSaveSpells();
        displayMySpells();
    }
}

/**
 * Sorterar de spells man sparat i sin lista i alfabetisk ordning och sparar dem i localStorage
 */
function sortAndSaveSpells() {
    mySpells.sort((a, b) => a.name.localeCompare(b.name)); 
    localStorage.setItem("mySpells", JSON.stringify(mySpells));
}

/**
 * Visar sparade spells i sin lista
 */
function displayMySpells() {
    mySpellList.innerHTML = "";

    if (mySpells.length === 0) {
        mySpellList.innerHTML = `<p class="empty-list">Your spell list is empty.</p>`;
        return;
    }

    const ul = document.createElement("ul");
    ul.classList.add("spell-list");

    mySpells.forEach(spell => {
        const li = document.createElement("li");
        li.classList.add("spell-item");

        li.innerHTML = `
            <span class="spell-name"><strong>${spell.name}</strong></span>
            <span class="spell-details">Level ${spell.level} - ${spell.range}</span>
            <button class="remove-spell" data-index="${spell.index}">✖</button>
        `;
        ul.appendChild(li);
    });

    mySpellList.appendChild(ul);
    addRemoveEventListeners();
}

/**
 * Eventlyssnare för att kunna ta bort spells från sin lista
 */
function addRemoveEventListeners() {
    document.querySelectorAll(".remove-spell").forEach(button => {
        button.addEventListener("click", (e) => {
            const spellIndex = e.target.dataset.index;
            mySpells = mySpells.filter(sp => sp.index !== spellIndex);
            sortAndSaveSpells();
            displayMySpells();
        });
    });
}

/**
 * Eventlyssnare för att kunna rensa hela listan, men en adderad bekräftelse så att man inte råkar rensa hela listan av misstag
 */
clearSpellsBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your spell list?")) {
        mySpells = [];
        localStorage.setItem("mySpells", JSON.stringify(mySpells));
        displayMySpells();
    }
});


searchInput.addEventListener("input", filterSpells);
levelFilter.addEventListener("change", filterSpells);
schoolFilter.addEventListener("change", filterSpells);


import { DiceRoller } from "@dice-roller/rpg-dice-roller";

document.addEventListener("DOMContentLoaded", () => {
    const diceSelect = document.getElementById("dice-select");
    const rollButton = document.getElementById("roll-dice");
    const resultDisplay = document.getElementById("roll-result");
    const clearButton = document.getElementById("clear-results");
    const sidebar = document.getElementById("dice-sidebar");
    const toggleSidebar = document.getElementById("toggle-sidebar");
    const closeSidebar = document.getElementById("close-sidebar");


/**
 * Öppnar tärningspanelen
 */
function openSidebar() {
    sidebar.classList.add("open");
}

/**
 * Stänger tärningspanelen
 */
function closeSidebarFunc() {
    sidebar.classList.remove("open");
}


function closeOnOutsideClick(event) {
    if (!sidebar.contains(event.target) && !toggleSidebar.contains(event.target)) {
        closeSidebarFunc();
    }
}

toggleSidebar.addEventListener("click", (event) => {
    event.stopPropagation();
    openSidebar();
});

closeSidebar.addEventListener("click", closeSidebarFunc);

document.addEventListener("click", closeOnOutsideClick);

sidebar.addEventListener("click", (event) => {
    event.stopPropagation();
});


/**
 * Slår valda tärningar och visar resultatet, inklusive hur många tärningar man slagit och vilken sort
 * Samt separata resultaten av alla slagna tärningar.
 */
    rollButton.addEventListener("click", () => {
        const diceNotation = diceSelect.value;
        if (!diceNotation) return;

        rollButton.disabled = true; 
        resultDisplay.innerHTML = `<span class="rolling">Rolling...</span>`;

        setTimeout(() => {
            const roller = new DiceRoller();
            const roll = roller.roll(diceNotation);

        
            let rollDetails = roll.rolls.map(r => r.value).join(", ");
            resultDisplay.innerHTML = `
                <p><strong>Dice:</strong> ${diceNotation}</p>
                <p><strong>Rolled:</strong> ${roll.total} (${roll})</p>
            `;

            rollButton.disabled = false;
        }, 1000);
    });
    clearButton.addEventListener("click", () => {
        resultDisplay.innerHTML = "";
    });
});


displaySpells(spellsData);
displayMySpells();

