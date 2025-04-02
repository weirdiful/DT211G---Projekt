
import abjurationIMG from '../img/abjuration.png';
import conjurationIMG from '../img/conjuration.png';
import divinationIMG from '../img/divination.png';
import enchantmentIMG from '../img/enchantment.png';
import evocationIMG from '../img/evocation.png';
import illusionIMG from '../img/illusion.png';
import necromancyIMG from '../img/necromancy.png';
import transmutationIMG from '../img/transmutation.png';

import { DiceRoller } from "@dice-roller/rpg-dice-roller";

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


let spellsData = [];

async function fetchSpells() {
    try {
        let response = await fetch('https://www.dnd5eapi.co/api/spells');
        let data = await response.json();
        spellsData = data.results;
        displaySpells(spellsData);



    } catch (error) {
        console.error("Error fetching spells:", error);
    }
}

async function fetchSpellDetails(index) {
    try {
        let response = await fetch(`https://www.dnd5eapi.co/api/spells/${index}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching spell details:", error);
    }
}

/**
 * Visar en lista över alla spells baserat på datan i json filen 
 * @param {Array} spells - Array med de spells som ska visas
 */
async function displaySpells(spells) {
    spellList.innerHTML = ""; 
    for (const spell of spells) {
        let spellDetails = await fetchSpellDetails(spell.index); // Vänta på hämtning av detaljer

        let spellElement = document.createElement("div");
        spellElement.classList.add("spell-card");

        let schoolName = spellDetails.school?.name ? spellDetails.school.name.toLowerCase() : "unknown";
        let imageUrl = schoolImages[schoolName] || "";

        let minLevel = Math.min(...Object.keys(spellDetails.damage?.damage_at_slot_level || { "1": "0d0" }));
        let damageOptions = Object.entries(spellDetails.damage?.damage_at_slot_level || {}).map(([level, dice]) => 
            `<option value="${dice}">${level} (${dice})</option>`
        ).join("");

          let diceNotation = spellDetails.damage?.damage_at_slot_level?.["1"] || "No damage";

        spellElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <h2>${spellDetails.name}</h2>
                    <img src="${imageUrl}" alt="${spellDetails.school?.name || "Unknown"} image" class="spell-image" />
                </div>
                <div class="card-back">
                    <h2>${spellDetails.name}</h2>
                    <p><strong>Level:</strong> ${spellDetails.level}</p>
                    <p><strong>School:</strong> ${spellDetails.school?.name || "Unknown"}</p>
                    <p><strong>Range:</strong> ${spellDetails.range}</p>
                    <p><strong>Components:</strong> ${spellDetails.components?.join(", ") || "None"}</p>
                    <p>${spellDetails.desc?.join(" ") || "No description available."}</p>

                   <p><strong>Damage:</strong></p>
                    <select class="spell-level" data-index="${spellDetails.index}">
                        ${damageOptions}
                    </select>
                    <button class="roll-damage" data-index="${spellDetails.index}">Roll Damage</button>
                    <p class="roll-result" id="roll-result-${spellDetails.index}"></p>
                </div>
            </div>
        `;
        spellList.appendChild(spellElement);
    }

    document.querySelectorAll(".add-spell").forEach(button => {
        button.addEventListener("click", async (e) => {
            const spellIndex = e.target.dataset.index;
            const spell = await fetchSpellDetails(spellIndex);
            addSpellToMyList(spell);
        });
    });

    addRollDamageEventListeners();
}

/**
 * Rullar skada med RPG Dice Roller
 */
function rollDamageAPI(diceNotation) {
    try {
        const roller = new DiceRoller();
        const roll = roller.roll(diceNotation);
        return roll.total; 
    } catch (error) {
        console.error("Error rolling dice:", error);
        return "Error";
    }
}


/**
 * Eventlyssnare för att rulla skada baserat på vald nivå
 */
function addRollDamageEventListeners() {
    document.querySelectorAll(".roll-damage").forEach(button => {
        button.addEventListener("click", async (e) => {
            const spellIndex = e.target.dataset.index;
            const levelSelect = document.querySelector(`.spell-level[data-index="${spellIndex}"]`);
            const diceNotation = levelSelect ? levelSelect.value : "0d0";
    
            if (!diceNotation || diceNotation === "0d0") {
                alert("This spell has no damage roll.");
                return;
            }
    
            let rollResult = rollDamageAPI(diceNotation); 
    
            if (rollResult) {
                document.getElementById(`roll-result-${spellIndex}`).innerHTML = `<strong>Rolled:</strong> ${rollResult}`;
            }
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

searchInput.addEventListener("input", filterSpells);
levelFilter.addEventListener("change", filterSpells);
schoolFilter.addEventListener("change", filterSpells);


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




/**
 * Funktion för att hantera tärningskast när en spell väljs
 */
async function handleSpellDamageRoll(spellIndex) {
    const spell = await fetchSpellDetails(spellIndex);
    
    if (!spell || !spell.damage || !spell.damage.damage_at_slot_level) {
        alert("This spell has no damage roll.");
        return;
    }

    let diceNotation = spell.damage.damage_at_slot_level["1"]; 

    if (!diceNotation) {
        alert("No valid damage dice found for this spell.");
        return;
    }
    let rollResult = await rollDamage(diceNotation);

    if (rollResult) {
        alert(`You rolled ${diceNotation}: ${rollResult}`);
    }
}




document.addEventListener("DOMContentLoaded", () => {
    fetchSpells();
});

