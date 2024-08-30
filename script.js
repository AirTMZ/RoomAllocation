document.addEventListener('DOMContentLoaded', function() {
    const generateInputsButton = document.getElementById('generate-inputs');
    const assignRoomsButton = document.getElementById('assign-rooms');
    const addPersonButton = document.getElementById('add-person');
    const removePersonButton = document.getElementById('remove-person');
    const inputArea = document.getElementById('input-area');
    const controls = document.querySelector('.controls');
    const results = document.querySelector('.results');

    controls.style.display = 'none';
    assignRoomsButton.disabled = true;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    function generateAllPermutations(array) {
        if (array.length <= 1) return [array];
        const permutations = [];

        for (let i = 0; i < array.length; i++) {
            const currentElement = array[i];
            const remainingElements = array.slice(0, i).concat(array.slice(i + 1));
            const remainingPermutations = generateAllPermutations(remainingElements);
            for (const perm of remainingPermutations) {
                permutations.push([currentElement].concat(perm));
            }
        }

        return permutations;
    }

    function evaluateSatisfaction(assignment, preferences, numRooms) {
        let satisfaction = 0;

        for (const [room, name] of Object.entries(assignment)) {
            const roomIndex = preferences[name].indexOf(parseInt(room));
            if (roomIndex >= 0) {
                satisfaction += numRooms - roomIndex; // Weighted satisfaction
            }
        }

        return satisfaction;
    }

    function exhaustiveSearchWithRandomness(preferences, numRooms) {
        const names = Object.keys(preferences);
        const allPermutations = generateAllPermutations(names);

        // Shuffle permutations to ensure randomness
        shuffleArray(allPermutations);

        let bestAssignment = null;
        let bestSatisfaction = -Infinity;

        // Evaluate all permutations but in a shuffled/randomized order
        for (const permutation of allPermutations) {
            const assignment = {};
            permutation.forEach((name, i) => {
                assignment[i + 1] = name; // Assign each name to a room
            });

            const satisfaction = evaluateSatisfaction(assignment, preferences, numRooms);
            if (satisfaction > bestSatisfaction) {
                bestSatisfaction = satisfaction;
                bestAssignment = assignment;
            }
        }

        return bestAssignment;
    }

    generateInputsButton.addEventListener('click', function() {
        const roomCount = parseInt(document.getElementById('room-count').value, 10);
        inputArea.innerHTML = '';

        if (isNaN(roomCount) || roomCount <= 0) {
            alert('Please enter a valid number of rooms.');
            return;
        }

        for (let i = 0; i < roomCount; i++) {
            addPersonInput(roomCount);
        }

        assignRoomsButton.disabled = false;
        assignRoomsButton.classList.add('enabled'); // Add enabled class
        results.style.display = 'none';
        updateControlsVisibility();
    });

    addPersonButton.addEventListener('click', function() {
        const roomCount = parseInt(document.getElementById('room-count').value, 10);
        if (isNaN(roomCount) || roomCount <= 0) {
            alert('Please generate inputs before adding more people.');
            return;
        }
        addPersonInput(roomCount);
        updateControlsVisibility();
    });

    removePersonButton.addEventListener('click', function() {
        const personInputs = document.querySelectorAll('.person-input');
        if (personInputs.length > 0) {
            personInputs[personInputs.length - 1].remove();
            updateControlsVisibility();
        }
    });

    function addPersonInput(roomCount) {
        if (isNaN(roomCount) || roomCount <= 0) return;

        const personDiv = document.createElement('div');
        personDiv.className = 'person-input';

        // Determine the person index based on current number of person inputs
        const personIndex = document.querySelectorAll('.person-input').length + 1;

        personDiv.innerHTML = `
            <div class="person-header">
                <input type="text" placeholder="Person ${personIndex}" class="name-input">
            </div>
            <div class="inputs-container"></div>
        `;
        inputArea.appendChild(personDiv);

        const inputsContainer = personDiv.querySelector('.inputs-container');
        for (let j = 0; j < roomCount; j++) {
            const numberBox = document.createElement('input');
            numberBox.type = 'number'; // Set the type to 'number' for spinner arrows
            numberBox.placeholder = `Room ${j + 1}`;
            numberBox.className = 'room-text';
            numberBox.min = 1; // Optional: Set minimum value
            numberBox.step = 1; // Optional: Increment step
            inputsContainer.appendChild(numberBox);
        }
    }

    function updateControlsVisibility() {
        const personInputs = document.querySelectorAll('.person-input');
        if (personInputs.length > 0) {
            controls.style.display = 'flex';
        } else {
            controls.style.display = 'none';
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
        if (assignRoomsButton.disabled) {
            alert('Generate inputs first before calculating');
            return;
        }

        const numRooms = parseInt(document.getElementById('room-count').value, 10);

        if (isNaN(numRooms) || numRooms <= 0) {
            alert('Please enter a valid number of rooms.');
            return;
        }

        const nameInputs = document.querySelectorAll('.name-input');
        const roomTexts = document.querySelectorAll('.room-text');

        let preferences = {};
        let invalidInput = false;
        let alertMessage = '';

        let hasValidPreferences = false;

        nameInputs.forEach((input, index) => {
            const name = input.value.trim();
            if (!name) return;

            const texts = Array.from(roomTexts).slice(index * numRooms, (index + 1) * numRooms);
            const roomPrefs = texts.map(text => parseInt(text.value, 10))
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

            if (new Set(roomPrefs).size !== roomPrefs.length) {
                invalidInput = true;
                alertMessage = `${name} has duplicate room preferences.`;
                return;
            }

            preferences[name] = roomPrefs;
        });

        if (!hasValidPreferences) {
            alert('At least one person must have filled in their room preferences.');
            return;
        }

        if (invalidInput) {
            alert(alertMessage);
            return;
        }

        // Use randomized exhaustive search to find the best assignment
        const assignedRooms = exhaustiveSearchWithRandomness(preferences, numRooms);

        // Display results
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
