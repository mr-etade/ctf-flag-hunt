// Initialize Pyodide
let pyodide;

// Challenge flags
const flags = {
    1: "CTF{hello_python}",
    6: "CTF{simple_loop}",
    10: "CTF{class_syntax}"
};

// Initialize Pyodide when page loads
async function initializePyodide() {
    pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");
    
    // Set up print capture
    await pyodide.runPythonAsync(`
import sys
from io import StringIO

class PrintCapture:
    def __init__(self):
        self.content = ""
    
    def write(self, text):
        self.content += text
        return len(text)
    
    def flush(self):
        pass

_print_capture = PrintCapture()
    `);
}

// Run when page loads
window.addEventListener('DOMContentLoaded', (event) => {
    initializePyodide();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Challenge 3
    function revealFlag() {
        console.log("CTF{js_variables}");
    }
    window.revealFlag = revealFlag;

    // Challenge 11
    document.getElementById("hoverMe").addEventListener("mouseover", function() {
        alert("Flag: CTF{private_var}");
    });

    // Challenge 12
    let clicks = 0;
    function countClick() {
        clicks++;
        if (clicks === 3) {
            console.log("CTF{click_event}");
        }
    }
    window.countClick = countClick;
}

// Function to run Python code and check challenges
async function runChallenge(challengeNum) {
    const codeElement = document.getElementById(`code${challengeNum}`);
    const outputElement = document.getElementById(`output${challengeNum}`);
    const userCode = codeElement.value;
    
    try {
        // Reset print capture and redirect stdout
        await pyodide.runPythonAsync(`
_print_capture.content = ""
sys.stdout = _print_capture
        `);
        
        // Run the user's code
        await pyodide.runPythonAsync(userCode);
        
        // Get the captured output
        const capturedOutput = await pyodide.runPythonAsync("_print_capture.content");
        
        // Restore stdout
        await pyodide.runPythonAsync("sys.stdout = sys.__stdout__");
        
        // Check each challenge's specific condition
        let success = false;
        let output = "";
        
        switch(challengeNum) {
            case 1:
                if (capturedOutput.includes("Hello World!")) {
                    success = true;
                    output = "Correct! Flag: " + flags[1];
                } else {
                    output = "Your code didn't print 'Hello World!'";
                }
                break;
                
            case 6:
                const digitsOnly = [...capturedOutput].filter(c => /\d/.test(c));
                const uniqueDigits = [...new Set(digitsOnly)].sort();
                const usedLoop = /(?:\bfor\b|\bwhile\b)/.test(userCode);

                if (uniqueDigits.join('') === '012' && usedLoop) {
                    success = true;
                    output = "Correct! Flag: " + flags[6];
                } else if (!usedLoop) {
                    output = "You must use a for or while loop.";
                } else {
                    output = "Your loop didn't print *only* the numbers 0 to 2.";
                }
                break;
                
            case 10:
                try {
                    // First execute the user's class definition
                    await pyodide.runPythonAsync(userCode);
                    
                    // Then test it
                    const classTest = await pyodide.runPythonAsync(`
            hacker = Hacker()
            str(hacker.name)
                    `);
                    
                    if (classTest === "Alice") {
                        success = true;
                        output = "Correct! Flag: " + flags[10];
                    } else {
                        output = "Your class didn't set name to 'Alice' in __init__. Got: " + classTest;
                    }
                } catch (e) {
                    output = "Error in your class definition: " + e.message;
                }
                break;
        }
        
        outputElement.textContent = output;
        if (success) {
            outputElement.style.color = "#0f0";
        } else {
            outputElement.style.color = "#f00";
        }
        
    } catch (error) {
        outputElement.textContent = "Error: " + error.message;
        outputElement.style.color = "#f00";
    }
}

// Make runChallenge available globally
window.runChallenge = runChallenge;