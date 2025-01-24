const overlayContainer = document.getElementById('overlay_container');
const overlayText = document.getElementById('overlay_text');

const fullText = "Santiago Andres Pinzón";
const beforeReplaceText = "Santiago ";
const replacementText = "Pinzón";
let index = 0;
let deleting = false;
let typingReplacement = false;

function typeAnimation() {
    if (!deleting && !typingReplacement && index < fullText.length) {
        overlayText.textContent += fullText[index];
        index++;
    } else if (!deleting && index === fullText.length) {
        setTimeout(() => (deleting = true), 1000);
    } else if (deleting && overlayText.textContent.length > beforeReplaceText.length) {
        overlayText.textContent = overlayText.textContent.slice(0, -1);
    } else if (deleting && overlayText.textContent.length === beforeReplaceText.length) {
        deleting = false;
        typingReplacement = true;
        index = 0;
    } else if (typingReplacement && index < replacementText.length) {
        overlayText.textContent += replacementText[index];
        index++;
    } else if (typingReplacement && index === replacementText.length) {
        setTimeout(hideOverlay, 1000);
        return;
    }

    setTimeout(typeAnimation, deleting ? 100 : 150);
}

export function showOverlay() {
    overlayContainer.style.display = 'block';
    typeAnimation();
}

function hideOverlay() {
    overlayContainer.style.display = 'none';
}
