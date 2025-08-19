// Registra o Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration.scope);
            })
            .catch(error => {
                console.log('Falha no registro do Service Worker:', error);
            });
    });
}

// --- 1. Seleção de Elementos e Variáveis de Estado ---
const steps = document.querySelectorAll('.step');
const welcomeStep = document.getElementById('welcome-step');
const suspicionStep = document.getElementById('suspicion-step');
const tepQuestionsStep = document.getElementById('tep-questions-step');
const tvpQuestionsStep = document.getElementById('tvp-questions-step');
const resultsStep = document.getElementById('results-step');

const startBtn = document.getElementById('start-btn');
const selectSuspicionBtn = document.getElementById('select-suspicion-btn');
const calculateTepBtn = document.getElementById('calculate-tep-btn');
const calculateTvpBtn = document.getElementById('calculate-tvp-btn');
const restartBtn = document.getElementById('restart-btn');

let suspicionChoice = '';

// --- 2. Funções de Navegação ---

function showStep(stepToShow) {
    steps.forEach(step => {
        step.classList.add('hidden');
    });
    stepToShow.classList.remove('hidden');
}

// --- 3. Event Listeners para a Navegação ---

startBtn.addEventListener('click', () => {
    showStep(suspicionStep);
});

const tepRadio = document.getElementById('suspeita-tep');
const tvpRadio = document.getElementById('suspeita-tvp');

tepRadio.addEventListener('change', () => {
    if (tepRadio.checked) {
        suspicionChoice = 'tep';
        showStep(tepQuestionsStep);
    }
});
tvpRadio.addEventListener('change', () => {
    if (tvpRadio.checked) {
        suspicionChoice = 'tvp';
        showStep(tvpQuestionsStep);
    }
});

restartBtn.addEventListener('click', () => {
    location.reload();
});

// --- 4. Lógica de Cálculo dos Escores ---

calculateTepBtn.addEventListener('click', () => {
    let wellsScore = 0;
    let genevaScore = 0;

    // Lógica para TEP (Wells e Genebra)
    if (document.getElementById('tep-cancer').checked) { wellsScore += 1; genevaScore += 1; }
    if (document.getElementById('tep-hemoptise').checked) { wellsScore += 1; genevaScore += 1; }
    if (document.getElementById('tep-historia-prev').checked) { wellsScore += 1; genevaScore += 3; }
    if (document.getElementById('tep-cirurgia-recente').checked) { wellsScore += 1; genevaScore += 3; }
    if (document.getElementById('tep-outra-doenca').checked) { wellsScore += 1; }
    if (document.getElementById('tep-taquicardia-100').checked) { wellsScore += 1; genevaScore += 5; }
    if (document.getElementById('tep-taquicardia-75').checked) { genevaScore += 3; }
    if (document.getElementById('tep-sinais-tvp').checked) { wellsScore += 3; genevaScore += 4; }
    if (document.getElementById('tep-idade').checked) { genevaScore += 1; }

    displayResults(wellsScore, genevaScore);
});

calculateTvpBtn.addEventListener('click', () => {
    let tvpScore = 0;

    // Lógica para TVP (Wells)
    if (document.getElementById('tvp-cancer').checked) { tvpScore += 1; }
    if (document.getElementById('tvp-imobilizacao').checked) { tvpScore += 1; }
    if (document.getElementById('tvp-acamado').checked) { tvpScore += 1; }
    if (document.getElementById('tvp-dor-veia').checked) { tvpScore += 1; }
    if (document.getElementById('tvp-inchaco').checked) { tvpScore += 1; }
    if (document.getElementById('tvp-edema-3cm').checked) { tvpScore += 1; }
    if (document.getElementById('tvp-edema-cacifo').checked) { tvpScore += 1; }
    if (document.getElementById('tvp-veias-colaterais').checked) { tvpScore += 1; }
    if (document.getElementById('tvp-historia-prev').checked) { tvpScore += 1; }
    if (document.getElementById('tvp-diagnostico-alternativo').checked) { tvpScore -= 2; }

    displayResults(tvpScore);
});

// --- 5. Lógica de Apresentação dos Resultados e Conduta ---

function displayResults(score1, score2) {
    showStep(resultsStep);
    
    document.getElementById('tep-results').style.display = 'none';
    document.getElementById('tvp-results').style.display = 'none';

    if (suspicionChoice === 'tep') {
        document.getElementById('tep-results').style.display = 'flex';
        
        let wellsRisk = '';
        if (score1 <= 4) {
            wellsRisk = 'Baixo Risco';
        } else {
            wellsRisk = 'Alto Risco';
        }
        document.getElementById('wells-score').textContent = score1;
        document.getElementById('wells-risk').textContent = wellsRisk;
        
        let genevaRisk = '';
        if (score2 <= 3) {
            genevaRisk = 'Baixo Risco';
        } else if (score2 <= 10) {
            genevaRisk = 'Risco Intermediário';
        } else {
            genevaRisk = 'Alto Risco';
        }
        document.getElementById('geneva-score').textContent = score2;
        document.getElementById('geneva-risk').textContent = genevaRisk;
        
        document.getElementById('next-steps-guidance').innerHTML = `
            <h3>Próximos Passos (TEP)</h3>
            <p>Com base na sua avaliação, a conduta clínica recomendada é:</p>
            <ul>
                <li><strong>Se escore de Wells for Baixo Risco:</strong> Realizar dosagem de D-Dímero. Se for negativo, TEP é improvável. Se for positivo, prosseguir para Angio-TC de Tórax.</li>
                <li><strong>Se escore de Wells for Alto Risco:</strong> Prosseguir diretamente para Angio-TC de Tórax.</li>
            </ul>
        `;

    } else if (suspicionChoice === 'tvp') {
        document.getElementById('tvp-results').style.display = 'block';

        let tvpRisk = '';
        if (score1 >= 2) {
            tvpRisk = 'Provável';
        } else {
            tvpRisk = 'Improvável';
        }
        document.getElementById('wells-tvp-score').textContent = score1;
        document.getElementById('wells-tvp-risk').textContent = tvpRisk;

        document.getElementById('next-steps-guidance').innerHTML = `
            <h3>Próximos Passos (TVP)</h3>
            <p>Com base na sua avaliação, a conduta clínica recomendada é:</p>
            <ul>
                <li><strong>Se escore for Provável:</strong> Prosseguir diretamente para Eco-Doppler Venoso de Membros Inferiores.</li>
                <li><strong>Se escore for Improvável:</strong> Realizar dosagem de D-Dímero. Se for negativo, TVP é improvável. Se for positivo, prosseguir para Eco-Doppler Venoso.</li>
            </ul>
        `;
    }
}

