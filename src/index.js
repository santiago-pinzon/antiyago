const terminalContainer = document.getElementById('terminal_container');
const output = document.getElementById('output_box');
const inputField = document.getElementById('terminal_input');
const currentDir = "~/home/antiyago";
let site_content = null;

document.addEventListener("DOMContentLoaded", async () => {
    await loadContent();
    const userAgent = navigator.userAgent;
    const site_home = "~/antiyago/" + site_content.content[0].name;
    const site_version = site_content.site.version;
    setStatus(site_home, userAgent, site_version);
})

async function loadContent() {
    const response = await fetch('public/index.json'); // Adjust the path if necessary
    const content = await response.json();
    site_content = content;
}

function setStatus(dir, browser, version) {
    const statusDiv = document.getElementById('status_bar');
    const dirSpan = statusDiv.firstElementChild;
    dirSpan.textContent = dir;

    console.log(browser);

    const browserIcon = getBrowserIcon(browser);
    const versionText = '(v' + version + ')';

    statusDiv.innerHTML = ''; // Clear existing content
    statusDiv.appendChild(dirSpan); // Re-add the <span>
    statusDiv.append(' on ' + browserIcon + ' ' + versionText);
}

function getBrowserIcon(browser) {
  if (browser.includes('Firefox')) {
        return '🦊'; // Firefox
    } else if (browser.includes('Chrome')) {
        return '🌐'; // Chrome
    } else if (browser.includes('Safari')) {
        return '🍎'; // Safari
    } else {
        return '💻'; // Default icon for unknown browsers
    }
}

function updateOutput(command) {
    const outputLine = document.createElement('div');
    outputLine.className = 'output';

    // Status
    const dirDiv = document.getElementById('status_bar').cloneNode(true);
    outputLine.appendChild(dirDiv);

    // Entered Command
    const commandLine = document.createElement('div');
    commandLine.textContent = `> ${command}`;
    commandLine.className = 'command-input';
    outputLine.appendChild(commandLine);

    // Result of the command
    const resultLine = document.createElement('div');
    resultLine.textContent = commandParser(command, commands);
    resultLine.className = 'command-output';
    outputLine.appendChild(resultLine);

    output.appendChild(outputLine);
    terminalContainer.scrollTop = terminalContainer.scrollHeight;
}

// Event listener for input field
inputField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const command = inputField.value.trim(); // Get the input value
        if (command) {
            updateOutput(command); // Move the command to the output
        }
        inputField.value = ''; // Clear the input field
    }
});

const commands = {
    echo: (args) => args.join(' '),
    help: () => "Available commands: echo, help, clear, ls, cd",
    clear: () => {
        document.getElementById('output').innerHTML = ''; // Clear terminal output
        return '';
    },
    ls: () => "file1.txt  file2.txt  directory/",
    cd: (args) => {
        if (!args.length) return "cd: missing argument";
        return `Changed directory to ${args[0]}`;
    },
};

const commandParser = (input, commands) => {
    const parts = input.trim().split(/\s+/); // Split input into command and args
    const command = parts[0]; // First word is the command
    const args = parts.slice(1); // Remaining parts are the arguments

    if (commands[command]) {
        return commands[command](args); // Execute the command
    } else {
        return `Command not found: ${command}`; // Handle unknown commands
    }
};
