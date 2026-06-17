document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================
    // MECÂNICA DE ACESSIBILIDADE E TEMA
    // =========================================================
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    const dropdownToggle = document.getElementById('dropdown-toggle');
    const accessibilityMenu = document.getElementById('accessibility-menu');
    const fontDecrease = document.getElementById('font-decrease');
    const fontIncrease = document.getElementById('font-increase');
    const accessReset = document.getElementById('access-reset');

    let currentFontSize = 16; 

    // Menu Dropdown de Fonte
    dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        accessibilityMenu.classList.toggle('show');
        dropdownToggle.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!accessibilityMenu.contains(e.target) && e.target !== dropdownToggle) {
            accessibilityMenu.classList.remove('show');
            dropdownToggle.classList.remove('active');
        }
    });

    // Troca de Tema Claro / Escuro
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
        }
    });

    // Redimensionamento de fontes
    fontIncrease.addEventListener('click', () => {
        if (currentFontSize < 22) {
            currentFontSize += 1;
            document.documentElement.style.setProperty('--base-font-size', `${currentFontSize}px`);
        }
    });

    fontDecrease.addEventListener('click', () => {
        if (currentFontSize > 13) {
            currentFontSize -= 1;
            document.documentElement.style.setProperty('--base-font-size', `${currentFontSize}px`);
        }
    });

    accessReset.addEventListener('click', () => {
        currentFontSize = 16;
        document.documentElement.style.setProperty('--base-font-size', '16px');
    });

    // ELEMENTOS DE AUTENTICAÇÃO
    const loginScreen = document.getElementById('login-screen');
    const mainDashboard = document.getElementById('main-dashboard');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const loginError = document.getElementById('login-error');
    const displayUser = document.getElementById('display-user');
    const btnLogout = document.getElementById('btn-logout');

    const boxLogin = document.getElementById('box-login');
    const boxRegister = document.getElementById('box-register');
    const goToRegister = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');
    const registerForm = document.getElementById('register-form');
    const registerSuccess = document.getElementById('register-success');

    // ELEMENTOS DO DASHBOARD
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
    const historyLog = document.getElementById('history-log');

    // CONTADORES DE ESTADO
    const countTotais = document.getElementById('count-totais');
    const countDeepfakes = document.getElementById('count-deepfakes');
    const countAutenticos = document.getElementById('count-autenticos');
    const countSuspeitos = document.getElementById('count-suspeitos');

    let totalAnalises = 0;
    let totalDeepfakes = 0;
    let totalAutenticos = 0;
    let totalSuspeitos = 0;

    let currentTab = 'tab-imagem';
    let hasImage = false;
    let hasValidText = false;
    let currentFileName = '';

    // =========================================================
    // MECÂNICA DE AUTENTICAÇÃO (LOGIN / REGISTRO)
    // =========================================================
    goToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        boxLogin.style.display = 'none';
        boxRegister.style.display = 'block';
    });

    goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        boxRegister.style.display = 'none';
        boxLogin.style.display = 'block';
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        registerSuccess.style.display = 'block';
        
        setTimeout(() => {
            registerSuccess.style.display = 'none';
            usernameInput.value = document.getElementById('reg-username').value;
            registerForm.reset();
            boxRegister.style.display = 'none';
            boxLogin.style.display = 'block';
        }, 1500);
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        
        if (username !== "") { 
            loginScreen.style.display = 'none';
            mainDashboard.style.display = 'flex';
            displayUser.textContent = username;
            loginError.style.display = 'none';
            loginForm.reset();
        } else {
            loginError.style.display = 'block';
        }
    });

    btnLogout.addEventListener('click', () => {
        mainDashboard.style.display = 'none';
        loginScreen.style.display = 'flex';
        resetDashboardFields();
    });

    function resetDashboardFields() {
        imagePreview.src = "";
        imagePreview.style.display = 'none';
        uploadIcon.style.display = 'block';
        dropText.style.display = 'block';
        fileInfo.style.display = 'block';
        fileInput.value = "";
        hasImage = false;

        textInput.value = "";
        charCount.textContent = "0 / 20 min";
        hasValidText = false;

        emptyResults.style.display = 'flex';
        resultsDisplay.style.display = 'none';
        disableButton();
    }

    // =========================================================
    // RESOLUÇÃO DO BUG DO SUCESSO DE ALTERNÂNCIA DE ABAS (TABS)
    // =========================================================
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            tab.classList.add('active');
            currentTab = tab.getAttribute('data-tab');
            
            // Ativa o container correto de forma segura
            document.getElementById(currentTab).classList.add('active');
            
            checkValidation();
        });
    });

    // =========================================================
    // CONTROLE DE UPLOAD DE IMAGEM
    // =========================================================
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        fileInput.click();
    });

    dropZone.addEventListener('click', () => fileInput.click());

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

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) handleFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (file.type.startsWith('image/')) {
            currentFileName = file.name;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
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

    // =========================================================
    // CAMPO DE TEXTO E VALIDAÇÕES
    // =========================================================
    textInput.addEventListener('input', (e) => {
        const length = e.target.value.length;
        charCount.textContent = `${length} / 20 min`;
        
        hasValidText = length >= 20;
        checkValidation();
    });

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

    // =========================================================
    // BOTÃO DE ANÁLISE E GERAÇÃO DO HISTÓRICO
    // =========================================================
    btnAnalyze.addEventListener('click', () => {
        if (!btnAnalyze.classList.contains('enabled')) return;

        emptyResults.style.display = 'none';
        resultsDisplay.style.display = 'flex';
        
        const statuses = ['DEEPFAKE', 'AUTÊNTICO', 'SUSPEITOS'];
        const resultadoFinal = statuses[Math.floor(Math.random() * statuses.length)];

        totalAnalises++;
        if (resultadoFinal === 'DEEPFAKE') totalDeepfakes++;
        if (resultadoFinal === 'AUTÊNTICO') totalAutenticos++;
        if (resultadoFinal === 'SUSPEITOS') totalSuspeitos++;

        countTotais.textContent = String(totalAnalises).padStart(3, '0');
        countDeepfakes.textContent = String(totalDeepfakes).padStart(3, '0');
        countAutenticos.textContent = String(totalAutenticos).padStart(3, '0');
        countSuspeitos.textContent = String(totalSuspeitos).padStart(3, '0');

        const agora = new Date();
        const dataHoraFormatada = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        let tipoAnalise = '';
        let origemInfo = '';

        const badgeResultClass = resultadoFinal === 'DEEPFAKE' ? 'badge-deepfake' : resultadoFinal === 'AUTÊNTICO' ? 'badge-autentico' : 'badge-suspeito';

        if (currentTab === 'tab-imagem') {
            tipoAnalise = 'Imagem';
            origemInfo = currentFileName || 'imagem_upload.png';

            resultsDisplay.innerHTML = `
                <h3><i class="fa-solid fa-chart-pie"></i> Resultado da Análise de Imagem</h3>
                <p class="simulated-text">Status retornado: <span class="badge ${badgeResultClass}">${resultadoFinal}</span></p>
                <p class="sub-placeholder-text" style="margin-top:15px;">Arquivo "${origemInfo}" escaneado com sucesso e computado no banco.</p>
            `;
        } else {
            tipoAnalise = 'Texto';
            origemInfo = `"${textInput.value.substring(0, 18)}..."`;

            resultsDisplay.innerHTML = `
                <h3><i class="fa-solid fa-chart-pie"></i> Resultado da Análise de Texto</h3>
                <p class="simulated-text">Status retornado: <span class="badge ${badgeResultClass}">${resultadoFinal}</span></p>
                <p class="sub-placeholder-text" style="margin-top:15px;">String de caracteres validada e adicionada à auditoria.</p>
            `;
        }

        const novaLinha = document.createElement('tr');
        novaLinha.innerHTML = `
            <td>${dataHoraFormatada}</td>
            <td><strong>${tipoAnalise}</strong></td>
            <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${origemInfo}</td>
            <td><span class="badge ${badgeResultClass}">${resultadoFinal}</span></td>
        `;

        historyLog.insertBefore(novaLinha, historyLog.firstChild);
    });
});