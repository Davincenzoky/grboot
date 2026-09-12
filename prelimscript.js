    const availableImages = {
        fruits: [
            {
                name: 'apple',
                paths: [
                    'verification/apple/apple1.jpg',
                    'verification/apple/apple2.jpg',
                    'verification/apple/apple3.jpg',
                    'verification/apple/apple4.jpg',
                    'verification/apple/apple.jpg'
                ]
            },
            {
                name: 'banana',
                paths: [
                    'verification/banana/banana1.jpg',
                    'verification/banana/banana2.jpg',
                    'verification/banana/banana3.jpg',
                    'verification/banana/banana4.jpg',
                    'verification/banana/banana.jpg'
                ]
            },
            {
                name: 'orange',
                paths: [
                    'verification/orange/orange1.jpg',
                    'verification/orange/orange2.jpg',
                    'verification/orange/orange3.jpg',
                    'verification/orange/orange4.jpg',
                    'verification/orange/orange.jpg'
                ]
            },
            {
                name: 'grapes',
                paths: [
                    'verification/grapes/grapes1.jpg',
                    'verification/grapes/grapes2.jpg',
                    'verification/grapes/grapes3.jpg',
                    'verification/grapes/grapes4.jpg',
                    'verification/grapes/grapes.jpg'
                ]
            },
            {
                name: 'watermelon',
                paths: [
                    'verification/watermelon/watermelon1.jpg',
                    'verification/watermelon/watermelon2.jpg',
                    'verification/watermelon/watermelon3.jpg',
                    'verification/watermelon/watermelon4.jpg',
                    'verification/watermelon/watermelon.jpg'
                ]
            },
            {
                name: 'mango',
                paths: [
                    'verification/mango/manggo1.jpg',
                    'verification/mango/manggo2.jpg',
                    'verification/mango/mango3.jpg',
                    'verification/mango/manggo4.jpg',
                    'verification/mango/manggo.jpg'
                ]
            },
            {
                name: 'strawberry',
                paths: [
                    'verification/strawberry/strawberry1.jpg',
                    'verification/strawberry/strawberry2.jpg',
                    'verification/strawberry/strawberry3.jpg',
                    'verification/strawberry/strawberry4.jpg',
                    'verification/strawberry/strawberry.jpg'
                ]
            },
            {
                name: 'pineapple',
                paths: [
                    'verification/pineapple/pineapple1.jpg',
                    'verification/pineapple/pineapple2.jpg',
                    'verification/pineapple/pineapple3.jpg',
                    'verification/pineapple/pineapple4.jpg',
                    'verification/pineapple/pineapple.jpg'
                ]
            },
            {
                name: 'kiwi',
                paths: [
                    'verification/kiwi/kiwi1.jpg',
                    'verification/kiwi/kiwi2.jpg',
                    'verification/kiwi/kiwi3.jpg',
                    'verification/kiwi/kiwi4.jpg',
                    'verification/kiwi/kiwi.jpg'
                ]
            }
        ]
    };

    let selectedIndices = new Set();

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function generateRandomVerificationSet() {
        const allFruits = [...availableImages.fruits];
        shuffleArray(allFruits);
        
        // Randomly select a target fruit
        const targetFruit = allFruits[Math.floor(Math.random() * allFruits.length)];
        const otherFruits = allFruits.filter(fruit => fruit !== targetFruit);
        
        // Randomly select how many other fruits to show (between 2 and 4)
        const numOtherFruits = Math.floor(Math.random() * 3) + 2; // Random number between 2 and 4
        const selectedOtherFruits = otherFruits.slice(0, numOtherFruits);
        
        // Get random images from other fruits
        const otherImages = selectedOtherFruits.map(fruit => {
            const randomIndex = Math.floor(Math.random() * fruit.paths.length);
            return fruit.paths[randomIndex];
        });
        
        // Get all images of the target fruit
        const targetImages = targetFruit.paths;
        
        // Create array with all images
        const images = [
            ...targetImages,  // All images of the target fruit
            ...otherImages    // Random selection of other fruit images
        ];
        
        // Shuffle the images
        shuffleArray(images);
        
        // Find the indices of the correct images after shuffling
        const correctIndices = images.reduce((indices, path, index) => {
            if (targetImages.includes(path)) {
                indices.push(index);
            }
            return indices;
        }, []);

        const requiredSelections = targetImages.length;

        return {
            images: images,
            question: `Select all ${targetFruit.name} images (all ${requiredSelections} ${targetFruit.name}s must be selected)`,
            correctIndices: correctIndices,
            requiredSelections: requiredSelections
        };
    }

    function showVerificationBox(onSuccess) {
        const verificationSet = generateRandomVerificationSet();
        const verificationBox = document.createElement('div');
        verificationBox.className = 'verification-modal';
        
        const content = document.createElement('div');
        content.className = 'verification-content';
        content.innerHTML = `
            <div class="text-center">
                <h3 class="text-lg font-semibold text-[var(--text)] mb-2">Human Verification</h3>
                <p class="text-sm text-[var(--text-muted)] mb-4">${verificationSet.question}</p>
                <p id="selectionProgress" class="verification-progress">Selected: <strong>0</strong>/${verificationSet.requiredSelections} correct images</p>
                <div class="verification-grid">
                    ${verificationSet.images.map((img, index) => `
                        <button class="verification-item" data-index="${index}" aria-label="Verification image ${index + 1}">
                            <img src="${img}" alt="Verification image" loading="lazy">
                        </button>
                    `).join('')}
                </div>
                <div class="flex justify-center gap-3 mt-4">
                    <button id="verifySelections" class="btn btn-primary" disabled>
                        Verify Selections
                    </button>
                    <button id="cancelVerification" class="btn btn-secondary">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(verificationBox);
        verificationBox.appendChild(content);

        const items = content.querySelectorAll('.verification-item');
        const verifyButton = content.querySelector('#verifySelections');
        const cancelButton = content.querySelector('#cancelVerification');
        const progressText = content.querySelector('#selectionProgress');

        let correctSelected = 0;
        let wrongSelected = 0;

        function updateProgress() {
            const selectedImages = Array.from(selectedIndices).map(index => 
                verificationSet.images[index]
            );
            correctSelected = selectedImages.filter(img => 
                verificationSet.correctIndices.includes(verificationSet.images.indexOf(img))
            ).length;
            wrongSelected = selectedImages.length - correctSelected;

            progressText.innerHTML = `Selected: <strong>${correctSelected}</strong>/${verificationSet.requiredSelections} correct images`;
            if (wrongSelected > 0) {
                progressText.innerHTML += ` <span class="text-[var(--error)]">(${wrongSelected} incorrect)</span>`;
            }
            verifyButton.disabled = !(correctSelected === verificationSet.requiredSelections && wrongSelected === 0);
        }

        items.forEach((item) => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                if (selectedIndices.has(index)) {
                    selectedIndices.delete(index);
                    item.classList.remove('selected');
                } else {
                    selectedIndices.add(index);
                    item.classList.add('selected');
                }
                updateProgress();
            });
        });

        verifyButton.addEventListener('click', async () => {
            if (correctSelected === verificationSet.requiredSelections && wrongSelected === 0) {
                selectedIndices.clear();
                document.body.removeChild(verificationBox);
                onSuccess();
                return;
            }

            let message = '';
            if (correctSelected < verificationSet.requiredSelections) {
                message = `You need to select more images. You have selected ${correctSelected}/${verificationSet.requiredSelections} correct images.`;
            } else if (correctSelected === verificationSet.requiredSelections && wrongSelected > 0) {
                message = `You have selected all ${verificationSet.requiredSelections} correct images but also ${wrongSelected} incorrect ones. Only select the correct images.`;
            } else if (correctSelected > verificationSet.requiredSelections) {
                message = `You have selected too many images. Only select ${verificationSet.requiredSelections} correct images.`;
            }
            
            alert(message + ' Try again.');
            selectedIndices.clear();
            document.body.removeChild(verificationBox);
            clearTable();
            showVerificationBox(onSuccess);
        });

        cancelButton.addEventListener('click', () => {
            selectedIndices.clear();
            document.body.removeChild(verificationBox);
            clearTable();
        });
    }

    async function searchStudentGrade() {
        const studentNumber = document.getElementById('studentNumber').value.trim();

        if (!studentNumber) {
            alert('Please enter a student number');
            return;
        }

        // Show verification and automatically fetch/display on success
        showVerificationBox(async () => {
            await fetchAndDisplayGrades(studentNumber);
        });
    }

    async function fetchAndDisplayGrades(studentNumber) {
        // Create and show loading animation
        const loadingBox = document.createElement('div');
        loadingBox.className = 'fixed inset-0 flex items-center justify-center z-50';
        loadingBox.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
        loadingBox.style.backdropFilter = 'blur(4px)';
        loadingBox.innerHTML = `
            <div style="background-color: var(--surface); border: 1px solid var(--border); border-radius: 1rem; padding: 2rem; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                <div class="spinner" style="margin: 0 auto 1rem;"></div>
                <p style="color: var(--text-muted);">Loading your grades...</p>
            </div>
        `;
        document.body.appendChild(loadingBox);

        try {
            const url = 'https://sheets.googleapis.com/v4/spreadsheets/1PGa6-8DBEj7BtfeURESjLsFBoFsXau90iKTrChAex8k/values/Sheet1!A:K?key=AIzaSyBX9O3SFSLCuXiCigzNYXEVaJmNfSHC1IE';
            
            // Fetch data
            const response = await fetch(url);
            const data = await response.json();

            // Artificial delay of 0.5 seconds
            await new Promise(resolve => setTimeout(resolve, 500));

            if (data.values && data.values.length > 1) {
                const headers = data.values[0];
                const filteredData = data.values.filter(row => row[6] === studentNumber);

                if (filteredData.length > 0) {
                    displayTable(headers, filteredData);
                } else {
                    alert('No records found for the given student number');
                    clearTable();
                }
            } else {
                alert('No data available');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data. Please try again later.');
        } finally {
            // Remove loading animation
            document.body.removeChild(loadingBox);
        }
    }

    function displayTable(headers, data) {
        const tableHeaders = document.querySelector('#tableHeaders');
        const tableBody = document.querySelector('#gradesTable tbody');

        // Clear existing content
        tableHeaders.innerHTML = '';
        tableBody.innerHTML = '';

        // Modify headers to reflect the combined column and remove column H (index 7), I (index 8), J (index 9)
        const combinedHeader = 'SY-SEM-TERM     ';
        const newHeaders = [
            combinedHeader,
            ...headers.slice(3, 7),  // Take columns D through G
            ...headers.slice(10)     // Skip H, I, J and take the rest
        ];

        // Populate headers
        newHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header || 'N/A';
            th.classList.add('text-center', 'p-1');
            tableHeaders.appendChild(th);
        });

        // Populate rows
        data.forEach(row => {
            const tr = document.createElement('tr');
            
            // Combine columns A, B, and C (indices 0, 1, 2)
            const combinedValue = [row[0], row[1], row[2]].filter(Boolean).join(' ');
            const td = document.createElement('td');
            td.textContent = combinedValue || 'N/A';
            td.classList.add('text-center', 'p-1');
            tr.appendChild(td);

            // Append remaining columns, skipping column H (index 7)
            row.slice(3, 7).forEach(cell => {    // Add columns D through G
                const td = document.createElement('td');
                td.textContent = cell || 'N/A';
                td.classList.add('text-center', 'p-1');
                tr.appendChild(td);
            });
            
            row.slice(10).forEach(cell => {       // Skip H, I, J and add remaining columns
                const td = document.createElement('td');
                td.textContent = cell || 'N/A';
                td.classList.add('text-center', 'p-1');
                tr.appendChild(td);
            });
            
            tableBody.appendChild(tr);
        });
    }

    function clearTable() {
        document.querySelector('#tableHeaders').innerHTML = '';
        document.querySelector('#gradesTable tbody').innerHTML = '';
    }
