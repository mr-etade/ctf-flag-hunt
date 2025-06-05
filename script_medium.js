// Initialize Pyodide
let pyodide;

// Challenge flags
const flags = {
    1: "CTF{multi_paradigm}",
    2: "CTF{prolog_query}",
    3: "CTF{js_callback}",
    4: "CTF{sql_join}",
    5: "CTF{nested_ifs}",
    6: "CTF{for_range}",
    7: "CTF{prolog_lists}",
    8: "CTF{prolog_backtrack}",
    9: "CTF{while_break}",
    10: "CTF{recursive_func}",
    11: "CTF{abstract_class}",
    12: "CTF{event_listener}",
    13: "CTF{reduce_func}",
    14: "CTF{callback_func}",
    15: "CTF{init_method}",
    16: "CTF{class_method}",
    18: "CTF{sql_having}",
    19: "CTF{type_conversion}",
    20: "CTF{inheritance}",
    21: "CTF{polymorphism}",
    23: "CTF{async_fix}",
    25: "CTF{polymorphism}",
    28: "CTF{type_cast}",
    29: "CTF{ternary_op}"
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

// Set up all event listeners and functions
function setupEventListeners() {
    // Challenge 3: JS Callback Chain
    function step1(next) { 
        console.log("Step 1"); 
        next(); 
    }
    function step2() { 
        console.log("Step 2"); 
        console.log("Flag: " + flags[3]);
    }
    window.runCallback = function() { 
        step1(step2); 
    };

    // Challenge 7: Prolog Lists Riddle
    window.checkPrologList = function() {
        const userAnswer = document.getElementById("prologAnswer7").value.trim();
        const outputElement = document.getElementById("output7");
        
        // Correct answers (all valid Prolog list forms)
        const correctAnswers = [
            "[1, 2 | [3, 4]]",
            "[1, 2, 3, 4]",
            "[1, 2 | [3 | [4]]]",
            "[1 | [2 | [3 | [4]]]]"
        ];
        
        if (correctAnswers.includes(userAnswer)) {
            outputElement.innerHTML = `Correct! The flag is: <strong>${flags[7]}</strong>`;
            outputElement.style.color = "#0f0";
        } else {
            outputElement.textContent = "Incorrect. Try again! (Hint: How does Prolog represent lists with heads and tails?)";
            outputElement.style.color = "#f00";
        }
    };

    // Challenge 8: Prolog Backtracking Trap
    window.validatePrologBacktrack = function() {
        const userCode = document.getElementById("prologCode8").value.trim();
        const outputElement = document.getElementById("output8");
        
        // Check for Prolog backtracking fixes (either method)
        const hasCutOperator = userCode.includes("!");               // Using !
        const hasOnceKeyword = userCode.includes("once");            // Using once/1
        const hasSingleClause = (userCode.match(/get_secret/g) || []).length === 1;  // Only 1 clause
        
        if (hasCutOperator || hasOnceKeyword || hasSingleClause) {
            outputElement.innerHTML = `Correct! Backtracking fixed. Flag: <strong>${flags[8]}</strong>`;
            outputElement.style.color = "#0f0";
        } else {
            outputElement.innerHTML = `
                Incorrect. The predicate still backtracks!<br>
                <strong>Valid solutions:</strong><br>
                1. Keep only one <code>get_secret</code> clause, OR<br>
                2. Add a cut (<code>!</code>) to the correct clause, OR<br>
                3. Use <code>once(get_secret(X))</code> in your query.
            `;
            outputElement.style.color = "#f00";
        }
    };

    // Challenge 12: JavaScript Event Riddle
    window.checkEventRiddle = function() {
        const userAnswer = document.getElementById("eventRiddleAnswer").value.trim().toLowerCase();
        const outputElement = document.getElementById("output12");
        
        // Correct answers (various acceptable forms)
        const correctAnswers = [
            "addeventlistener",
            "addEventListener", 
            "add event listener",
            "event listener",
            "eventlistener"
        ];
        
        // Check if user's answer matches any correct answer
        const isCorrect = correctAnswers.some(answer => 
            answer.toLowerCase() === userAnswer || 
            userAnswer.includes(answer.toLowerCase())
        );
        
        if (isCorrect) {
            outputElement.innerHTML = `
                <div style="color: #0f0; font-weight: bold;">
                    Correct! The answer is <strong>addEventListener</strong><br>
                    Flag: <strong>${flags[12]}</strong>
                </div>
            `;
        } else {
            outputElement.innerHTML = `
                <div style="color: #f00;">
                    Incorrect
                </div>
            `;
        }
    };

    // Challenge 14: JavaScript Callback Fix
    window.validateCallback14 = function() {
        const userCode = document.getElementById("jsCode14").value;
        const outputElement = document.getElementById("output14");
        
        try {
            // Check if they added callback parameter to function signature
            const hasCallbackParam = userCode.includes("function processData(data, callback)") || 
                                    userCode.includes("processData(data,callback)");
            
            // Check if they call the callback function
            const callsCallback = userCode.includes("callback(result)") || 
                                userCode.includes("callback(output)") ||
                                userCode.includes("callback(processed)");
            
            if (!hasCallbackParam) {
                outputElement.innerHTML = `
                    <div style="color: #f00;">
                        Missing callback parameter in processData function signature!<br>
                        <small>Hint: function processData(data, callback)</small>
                    </div>
                `;
                return;
            }
            
            if (!callsCallback) {
                outputElement.innerHTML = `
                    <div style="color: #f00;">
                        You're not calling the callback function with the result!<br>
                        <small>Hint: callback(result)</small>
                    </div>
                `;
                return;
            }
            
            // Try to execute the code to see if it works
            let consoleOutput = [];
            const originalLog = console.log;
            console.log = function(...args) {
                consoleOutput.push(args.join(' '));
            };
            
            try {
                eval(userCode);
                console.log = originalLog;
                
                // Check if the expected output was produced
                const hasProcessedData = consoleOutput.some(line => line.includes("Processed data:"));
                const hasSuccess = consoleOutput.some(line => line.includes("Success!"));
                
                if (hasProcessedData && hasSuccess) {
                    outputElement.innerHTML = `
                        <div style="color: #0f0; font-weight: bold;">
                            Correct! Callback function implemented properly.<br>
                            Output: ${consoleOutput.join('<br>')}<br>
                            Flag: <strong>${flags[14]}</strong>
                        </div>
                    `;
                } else {
                    outputElement.innerHTML = `
                        <div style="color: #f00;">
                            Code runs but callback isn't working correctly.<br>
                            Expected: "Processed data:" and "Success!" messages
                        </div>
                    `;
                }
            } catch (execError) {
                console.log = originalLog;
                outputElement.innerHTML = `
                    <div style="color: #f00;">
                        Runtime Error: ${execError.message}<br>
                        Make sure your callback function is called correctly!
                    </div>
                `;
            }
            
        } catch (error) {
            outputElement.innerHTML = `
                <div style="color: #f00;">
                    Error: ${error.message}
                </div>
            `;
        }
    };

    // Challenge 17: SQL Group By Puzzle
    window.validateSQL17 = function() {
        const userQuery = document.getElementById("sqlCode17").value.toLowerCase();
        const outputElement = document.getElementById("output17");
        
        // Check for required SQL components
        const hasSelect = userQuery.includes("select p.name");
        const hasJoin = userQuery.includes("join sales s") || 
                    userQuery.includes("join sales as s") ||
                    userQuery.match(/from\s+products\s+(p\s*,)?\s*sales\s+s/i);
        const hasGroupBy = userQuery.includes("group by p.name") || 
                        userQuery.includes("group by p.product_id");
        const hasHaving = userQuery.includes("having sum") && 
                        userQuery.match(/having\s+sum\(.*\)\s*>\s*1000/);
        const hasSum = userQuery.includes("sum(s.quantity * p.price)") ||
                    userQuery.match(/sum\(\s*s\.quantity\s*\*\s*p\.price\s*\)/);
        
        if (!hasSelect) {
            outputElement.innerHTML = "Your query should SELECT product names";
            return;
        }
        if (!hasJoin) {
            outputElement.innerHTML = "You need to JOIN products and sales tables (ON p.product_id = s.product_id)";
            return;
        }
        if (!hasGroupBy) {
            outputElement.innerHTML = "Missing GROUP BY clause (should group by product name or ID)";
            return;
        }
        if (!hasHaving) {
            outputElement.innerHTML = "Need HAVING clause to filter by total sales (HAVING SUM(...) > 1000)";
            return;
        }
        if (!hasSum) {
            outputElement.innerHTML = "Calculate total sales using SUM(s.quantity * p.price)";
            return;
        }
        
        // If all components are present
        outputElement.innerHTML = `
            <div style="color: #0f0; font-family: monospace;">
                <strong>Query Results:</strong><br>
                +------------------+--------------+<br>
                | name             | total_sales  |<br>
                +------------------+--------------+<br>
                | Premium Widget   |      1250.00 |<br>
                | Deluxe Gadget    |      1100.00 |<br>
                +------------------+--------------+<br>
                <br>
                <strong>Correct! Flag: ${flags[17] || "CTF{sql_groupby}"}</strong>
            </div>
        `;
    };

    // Challenge 18: SQL HAVING Clause Puzzle
    window.validateSQL18 = function() {
        const userQuery = document.getElementById("sqlCode18").value.toLowerCase();
        const outputElement = document.getElementById("output18");
        
        // Check for required SQL components
        const hasSelect = userQuery.includes("select d.dept_name") && 
                        (userQuery.includes("round(avg(e.salary),2)") || 
                        userQuery.includes("round(avg(e.salary), 2)"));
        const hasJoin = userQuery.includes("join departments d") || 
                    userQuery.match(/from\s+employees\s+e\s*(join|,)\s*departments\s+d/i);
        const hasGroupBy = userQuery.includes("group by d.dept_name") || 
                        userQuery.includes("group by d.dept_id");
        const hasHaving = userQuery.match(/having\s+avg\(e\.salary\)\s*>\s*75000/) ||
                        userQuery.match(/having\s+round\(avg\(e\.salary\)\s*,\s*2\)\s*>\s*75000/);
        
        if (!hasSelect) {
            outputElement.innerHTML = "Your query should SELECT department names and rounded average salaries";
            return;
        }
        if (!hasJoin || !userQuery.includes("e.dept_id = d.dept_id")) {
            outputElement.innerHTML = "You need to properly JOIN employees and departments tables";
            return;
        }
        if (!hasGroupBy) {
            outputElement.innerHTML = "Missing GROUP BY clause (should group by department)";
            return;
        }
        if (!hasHaving) {
            outputElement.innerHTML = "Need HAVING clause to filter by average salary (HAVING AVG(e.salary) > 75000)";
            return;
        }
        
        // If all components are present
        outputElement.innerHTML = `
            <div style="color: #0f0; font-family: monospace;">
                <strong>Query Results:</strong><br>
                +------------------+-----------------+<br>
                | dept_name        | avg_salary      |<br>
                +------------------+-----------------+<br>
                | Engineering      |        82500.00 |<br>
                | Data Science     |        78000.00 |<br>
                +------------------+-----------------+<br>
                <br>
                <strong>Correct! Flag: ${flags[18] || "CTF{sql_having}"}</strong>
            </div>
        `;
    };

    // Challenge 23: JS Async Fix
    window.fetchFlag = async function() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Flag: " + flags[23]);
    };

    // Challenge 28: JS Type Fix
    window.castIt = function() {
        let x = parseInt("10") + 5;
        if (x === 15) console.log("Flag: " + flags[28]);
    };
}

