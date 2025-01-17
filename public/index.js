import {loadContent} from "../src/DOMUtils.js";
import {commandParser} from "../src/terminal.js"

const terminalContainer = document.getElementById('terminal_container');
const output = document.getElementById('output_box');
const inputField = document.getElementById('terminal_input');
window.currentDir = "";
window.prefix = "~/antiyago/"
window.site_content = null;

document.addEventListener("DOMContentLoaded", async () => {
    window.site_content = await loadContent();
    const userAgent = navigator.userAgent;
    const site_home = prefix + window.site_content.content[0].name;
    window.currentDir = site_home;
    const site_version = window.site_content.site.version;
    setStatus(site_home, userAgent, site_version);
})

function setStatus(dir, browser, version) {
    const statusDiv = document.getElementById('status_bar');
    const dirSpan = statusDiv.firstElementChild;
    dirSpan.textContent = dir;

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
    const resultLine = commandParser(command);
    if (resultLine != '') {

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
      outputLine.appendChild(resultLine);
      output.appendChild(outputLine);
    }
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
