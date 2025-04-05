class SebdermAnalysis {
    constructor() {
        this.charts = new SebdermCharts();
        this.data = [];
        this.timeRange = 30; // default: ultimo mese
        this.initialize();
    }

    initialize() {
        this.loadData();
        this.setupEventListeners();
        this.updateAnalysis();
    }

    loadData() {
        this.data = JSON.parse(localStorage.getItem('sebdermEntries')) || [];
        this.data.sort((a, b) => new Date(a.data) - new Date(b.data));
    }

    setupEventListeners() {
        document.getElementById('timeRange').addEventListener('change', (e) => {
            this.timeRange = parseInt(e.target.value);
            this.updateAnalysis();
        });
    }

    updateAnalysis() {
        this.updateSummary();
        this.updateCharts();
        this.updatePatterns();
        this.updateSuggestions();
        this.updateProductsEffectiveness();
    }

    getFilteredData() {
        if (this.timeRange === 'all') return this.data;
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.timeRange);
        return this.data.filter(entry => new Date(entry.data) >= cutoffDate);
    }

    calculateCorrelations(data) {
        const correlations = {};
        const skinConditions = data.map(entry => (
            parseInt(entry.pelle.zonaT) + 
            parseInt(entry.pelle.guance) + 
            parseInt(entry.pelle.cuoio)
        ) / 3);

        // Correlazione con ore di sonno
        const sleepHours = data.map(entry => parseFloat(entry.sonno.ore) || 0);
        correlations.sonno = this.calculateCorrelation(sleepHours, skinConditions);

        // Correlazione con stress
        const stressLevels = data.map(entry => parseInt(entry.stress.livello));
        correlations.stress = this.calculateCorrelation(stressLevels, skinConditions);

        // Correlazione con ore all'aria aperta
        const outdoorHours = data.map(entry => parseFloat(entry.stress.oreAria) || 0);
        correlations.ariaAperta = this.calculateCorrelation(outdoorHours, skinConditions);

        return correlations;
    }

    calculateCorrelation(array1, array2) {
        return ss.correlation(array1, array2);
    }

    updateSummary() {
        const data = this.getFilteredData();
        const summary = document.getElementById('summary');
        
        if (data.length === 0) {
            summary.innerHTML = '<p>Nessun dato disponibile per il periodo selezionato</p>';
            return;
        }

        const averageSkinCondition = data.reduce((acc, entry) => {
            return acc + (
                parseInt(entry.pelle.zonaT) + 
                parseInt(entry.pelle.guance) + 
                parseInt(entry.pelle.cuoio)
            ) / 3;
        }, 0) / data.length;

        const correlations = this.calculateCorrelations(data);
        
        summary.innerHTML = `
            <p><strong>Periodo analizzato:</strong> ${data.length} giorni</p>
            <p><strong>Condizione media della pelle:</strong> ${averageSkinCondition.toFixed(1)}%</p>
            <p><strong>Correlazioni principali:</strong></p>
            <ul>
                ${Object.entries(correlations)
                    .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
                    .map(([factor, value]) => `
                        <li>${factor}: ${(value * 100).toFixed(1)}%</li>
                    `).join('')}
            </ul>
        `;
    }

    updateCharts() {
        const data = this.getFilteredData();
        
        // Dati per il grafico dell'andamento
        const chartData = {
            dates: data.map(entry => entry.data),
            zonaT: data.map(entry => entry.pelle.zonaT),
            guance: data.map(entry => entry.pelle.guance),
            cuoio: data.map(entry => entry.pelle.cuoio)
        };

        this.charts.createSkinTrendChart(chartData);
        this.charts.createCorrelationChart(this.calculateCorrelations(data));
    }

    updatePatterns() {
        const data = this.getFilteredData();
        const patterns = document.getElementById('patterns');
        
        if (data.length < 7) {
            patterns.innerHTML = '<p>Servono almeno 7 giorni di dati per identificare pattern</p>';
            return;
        }

        const patternsList = this.identifyPatterns(data);
        
        patterns.innerHTML = `
            <ul>
                ${patternsList.map(pattern => `
                    <li class="pattern-item">${pattern}</li>
                `).join('')}
            </ul>
        `;
    }

    identifyPatterns(data) {
        const patterns = [];
        
        // Analisi sonno
        const goodSleepDays = data.filter(entry => parseFloat(entry.sonno.ore) >= 7);
        const goodSkinOnGoodSleep = goodSleepDays.filter(entry => 
            (parseInt(entry.pelle.zonaT) + parseInt(entry.pelle.guance) + parseInt(entry.pelle.cuoio)) / 3 < 30
        );

        if (goodSkinOnGoodSleep.length / goodSleepDays.length > 0.7) {
            patterns.push("Il sonno adeguato (>7 ore) sembra migliorare le condizioni della pelle");
        }

        // Analisi stress
        const lowStressDays = data.filter(entry => parseInt(entry.stress.livello) <= 4);
        const goodSkinOnLowStress = lowStressDays.filter(entry => 
            (parseInt(entry.pelle.zonaT) + parseInt(entry.pelle.guance) + parseInt(entry.pelle.cuoio)) / 3 < 30
        );

        if (goodSkinOnLowStress.length / lowStressDays.length > 0.7) {
            patterns.push("Bassi livelli di stress correlano con migliori condizioni della pelle");
        }

        return patterns;
    }

    updateSuggestions() {
        const data = this.getFilteredData();
        const suggestions = document.getElementById('suggestions');
        
        if (data.length < 7) {
            suggestions.innerHTML = '<p>Servono almeno 7 giorni di dati per generare suggerimenti</p>';
            return;
        }

        const correlations = this.calculateCorrelations(data);
        const suggestionsList = this.generateSuggestions(correlations, data);
        
        suggestions.innerHTML = `
            <ul>
                ${suggestionsList.map(suggestion => `
                    <li class="suggestion-item">${suggestion}</li>
                `).join('')}
            </ul>
        `;
    }

    generateSuggestions(correlations, data) {
        const suggestions = [];

        // Analisi correlazioni
        if (correlations.sonno > 0.5) {
            suggestions.push("Il sonno ha un impatto positivo significativo. Cerca di mantenere un orario regolare.");
        }
        if (correlations.stress < -0.5) {
            suggestions.push("Lo stress sembra peggiorare le condizioni. Considera tecniche di gestione dello stress.");
        }
        if (correlations.ariaAperta > 0.3) {
            suggestions.push("L'attività all'aria aperta sembra benefica. Cerca di passare più tempo all'aperto.");
        }

        return suggestions;
    }

    updateProductsEffectiveness() {
        const data = this.getFilteredData();
        const productsDiv = document.getElementById('productsEffectiveness');
        
        if (data.length < 14) {
            productsDiv.innerHTML = '<p>Servono almeno 14 giorni di dati per analizzare l\'efficacia dei prodotti</p>';
            return;
        }

        const productsAnalysis = this.analyzeProducts(data);
        
        productsDiv.innerHTML = `
            <ul>
                ${Object.entries(productsAnalysis).map(([product, effectiveness]) => `
                    <li class="product-item">
                        <strong>${product}:</strong> 
                        Efficacia: ${effectiveness.score}%
                        (usato ${effectiveness.usageDays} giorni)
                    </li>
                `).join('')}
            </ul>
        `;
    }

    analyzeProducts(data) {
        const products = {};
        
        data.forEach(entry => {
            const skinProducts = [
                ...(entry.skincare.prodottiMattina || '').split(','),
                ...(entry.skincare.prodottiSera || '').split(',')
            ].map(p => p.trim()).filter(p => p);

            skinProducts.forEach(product => {
                if (!products[product]) {
                    products[product] = {
                        usageDays: 0,
                        totalScore: 0
                    };
                }

                const skinScore = (
                    parseInt(entry.pelle.zonaT) + 
                    parseInt(entry.pelle.guance) + 
                    parseInt(entry.pelle.cuoio)
                ) / 3;

                products[product].usageDays++;
                products[product].totalScore += skinScore;
            });
        });

        // Calcola l'efficacia media
        return Object.fromEntries(
            Object.entries(products).map(([product, stats]) => [
                product,
                {
                    usageDays: stats.usageDays,
                    score: (100 - (stats.totalScore / stats.usageDays)).toFixed(1)
                }
            ])
        );
    }
}

