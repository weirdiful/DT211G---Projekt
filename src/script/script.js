
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

/**
 * Håller data för alla trollformler.
 * @type {Array<Object>}
 */
let spellsData = [];

/**
 * Hämtar alla trollformler från API:et.
 */
async function fetchSpells() {
    try {
        let response = await fetch('https://www.dnd5eapi.co/api/spells');
        let data = await response.json();
        spellsData = await Promise.all(data.results.map(async (spell) => {
            return await fetchSpellDetails(spell.index);
        }));

        displaySpells(spellsData);
    } catch (error) {
        console.error("Error fetching spells:", error);
    }
}

/**
 * Hämtar detaljerad information om en specifik trollformel.
 * @param {string} index - Index för trollformeln.
 * @returns {Promise<Object>} Detaljerad information om trollformeln.
 */
async function fetchSpellDetails(index) {
    try {
        let response = await fetch(`https://www.dnd5eapi.co/api/spells/${index}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching spell details:", error);
    }
}

/**
 * Visar alla trollformler i spellList.
 * @param {Array<Object>} spells - Lista över trollformler.
 */
async function displaySpells(spells) {
    spellList.innerHTML = ""; 
    for (const spell of spells) {
        let spellDetails = await fetchSpellDetails(spell.index);

        let spellElement = document.createElement("div");
        spellElement.classList.add("spell-card");

        let schoolName = spellDetails.school?.name ? spellDetails.school.name.toLowerCase() : "unknown";
        let imageUrl = schoolImages[schoolName] || "";

        let damageOptions = spellDetails.damage?.damage_at_slot_level || {};
        let healingOptions = spellDetails.heal_at_slot_level || {};

        let hasDiceRoll = Object.keys(damageOptions).length > 0 || Object.keys(healingOptions).length > 0;
        
        let diceOptionsHTML = "";
        if (hasDiceRoll) {
            let combinedOptions = { ...damageOptions, ...healingOptions };
            diceOptionsHTML = Object.entries(combinedOptions).map(([level, dice]) => 
                `<option value="${dice}">${level} (${dice})</option>`
            ).join("");
        }

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

                    ${hasDiceRoll ? `
                    <p><strong>Roll:</strong></p>
                    <select class="spell-level" data-index="${spellDetails.index}">
                        ${diceOptionsHTML}
                    </select>
                    <button class="roll-damage" data-index="${spellDetails.index}">Roll</button>
                <div class="roll-result-box" id="roll-result-${spellDetails.index}">
                <span class="roll-result-text">No roll yet</span>
                 </div>
                    ` : ""}
                </div>
            </div>
        `;
        
        spellList.appendChild(spellElement);

        
        if (hasDiceRoll) {
            let rollButton = spellElement.querySelector(".roll-damage");
            rollButton.addEventListener("click", async (event) => {
                const spellIndex = event.target.dataset.index;
                let diceNotation = spellElement.querySelector(`select[data-index="${spellIndex}"]`).value;
                let result = rollDamage(diceNotation);
                
                let resultBox = spellElement.querySelector(`#roll-result-${spellIndex}`);
                let resultText = resultBox.querySelector(".roll-result-text");
        
                resultText.textContent = `Result: ${result}`;
                
                
                resultBox.classList.add("roll-highlight");
                setTimeout(() => {
                    resultBox.classList.remove("roll-highlight");
                }, 1000);
            });
        }
    }
}

/**
 * Rullar en tärning med en given notation och returnerar resultatet.
 * @param {string} diceNotation - Notationen för tärningskastet, t.ex. "2d6".
 * @returns {number|string} Resultatet av kastet eller "Error" vid fel.
 */
function rollDamage(diceNotation) {
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
 * Funktion för att filtrera spells baserat på sökord, nivå eller skola.
 */
async function filterSpells() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedLevel = levelFilter.value;
    const selectedSchool = schoolFilter.value.toLowerCase();

    const filteredSpells = spellsData.filter(spell => {
        const matchesSearch = spell.name.toLowerCase().includes(searchTerm);
        const matchesLevel = selectedLevel === "" || spell.level.toString() === selectedLevel;
        const matchesSchool = selectedSchool === "" || spell.school.name.toLowerCase() === selectedSchool;

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





document.addEventListener("DOMContentLoaded", () => {
    fetchSpells();
});

