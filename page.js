const BASE_RATE = 4096;

const SHINY_ROLLS = {
	'false': 1,
	'true': 4
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


function getRolls() {
	return SHINY_ROLLS[String(shinyCharm)];
}

function calculateCumulativePercentage(count,rolls) {
	return Math.round(BASE_RATE / rolls);
}

function calculateRate(rolls) {
	return Math.round( BASE_RATE / rolls);
}


function calculateCumulativePercentage(count, rolls) {
	const probabilityPerEncounter = rolls / BASE_RATE;
	const failureRate = 1- probabilityPerEncounter;
	const cumulativeFailure = Math.pow(failureRate, count);
	const cumulativeSuccess = 1 - cumulativeFailure;
	return (cumulativeSuccess * 100).toFixed(2);
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
	$encounterCountDisplay.textContent = encounterCount.toLocaleString();
	$cumulativeDisplay.textContent = `${cumulativePercentage}%`;
	$currentRateDisplay.textContent = rate.toLocaleString();

	if (shinyCharm) {
		$charmYes.classList.add('active');
		$charmNo.classList.remove('active');
	} else {
		$charmNo.classList.add('active');
		$charmYes.classList.add('active');
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

$counterBtn.addEventListener('click', () => {
	encounterCount++;
	updateUI();
})


$darkModeToggle.addEventListener('click', toggleDarkMode); // Dark mode toggle event


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
