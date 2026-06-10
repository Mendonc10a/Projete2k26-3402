document.addEventListener('DOMContentLoaded', () => {
    
    // VARIÁVEIS DOS ELEMENTOS
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const imagePreview = document.getElementById('image-preview');
    const uploadIcon = document.querySelector('.upload-icon');
    const dropText = document.querySelector('.drop-text');
    const fileInfo = document.querySelector('.file-info');
    
    const textInput = document.getElementById('text-input');
    const charCount = document.querySelector('.char-count');
    const btnAnalyze = document.getElementById('btn-analyze');
    
    const emptyResults = document.getElementById('empty-results');
    const resultsDisplay = document.getElementById('results-display');

    let currentTab = 'tab-imagem';
    let hasImage = false;
    let hasValidText = false;

    // 1. ALTERNÂNCIA DE ABAS (TABS)
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            tab.classList.add('active');
            currentTab = tab.getAttribute('data-tab');
            document.getElementById(currentTab).classList.add('active');
            
            checkValidation();
        });
    });

    // 2. LÓGICA DE UPLOAD DE IMAGEM
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita bugar o clique na dropzone
        fileInput.click();
    });

    dropZone.addEventListener('click', () => fileInput.click());

    // Efeito drag over visual
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        }, false);
    });

    // Manipular arquivo solto na área
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) handleFile(files[0]);
    });

    // Manipular arquivo selecionado no explorador
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Exibe o preview e esconde os textos padrão da área
                imagePreview.src = reader.result;
                imagePreview.style.display = 'block';
                uploadIcon.style.display = 'none';
                dropText.style.display = 'none';
                fileInfo.style.display = 'none';
                
                hasImage = true;
                checkValidation();
            };
        }
    }

    // 3. MONITORAMENTO DO CAMPO DE TEXTO
    textInput.addEventListener('input', (e) => {
        const length = e.target.value.length;
        charCount.textContent = `${length} / 20 min`;
        
        hasValidText = length >= 20;
        checkValidation();
    });

    // 4. VALIDAÇÃO DO BOTÃO "INICIAR ANÁLISE"
    function checkValidation() {
        if (currentTab === 'tab-imagem' && hasImage) {
            enableButton();
        } else if (currentTab === 'tab-texto' && hasValidText) {
            enableButton();
        } else {
            disableButton();
        }
    }

    function enableButton() {
        btnAnalyze.removeAttribute('disabled');
        btnAnalyze.classList.add('enabled');
    }

    function disableButton() {
        btnAnalyze.setAttribute('disabled', 'true');
        btnAnalyze.classList.remove('enabled');
    }

    // 5. CLIQUE DO BOTÃO DE ANÁLISE (SIMULAÇÃO)
    btnAnalyze.addEventListener('click', () => {
        if (!btnAnalyze.classList.contains('enabled')) return;

        // Limpa estado anterior e simula processamento visual rápido
        emptyResults.style.display = 'none';
        resultsDisplay.style.display = 'flex';
        
        // Aqui dentro, futuramente, entrará o fetch() para chamar a API da IA
        if (currentTab === 'tab-imagem') {
            resultsDisplay.innerHTML = `
                <h3><i class="fa-solid fa-chart-pie"></i> Resultado da Análise de Imagem</h3>
                <p class="simulated-text" style="color: #00e5ff;">[IA Pronta para Integração]</p>
                <p class="sub-placeholder-text" style="margin-top:10px;">A imagem foi carregada com sucesso no front-end.</p>
            `;
        } else {
            resultsDisplay.innerHTML = `
                <h3><i class="fa-solid fa-chart-pie"></i> Resultado da Análise de Texto</h3>
                <p class="simulated-text" style="color: #00e5ff;">[IA Pronta para Integração]</p>
                <p class="sub-placeholder-text" style="margin-top:10px;">Texto capturado: "${textInput.value.substring(0, 40)}..."</p>
            `;
        }
    });
});