// Challenge 1: Python Loop Fix
window.runPythonCode1 = function() {
    const userCode = document.getElementById("code1").value;
    runCode(1, userCode);
}

// Challenge 2: Prolog Query Puzzle
window.validateProlog = function() {
    const code = document.getElementById("prologCode").value;
    const output = document.getElementById("prologOutput");
    output.innerHTML = "";
    
    const hasBetween = code.includes("between(3, 7, N)");
    const hasMessage = code.includes("message(N, Message)");
    const hasCorrectHead = code.includes("find_secret(N, Message)");
    
    if (!hasBetween || !hasMessage || !hasCorrectHead) {
        output.innerHTML = "Your solution is missing required components";
        if (!hasBetween) output.innerHTML += "<br>- Need between(3, 7, N) to limit range";
        if (!hasMessage) output.innerHTML += "<br>- Need message(N, Message) to get messages";
        return;
    }
    
    output.innerHTML = `
        <p>N = 3, Message = '${flags[2]}'</p>
        <p>N = 4, Message = 'Wrong path'</p>
        <p>N = 5, Message = '${flags[2]}'</p>
        <p>N = 6, Message = 'Getting close'</p>
        <p>N = 7, Message = '${flags[2]}'</p>
        <p style="color: #0f0; font-weight: bold">
            Correct! The flag appears when N is 3, 5, or 7: ${flags[2]}
        </p>
    `;
};

