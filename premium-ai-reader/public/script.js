let sentences = [];
let currentIndex = 0;
const audioPlayer = new Audio();

// Cargar PDF
document.getElementById('pdf-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map(item => item.str).join(" ") + " ";
        }

        sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
        document.getElementById('total-sentences').innerText = sentences.length;
        renderText();
    };
    reader.readAsArrayBuffer(file);
});

function renderText() {
    const container = document.getElementById('text-content');
    container.innerHTML = sentences.map((s, i) => `<span id="s-${i}">${s}</span>`).join(" ");
}

async function playCurrent() {
    if (currentIndex >= sentences.length) return;

    // Resaltar
    document.querySelectorAll('span').forEach(el => el.classList.remove('active'));
    const currentEl = document.getElementById(`s-${currentIndex}`);
    currentEl.classList.add('active');
    currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Llamada al servidor propio
    const response = await fetch('/api/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentences[currentIndex] })
    });

    const blob = await response.blob();
    audioPlayer.src = URL.createObjectURL(blob);
    audioPlayer.play();

    audioPlayer.onended = () => {
        currentIndex++;
        playCurrent();
    };
}

document.getElementById('btn-play').addEventListener('click', playCurrent);
