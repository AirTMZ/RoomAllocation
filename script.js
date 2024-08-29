document.addEventListener('DOMContentLoaded', function() {
    const generateInputsButton = document.getElementById('generate-inputs');
    const assignRoomsButton = document.getElementById('assign-rooms');
    const addPersonButton = document.getElementById('add-person');
    const removePersonButton = document.getElementById('remove-person');
    const inputArea = document.getElementById('input-area');
    const controls = document.querySelector('.controls');

    // Initially hide the controls when the page loads
    controls.style.display = 'none';
    assignRoomsButton.disabled = true; // Disable the "Assign Rooms" button initially

    generateInputsButton.addEventListener('click', function() {
        const roomCount = parseInt(document.getElementById('room-count').value);
        inputArea.innerHTML = ''; // Clear existing inputs

        if (isNaN(roomCount) || roomCount <= 0) {
            alert('Please enter a valid number of rooms.');
            return;
        }

        for (let i = 0; i < roomCount; i++) {
            addPersonInput(roomCount);
        }

        assignRoomsButton.disabled = false;
        document.querySelector('.results').style.display = 'none'; // Hide results when generating inputs
        updateControlsVisibility();
    });

    addPersonButton.addEventListener('click', function() {
        const roomCount = parseInt(document.getElementById('room-count').value);
        addPersonInput(roomCount);
        updateControlsVisibility();
    });

    removePersonButton.addEventListener('click', function() {
        const personInputs = document.querySelectorAll('.person-input');
        if (personInputs.length > 0) {
            personInputs[personInputs.length - 1].remove(); // Remove last person input
            updateControlsVisibility();
        }
    });

    function addPersonInput(roomCount) {
        if (isNaN(roomCount) || roomCount <= 0) return; // Invalid room count

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
    }

    function updateControlsVisibility() {
        const personInputs = document.querySelectorAll('.person-input');
        if (personInputs.length > 0) {
            controls.style.display = 'flex'; // Show controls
        } else {
            controls.style.display = 'none'; // Hide controls
        }
    }

    function scrollToViewElement(element, offset = 0) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.pageYOffset;
        window.scrollTo({
            top: elementTop - offset,
            behavior: 'smooth'
        });
    }

    assignRoomsButton.addEventListener('click', function() {
        const numRooms = parseInt(document.getElementById('room-count').value);
        if (isNaN(numRooms) || numRooms <= 0) {
            alert('Please enter a valid number of rooms.');
            return;
        }

        const nameInputs = document.querySelectorAll('.name-input');
        const roomTexts = document.querySelectorAll('.room-text');

        let preferences = {};
        let roomScores = {};
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

        if (invalidInput) {
            alert(alertMessage);
            return;
        }

        // Allocate rooms using a round-robin approach based on preferences
        let assignedRooms = {};
        let unassignedRooms = Array.from({ length: numRooms }, (_, i) => i + 1);
        let unassignedNames = Object.keys(preferences);

        while (unassignedNames.length > 0 && unassignedRooms.length > 0) {
            for (let name of unassignedNames) {
                let prefs = preferences[name];
                let assigned = false;

                for (let pref of prefs) {
                    if (unassignedRooms.includes(pref)) {
                        assignedRooms[pref] = name;
                        unassignedRooms = unassignedRooms.filter(room => room !== pref);
                        assigned = true;
                        break;
                    }
                }

                if (assigned) {
                    unassignedNames = unassignedNames.filter(n => n !== name);
                }
            }
        }

        // Handle any remaining names with remaining rooms
        unassignedNames.forEach(name => {
            let remainingRoom = unassignedRooms.shift();
            if (remainingRoom !== undefined) {
                assignedRooms[remainingRoom] = name;
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

        // Wait for a moment to ensure results are rendered, then scroll to view the results
        setTimeout(() => {
            scrollToViewElement(results, 20); // Offset of 20 pixels for better visibility
        }, 300); // Adjust delay if necessary
    });
});