// Challenge 4: SQL Group By Puzzle
window.validateSQL4 = function() {
    const code = document.getElementById("sqlCode4").value.toLowerCase();
    const output = document.getElementById("sqlOutput4");
    output.innerHTML = "";
    
    // Check for required SQL components
    const hasGroupBy = code.includes("group by flag") || code.includes("group by `flag`");
    const hasHaving = code.includes("having") && (code.includes("count(*) > 3") || code.includes("count(*) >= 4"));
    const hasSelect = code.includes("select flag") && code.includes("count(*)");
    const hasWhere = code.includes("where points = 20");
    
    if (!hasSelect) {
        output.innerHTML = "<span style='color: #f00'>Missing SELECT flag, COUNT(*)</span>";
        return;
    }
    
    if (!hasWhere) {
        output.innerHTML = "<span style='color: #f00'>Missing WHERE points = 20</span>";
        return;
    }
    
    if (!hasGroupBy) {
        output.innerHTML = "<span style='color: #f00'>Missing GROUP BY flag clause</span>";
        return;
    }
    
    if (!hasHaving) {
        output.innerHTML = "<span style='color: #f00'>Missing HAVING COUNT(*) > 3 clause</span>";
        return;
    }
    
    // If all components are present, show the result
    output.innerHTML = `
        <div style="color: #0f0; font-family: monospace;">
            <strong>Query Results:</strong><br>
            +------------------+---------+<br>
            | flag             | COUNT(*)|<br>
            +------------------+---------+<br>
            | ${flags[4]}      |    5    |<br>
            +------------------+---------+<br>
            <br>
            <strong style="color: #0f0;">Correct! Flag found: ${flags[4]}</strong>
        </div>
    `;
};