// Inizializza l'analisi quando la pagina è caricata
document.addEventListener('DOMContentLoaded', () => {
    new SebdermAnalysis();

    // Aggiungi questa nuova classe per l'analisi testuale
class TextAnalysis {
    constructor() {
        this.keywords = new Map();
        this.commonWords = new Set(['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'e', 'è', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra']);
    }

    analyzeNote(note, skinCondition) {
        // Pulisci e dividi il testo in parole
        const words = note.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .split(/\s+/);

        // Analizza ogni parola
        words.forEach(word => {
            if (word.length > 2 && !this.commonWords.has(word)) {
                if (!this.keywords.has(word)) {
                    this.keywords.set(word, {
                        count: 0,
                        totalSkinCondition: 0,
                        occurrences: []
                    });
                }

                const keywordData = this.keywords.get(word);
                keywordData.count++;
                keywordData.totalSkinCondition += skinCondition;
                keywordData.occurrences.push({
                    date: new Date(),
                    skinCondition: skinCondition
                });
            }
        });
    }

    getKeywordAnalysis() {
        const analysis = [];
        this.keywords.forEach((data, keyword) => {
            const averageSkinCondition = data.totalSkinCondition / data.count;
            analysis.push({
                keyword: keyword,
                count: data.count,
                averageSkinCondition: averageSkinCondition,
                correlation: this.calculateCorrelation(data.occurrences)
            });
        });

        return analysis.sort((a, b) => b.count - a.count);
    }

    calculateCorrelation(occurrences) {
        // Calcola la correlazione tra la presenza della parola e la condizione della pelle
        if (occurrences.length < 3) return 0;

        const averageCondition = occurrences.reduce((sum, occ) => sum + occ.skinCondition, 0) / occurrences.length;
        return averageCondition > 50 ? 'negativa' : 'positiva';
    }
}

// Modifica la classe SebdermAnalysis esistente aggiungendo:
class SebdermAnalysis {
    constructor() {
        // ... codice esistente ...
        this.textAnalysis = new TextAnalysis();
    }

    updateAnalysis() {
        // ... codice esistente ...
        this.updateTextAnalysis();
    }

    updateTextAnalysis() {
        const data = this.getFilteredData();
        const textAnalysisDiv = document.getElementById('textAnalysis');
        
        if (!textAnalysisDiv) return;

        // Analizza le note
        data.forEach(entry => {
            if (entry.note && entry.note.trim() !== '') {
                const avgSkinCondition = (
                    parseInt(entry.pelle.zonaT) + 
                    parseInt(entry.pelle.guance) + 
                    parseInt(entry.pelle.cuoio)
                ) / 3;
                
                this.textAnalysis.analyzeNote(entry.note, avgSkinCondition);
            }
        });

        // Mostra i risultati
        const keywordAnalysis = this.textAnalysis.getKeywordAnalysis();
        
        textAnalysisDiv.innerHTML = `
            <h3>Analisi delle Note</h3>
            <div class="keywords-container">
                ${keywordAnalysis.slice(0, 10).map(k => `
                    <div class="keyword-item ${k.correlation}">
                        <span class="keyword">${k.keyword}</span>
                        <span class="count">(${k.count} occorrenze)</span>
                        <span class="correlation">Correlazione: ${k.correlation}</span>
                    </div>
                `).join('')}
            </div>
            <p class="analysis-note">* Le parole più frequenti nelle note e la loro correlazione con le condizioni della pelle</p>
        `;
    }
}
});
