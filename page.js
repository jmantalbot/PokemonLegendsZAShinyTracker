const BASE_RATE = 4096;
const CHARM_RATE = 1024.38;

const SHINY_ROLLS = {
	'false': 1,
	'true': BASE_RATE / CHARM_RATE
};

let shinyCharm = false;
let encounterCount = 0;
let isDarkMode = false;

const $ = id => document.getElementById(id);
const $charmYes = $('shinycharm_yes');
const $charmNo = $('shinycharm_no');
const $encounterCountDisplay = $('encounters');
const $cumulativeDisplay = $('cumulative');
const $currentRateDisplay = $('current-rate');
const $counterBtn = $('counter');
const $resetBtn = $('reset');
const $darkModeToggle = $('dark-mode-toggle');
const $decrementBtn = $('decrement-counter');
const $target50 = $('target-50');
const $target90 = $('target-90');


function getRolls() {
	return SHINY_ROLLS[String(shinyCharm)];
}

function calculateCumulativePercentage(count,rolls) {
	return Math.round(BASE_RATE / rolls);
}

function calculateRate() {
	if (shinyCharm){
		return CHARM_RATE.toFixed(2);
	}

	return BASE_RATE
}

function incrementCounter() {
    encounterCount++;
    updateUI();
}

function decrementCounter() {
    if (encounterCount > 0) {
        encounterCount--;
        updateUI();
    }
}

function calculateCumulativePercentage(count, rolls) {
	const probabilityPerEncounter = rolls / BASE_RATE;
	const failureRate = 1- probabilityPerEncounter;
	const cumulativeFailure = Math.pow(failureRate, count);
	const cumulativeSuccess = 1 - cumulativeFailure;
	return (cumulativeSuccess * 100).toFixed(2);
}

function calculateEncountersForProbability(targetProbability, rolls){
	if (rolls === 0) return Math.log(1-targetProbability);

	const p = rolls / BASE_RATE;
	const N = Math.log(1- targetProbability) / Math.log(1-p);
	const remaining = Math.max(0, Math.ceil(N) - encounterCount);
	return remaining;
}



function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkModeState', isDarkMode);
    updateDarkModeIcon();
}

function updateDarkModeIcon() {
    const icon = $darkModeToggle.querySelector('svg');
    // Change icon based on mode
    if (isDarkMode) {
        icon.innerHTML = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
    } else {
        icon.innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'; // Moon icon
    }
}


function updateUI() {
	const rolls = getRolls();
	const rate = calculateRate(rolls);
	const cumulativePercentage = calculateCumulativePercentage(encounterCount, rolls);
	const remaining50 = calculateEncountersForProbability(0.50, rolls);
	const remaining90 = calculateEncountersForProbability(0.90, rolls);

	$encounterCountDisplay.textContent = encounterCount.toLocaleString();
	$cumulativeDisplay.textContent = `${cumulativePercentage}%`;
	$currentRateDisplay.textContent = rate.toLocaleString();

	$target50.textContent = remaining50.toLocaleString();
	$target90.textContent = remaining90.toLocaleString();

	if (shinyCharm) {
		$charmYes.classList.add('active');
		$charmNo.classList.remove('active');
	} else {
		$charmNo.classList.add('active');
		$charmYes.classList.remove('active');
	}
	localStorage.setItem('shinyTrackerStateZA', JSON.stringify({
		charm: shinyCharm,
		count: encounterCount
	}));
}

$charmYes.addEventListener('click', () => {
	shinyCharm = true;
	updateUI();
});


$charmNo.addEventListener('click', () => {
	shinyCharm = false;
	updateUI();
});

$counterBtn.addEventListener('click', incrementCounter);
$decrementBtn.addEventListener('click', decrementCounter);
$darkModeToggle.addEventListener('click', toggleDarkMode); // Dark mode toggle event

document.addEventListener('keyup', (event) => {
    // Check for spacebar press, and ensure input/buttons are not active to prevent double counts
    if (event.code === 'Space' && document.activeElement.tagName !== 'BUTTON' && document.activeElement.tagName !== 'INPUT') {
        event.preventDefault(); // Stop the spacebar from scrolling the page
        
        if (event.ctrlKey) {
            decrementCounter();
        } else {
            // Spacebar for increment (+1)
            incrementCounter();
        }
    }
});


$resetBtn.addEventListener('click', () => {
	if (window.confirm("Are you sure you want to reset the counter to 0?")) {
		encounterCount = 0;
		updateUI();
	}
});

function init() {
	const savedDarkMode = localStorage.getItem('darkModeState');
	if (savedDarkMode !== null) {
        isDarkMode = savedDarkMode === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        updateDarkModeIcon();
    }

	const savedState = localStorage.getItem('shinyTrackerStateZA');
	if (savedState) {
		try {
			const state = JSON.parse(savedState);
			shinyCharm = state.charm;
			encounterCount = state.count;
		} catch (e) {
			console.error("Could not load saved state:", e);
		}
	}
	updateUI();
}

window.onload = init;
