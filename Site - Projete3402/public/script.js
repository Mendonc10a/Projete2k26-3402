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

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
        }
    });

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

    // =========================================================
    // ELEMENTOS DE AUTENTICAÇÃO
    // =========================================================
    const loginScreen = document.getElementById('login-screen');
    const mainDashboard = document.getElementById('main-dashboard');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const displayUser = document.getElementById('display-user');
    const btnLogout = document.getElementById('btn-logout');

    const boxLogin = document.getElementById('box-login');
    const boxRegister = document.getElementById('box-register');
    const goToRegister = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');
    const registerForm = document.getElementById('register-form');
    const registerSuccess = document.getElementById('register-success');
    const registerError = document.getElementById('register-error');

    // =========================================================
    // ELEMENTOS DO DASHBOARD
    // =========================================================
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

    const countTotais = document.getElementById('count-totais');
    const countDeepfakes = document.getElementById('count-deepfakes');
    const countAutenticos = document.getElementById('count-autenticos');
    const countSuspeitos = document.getElementById('count-suspeitos');

    let currentTab = 'tab-imagem';
    let hasImage = false;
    let hasValidText = false;
    let currentFileName = '';

    // =========================================================
    // HELPERS DE API
    // =========================================================
    async function apiRequest(url, options = {}) {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            ...options
        });
        let data = {};
        try { data = await res.json(); } catch (e) { /* corpo vazio */ }
        if (!res.ok) {
            const err = new Error(data.error || 'Erro na requisição.');
            err.status = res.status;
            throw err;
        }
        return data;
    }

    // =========================================================
    // SESSÃO — RESTAURA LOGIN AO CARREGAR A PÁGINA
    // =========================================================
    (async function initSession() {
        try {
            const { user } = await apiRequest('/api/me');
            await enterDashboard(user);
        } catch (e) {
            loginScreen.style.display = 'flex';
            mainDashboard.style.display = 'none';
        }
    })();

    async function enterDashboard(user) {
        loginScreen.style.display = 'none';
        mainDashboard.style.display = 'flex';
        displayUser.textContent = user.username;
        await loadHistoryAndCounters();
    }

    async function loadHistoryAndCounters() {
        try {
            const { history, counters } = await apiRequest('/api/history');
            renderCounters(counters);
            renderHistory(history);
        } catch (e) {
            console.error('Falha ao carregar histórico:', e);
        }
    }

    function renderCounters(counters) {
        countTotais.textContent = String(counters.total).padStart(3, '0');
        countDeepfakes.textContent = String(counters.deepfakes).padStart(3, '0');
        countAutenticos.textContent = String(counters.autenticos).padStart(3, '0');
        countSuspeitos.textContent = String(counters.suspeitos).padStart(3, '0');
    }

    function badgeClassFor(resultado) {
        return resultado === 'DEEPFAKE' ? 'badge-deepfake'
            : resultado === 'AUTÊNTICO' ? 'badge-autentico'
            : 'badge-suspeito';
    }

    function renderHistory(rows) {
        historyLog.innerHTML = '';
        rows.forEach(row => {
            const dataFormatada = new Date(row.created_at)
                .toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dataFormatada}</td>
                <td><strong>${row.tipo}</strong></td>
                <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${row.origem}</td>
                <td><span class="badge ${badgeClassFor(row.resultado)}">${row.resultado}</span></td>
            `;
            historyLog.appendChild(tr);
        });
    }

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

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerError.style.display = 'none';

        const email = document.getElementById('reg-email').value.trim();
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;

        try {
            await apiRequest('/api/register', {
                method: 'POST',
                body: JSON.stringify({ email, username, password })
            });

            registerSuccess.style.display = 'block';
            setTimeout(async () => {
                registerSuccess.style.display = 'none';
                registerForm.reset();
                boxRegister.style.display = 'none';
                boxLogin.style.display = 'block';
                usernameInput.value = username;
            }, 1200);
        } catch (err) {
            registerError.textContent = err.message;
            registerError.style.display = 'block';
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.style.display = 'none';

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        try {
            const { user } = await apiRequest('/api/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            loginForm.reset();
            await enterDashboard(user);
        } catch (err) {
            loginError.textContent = err.message || 'Usuário ou senha incorretos!';
            loginError.style.display = 'block';
        }
    });

    btnLogout.addEventListener('click', async () => {
        try {
            await apiRequest('/api/logout', { method: 'POST' });
        } catch (e) { /* ignora erro de logout */ }
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
    // ABAS (TABS)
    // =========================================================
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
    // BOTÃO DE ANÁLISE — SALVA O RESULTADO NO BANCO DE DADOS
    // =========================================================
    btnAnalyze.addEventListener('click', async () => {
        if (!btnAnalyze.classList.contains('enabled')) return;

        emptyResults.style.display = 'none';
        resultsDisplay.style.display = 'flex';

        // Simulação do resultado da IA (substitua por uma chamada real ao seu modelo quando disponível)
        const statuses = ['DEEPFAKE', 'AUTÊNTICO', 'SUSPEITOS'];
        const resultadoFinal = statuses[Math.floor(Math.random() * statuses.length)];
        const badgeResultClass = badgeClassFor(resultadoFinal);

        let tipoAnalise = '';
        let origemInfo = '';

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

        try {
            const { history, counters } = await apiRequest('/api/history', {
                method: 'POST',
                body: JSON.stringify({ tipo: tipoAnalise, origem: origemInfo, resultado: resultadoFinal })
            });
            renderCounters(counters);
            renderHistory(history);
        } catch (err) {
            console.error('Falha ao salvar análise no banco de dados:', err);
        }
    });
});
