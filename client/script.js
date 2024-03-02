const textarea = document.getElementById('textarea');
const outputDiv = document.getElementById('output');
const currentLine = document.getElementById('currentLine');

// Function to show data from IndexedDB
function showData() {
    const openDB = indexedDB.open('text_editor', 1);
    openDB.onsuccess = function () {
        const db = openDB.result;
        const tx = db.transaction('entries', 'readonly');
        const store = tx.objectStore('entries');

        const getRequest = store.get(1); // Get content from the database

        getRequest.onsuccess = function () {
            const data = getRequest.result;
            if (data && data.content) {
                // Split the content into lines
                const lines = data.content.split('\n');
                outputDiv.innerHTML = ''; // Clear previous content

                // Display each line in the output div
                let i = 1;
                lines.forEach(line => {
                    const lineDiv = document.createElement('div');
                    lineDiv.classList.add('line');
                    lineDiv.innerHTML = `<span class="line-no">${i}</span><span class="line-content">${line}</span>`;
                    outputDiv.appendChild(lineDiv);
                    i++;
                });
                currentLine.textContent = i;
            }
        };
    };
}

// Function to save content to IndexedDB
function saveContent(content) {
    const openDB = indexedDB.open('text_editor', 1);
    openDB.onsuccess = function () {
        const db = openDB.result;
        const tx = db.transaction('entries', 'readwrite');
        const store = tx.objectStore('entries');

        const getRequest = store.get(1); // Get existing content from the database

        outputDiv.innerHTML = ''; // Clear previous content
        textarea.value = ''; // Clear the textarea after saving the content

        if (content === 'clear') {
            store.put({ id: 1, content: "" });
            tx.oncomplete = function () {
                console.log('Cleared from IndexedDB');
                showData(); // Call showData to display the saved content in the output div
                currentLine.textContent = 1;
            };
        } else {
            getRequest.onsuccess = function () {
                const data = getRequest.result;
                let mergedContent = content; // Default to the new content

                if (data && data.content) {
                    // If there's existing content, concatenate it with the new content
                    mergedContent = data.content + '\n' + content;
                }

                // Put the merged content into the object store
                store.put({ id: 1, content: mergedContent });
                tx.oncomplete = function () {
                    showData(); // Call showData to display the saved content in the output div
                    console.log('Content saved to IndexedDB');
                };
            };
        }
        
    };
}

// Event listener for textarea keydown event
textarea.addEventListener('keydown', function (event) {
    // Check if the "Enter" key is pressed
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default behavior (e.g., line break)
        const content = textarea.value;
        saveContent(content); // Call the saveContent function to save the content to IndexedDB
    }
});

document.addEventListener('DOMContentLoaded', function () {
    textarea.focus();
    showData();
});
document.getElementById('terminal').addEventListener('click', function (event) {
    textarea.focus();
});