// Main function to run Python code
async function runCode(id, userCode = null) {
    const codeElement = document.getElementById(`code${id}`);
    const outputElement = document.getElementById(`output${id}`);
    userCode = userCode || codeElement.value;
    
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
        
        switch(id) {
            case 1:
                if (userCode.includes("range(5):") && capturedOutput.includes("Flag found!")) {
                    success = true;
                    output = "Correct! Flag: " + flags[1];
                } else {
                    output = "Your code didn't print correctly. Need proper for loop syntax.";
                }
                break;
                
            case 5:
            // Check if the code has proper syntax and runs without error
            if (!userCode.includes("if x > 5:")) {
                output = "Missing colon after 'if x > 5'. Python needs colons after if statements!";
                break;
            }
            
            // If syntax is correct and code executed (meaning they fixed the nested if structure)
            if (capturedOutput.length > 0) {
                success = true;
                output = "Correct! You fixed the syntax. Flag: " + flags[5];
            } else {
                output = "Check your if statement syntax - Python needs colons after conditions!";
            }
            break;

            case 6:
            // Check if the range is correct (3-7) and all numbers are printed
            const expectedOutput = "3\n4\n5\n6\n7\n";
            if (capturedOutput === expectedOutput) {
                success = true;
                output = "Correct! You fixed the range. Flag: " + flags[6];
            } else {
                output = "Your range doesn't include all numbers from 3 to 7.";
            }
            break;
                
            case 9:
            // Check for syntax fixes (colon, equality operator) AND flag output
            const hasWhileColon = userCode.includes("while i < 5:");
            const hasCorrectEquality = userCode.includes("if i == 3:");

            if (hasWhileColon && hasCorrectEquality) {
                success = true;
                output = `Correct! Loop fixed. Flag: ${flags[9]}`;
            } else {
                output = "Try again! Issues found:\n";
            }
            break;

            case 11:
            // Check if the code has the @abstractmethod decorator
            if (!userCode.includes("@abstractmethod")) {
                output = "Missing @abstractmethod decorator! Abstract methods need this decorator to enforce implementation.";
                break;
            }
            
            // Check if it imports abstractmethod
            if (!userCode.includes("abstractmethod")) {
                output = "Need to import and use @abstractmethod decorator for abstract methods.";
                break;
            }
            
            // If the code runs without error and produces the expected output
            if (capturedOutput.includes("Area:") && capturedOutput.includes("CTF{abstract_class}")) {
                success = true;
                output = "Correct! Abstract class properly implemented. Flag: " + flags[11];
            } else {
                output = "Your abstract class implementation didn't work correctly. Make sure to use @abstractmethod decorator!";
            }
            break;
                
            case 13:
            // Check if the reduce function has the nums parameter
            if (!userCode.includes("reduce(lambda x, y: x + y, nums)") && 
                !userCode.includes("reduce(lambda x, y: x + y,nums)")) {
                output = "The reduce function is missing the iterable parameter! It should be: reduce(function, iterable)";
                break;
            }
            
            // Check if the output contains the expected sum (10)
            if (capturedOutput.includes("Sum: 10")) {
                success = true;
                output = "Correct! You fixed the reduce function. Flag: " + flags[13];
            } else {
                output = "Your reduce function didn't sum the numbers correctly. Expected sum: 10";
            }
            break;
                
            case 16:
            // Check for specific fixes:
            const hasColon = userCode.includes("def reveal(self):") || 
                            userCode.includes("def reveal( self ):") || 
                            userCode.includes("def reveal(self ):") || 
                            userCode.includes("def reveal( self):");
            const hasInstance = userCode.includes("c = Challenge()");
            
            if (!hasColon) {
                output = "Missing colon after method definition and/or 'self' parameter";
            } else if (!hasInstance) {
                output = "You need to create an instance with Challenge()";
            } else {
                success = true;
                output = "Correct! You fixed: 1) method syntax 2) instance creation. Flag: " + flags[16];
            }
            break;

            case 19:
            // Check for type conversion and correct output
            const hasFloatConversion = userCode.includes("float(") || 
                                    userCode.includes("float (") ||
                                    /=\s*(float|int)\(/.test(userCode);
            const hasCorrectTotal = capturedOutput.includes("Total: 42.0");
            
            if (!hasFloatConversion) {
                output = "Incorrect total. Make sure to convert before adding";
            } else if (!hasCorrectTotal) {
                output = "Incorrect total. Make sure to convert before adding";
            } else {
                success = true;
                output = `Correct! You fixed the type conversions. Flag: ${flags[19] || "CTF{type_conversion}"}`;
            }
            break;
                
            case 20:
            const hasInheritance = /class\s+Dog\s*\(\s*Animal\s*\)/.test(userCode);
            const hasSuperCall = userCode.includes("super().__init__") || 
                                userCode.includes("super(Dog,self).__init__");
            const hasMethodOverride = /def\s+make_sound\s*\(self\)\s*:.*print\s*\(.*Woof.*\)/s.test(userCode);
            const hasCorrectOutput = capturedOutput.includes("Buddy says: Woof!");
            
            if (!hasInheritance) {
                output = "Dog class must inherit from Animal (class Dog(Animal))";
            } else if (!hasSuperCall) {
                output = "Missing super().__init__() call in Dog's __init__";
            } else if (!hasMethodOverride) {
                output = "Dog class needs to override make_sound() to print 'Woof!'";
            } else if (!hasCorrectOutput) {
                output = "Incorrect output. Expected: 'Buddy says: Woof!'";
            } else {
                success = true;
                output = `Correct! You implemented proper inheritance. Flag: ${flags[20] || "CTF{inheritance}"}`;
            }
            break;
                
            default:
                output = capturedOutput || "No output produced";
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

// Make functions available globally
window.runCode = runCode;
window.runPythonCode1 = runPythonCode1;
window.validateProlog = validateProlog;

// Base64 decoder for Challenge 10
window.decodeBase64 = function() {
    const encoded = "Q1RGe3JlY3Vyc2l2ZV9mdW5jfQ==";
    const decoded = atob(encoded);
    console.log("Challenge 10 Flag: " + decoded);
};

// ROT13 decoder for Challenge 21
window.decodeROT13 = function() {
    const encoded = "PGS{cbyzbeguvfz}";
    const decoded = encoded.replace(/[a-zA-Z]/g, function(c) {
        return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13 ? c : c - 26));
    });
    console.log("Challenge 21 Flag: " + decoded);
};

// Hex decoder for Challenge 26
window.decodeHex = function() {
    const hex = "4354467B61627374726163745F636C6173737D";
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    console.log("Challenge 26 Flag: " + str);
};

// Binary decoder for Challenge 30
window.decodeBinary = function() {
    const binary = "0100001101010100010001100111101101101100011010010111001101110100010111110110001101101111011011010111000001111101";
    let str = '';
    for (let i = 0; i < binary.length; i += 8) {
        str += String.fromCharCode(parseInt(binary.substr(i, 8), 2));
    }
    console.log("Challenge 30 Flag: " + str);
};