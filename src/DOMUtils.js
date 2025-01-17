export async function loadContent() {
    const response = await fetch('public/content.json'); // Adjust the path if necessary
    const content = await response.json();
    return content;
}
