document.getElementById('generate-inputs').addEventListener('click', function() {
    const roomCount = parseInt(document.getElementById('room-count').value);
    const inputArea = document.getElementById('input-area');
    inputArea.innerHTML = ''; // Clear existing inputs

    if (isNaN(roomCount) || roomCount <= 0) {
        alert('Please enter a valid number of rooms.');
        return;
    }

    for (let i = 0; i < roomCount; i++) {
        addPersonInput();
    }

    document.getElementById('assign-rooms').disabled = false;
    document.querySelector('.results').style.display = 'none'; // Hide results when generating inputs
    updateControlsVisibility();
});

document.getElementById('add-person').addEventListener('click', function() {
    addPersonInput();
    updateControlsVisibility();
});

document.getElementById('remove-person').addEventListener('click', function() {
    const personInputs = document.querySelectorAll('.person-input');
    if (personInputs.length > 0) {
        personInputs[personInputs.length - 1].remove(); // Remove last person input
        updateControlsVisibility();
    }
});

function addPersonInput() {
    const roomCount = parseInt(document.getElementById('room-count').value);
    if (isNaN(roomCount) || roomCount <= 0) return; // Invalid room count

    const inputArea = document.getElementById('input-area');
    const personDiv = document.createElement('div');
    personDiv.className = 'person-input';
    personDiv.innerHTML = `
        <div class="person-header">
            <input type="text" placeholder="Name" class="name-input">
        </div>
        <div class="inputs-container"></div>
    `;
    inputArea.appendChild(personDiv);

    const inputsContainer = personDiv.querySelector('.inputs-container');
    for (let j = 0; j < roomCount; j++) {
        const textBox = document.createElement('input');
        textBox.type = 'text';
        textBox.placeholder = `Room ${j + 1}`;
        textBox.className = 'room-text';
        inputsContainer.appendChild(textBox);
    }

    updateControlsVisibility();
}

function updateControlsVisibility() {
    const inputArea = document.getElementById('input-area');
    const controls = document.querySelector('.controls');
    if (inputArea.querySelectorAll('.person-input').length > 0) {
        controls.style.display = 'flex'; // Show controls
    } else {
        controls.style.display = 'none'; // Hide controls
    }
}

document.getElementById('assign-rooms').addEventListener('click', function() {
    const numRooms = parseInt(document.getElementById('room-count').value);
    if (isNaN(numRooms) || numRooms <= 0) {
        alert('Please enter a valid number of rooms.');
        return;
    }

    const nameInputs = document.querySelectorAll('.name-input');
    const roomTexts = document.querySelectorAll('.room-text');

    let preferences = {};
    let roomScores = {};
    let allEnteredRooms = new Set();
    let invalidInput = false;
    let alertMessage = '';

    // Check if at least one person's preferences are filled
    let hasValidPreferences = false;

    // Collect preferences from text inputs
    nameInputs.forEach((input, index) => {
        const name = input.value.trim();
        if (!name) return;

        const texts = Array.from(roomTexts).slice(index * numRooms, (index + 1) * numRooms);
        const roomPrefs = texts.map(text => parseInt(text.value))
                                  .filter(value => !isNaN(value) && value > 0);

        if (roomPrefs.length !== numRooms) {
            invalidInput = true;
            alertMessage = `Please ensure ${name} has entered all rooms.`;
            return;
        }

        if (roomPrefs.length > 0) {
            hasValidPreferences = true;
        }

        if (roomPrefs.some(room => room > numRooms)) {
            invalidInput = true;
            alertMessage = 'Preferences must be between 1 and the number of rooms.';
            return;
        }

        // Check for duplicate room preferences
        if (new Set(roomPrefs).size !== roomPrefs.length) {
            invalidInput = true;
            alertMessage = `${name} has duplicate room preferences.`;
            return;
        }

        preferences[name] = roomPrefs;

        roomPrefs.forEach((room, i) => {
            const score = numRooms - i;
            if (!roomScores[room]) roomScores[room] = {};
            roomScores[room][name] = score;
        });
    });

    if (!hasValidPreferences) {
        alert('At least one person must have filled in their room preferences.');
        return;
    }

    if (allEnteredRooms.size > numRooms) {
        invalidInput = true;
        alertMessage = 'The number of different room preferences exceeds the number of rooms.';
    }

    if (invalidInput) {
        alert(alertMessage);
        return;
    }

    // Calculate Borda Count
    let roomVotes = {};
    for (let room in roomScores) {
        roomVotes[room] = Object.values(roomScores[room]).reduce((sum, score) => sum + score, 0);
    }

    // Sort rooms based on votes
    let sortedRooms = Object.keys(roomVotes).sort((a, b) => roomVotes[b] - roomVotes[a]);

    let assignedRooms = {};
    let unassignedNames = Object.keys(preferences);

    // Handle room assignments
    sortedRooms.forEach(room => {
        let contenders = unassignedNames.filter(name => preferences[name][0] === parseInt(room));

        if (contenders.length > 1) {
            // Randomly select among the contenders
            let chosenOne = contenders[Math.floor(Math.random() * contenders.length)];
            assignedRooms[room] = chosenOne;
            unassignedNames = unassignedNames.filter(name => name !== chosenOne);
        } else if (contenders.length === 1) {
            let chosenOne = contenders[0];
            assignedRooms[room] = chosenOne;
            unassignedNames = unassignedNames.filter(name => name !== chosenOne);
        }
    });

    // Handle any remaining names with remaining rooms
    unassignedNames.forEach(name => {
        let prefs = preferences[name];
        for (let room of prefs) {
            if (!assignedRooms[room]) {
                assignedRooms[room] = name;
                break;
            }
        }
    });

    // Display results
    const results = document.querySelector('.results');
    results.innerHTML = '';
    for (let room in assignedRooms) {
        results.innerHTML += `<p>${assignedRooms[room]} gets Room ${room}</p>`;
    }

    // Show the results section
    results.style.display = 'block';
});