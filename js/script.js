document.addEventListener('DOMContentLoaded', function() {
    // Imposta la data di oggi nel campo data
    document.getElementById('data').valueAsDate = new Date();

    // Gestione delle sezioni collassabili
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isActive = content.classList.contains('active');
            
            // Chiudi tutte le sezioni
            document.querySelectorAll('.section-content').forEach(section => {
                section.classList.remove('active');
            });
            document.querySelectorAll('.section-header').forEach(header => {
                header.classList.remove('active');
            });

            // Apri la sezione cliccata
            if (!isActive) {
                content.classList.add('active');
                this.classList.add('active');
            }
        });
    });

    // Gestione dei range slider
    const rangeSliders = {
        'qualitaSonno': 'qualitaSonnoValue',
        'livelloStress': 'stressValue',
        'pelleZonaT': 'zonaTValue',
        'pelleGuance': 'guanceValue',
        'pelleOcchi': 'occhiValue',
        'pelleCollo': 'colloValue',
        'pelleCuoio': 'cuoioValue',
        'prurito': 'pruritoValue',
        'desquamazione': 'desquamazioneValue',
        'rossore': 'rossoreValue'
    };

    Object.entries(rangeSliders).forEach(([sliderId, valueId]) => {
        const slider = document.getElementById(sliderId);
        if (slider) {
            slider.addEventListener('input', function() {
                document.getElementById(valueId).textContent = this.value;
            });
        }
    });

    // Gestione del form
    document.getElementById('sebdermForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            data: document.getElementById('data').value,
            generali: {
                peso: document.getElementById('peso').value || 'Non specificato'
            },
            sonno: {
                ore: document.getElementById('oreSonno').value || 'Non specificato',
                qualita: document.getElementById('qualitaSonno').value,
                oraDormire: document.getElementById('oraDormire').value || 'Non specificato',
                oraSveglia: document.getElementById('oraSveglia').value || 'Non specificato'
            },
            alimentazione: {
                colazione: document.getElementById('colazione').value || 'Non specificato',
                pranzo: document.getElementById('pranzo').value || 'Non specificato',
                cena: document.getElementById('cena').value || 'Non specificato',
                snack: document.getElementById('snack').value || 'Non specificato',
                acqua: document.getElementById('acqua').value || 'Non specificato',
                alcool: document.getElementById('alcool').value,
                caffeina: document.getElementById('caffeina').value || 'Non specificato'
            },
            integratori: {
                integratori: document.getElementById('integratoriAssunti').value || 'Non specificato',
                medicinali: document.getElementById('medicinali').value || 'Non specificato',
                probiotici: document.getElementById('probiotici').value || 'Non specificato'
            },
            stress: {
                livello: document.getElementById('livelloStress').value,
                oreLavoro: document.getElementById('oreLavoro').value || 'Non specificato',
                attivitaFisica: document.getElementById('attivitaFisica').value || 'Non specificato',
                oreAria: document.getElementById('oreAria').value || 'Non specificato',
                sole: document.getElementById('sole').value
            },
            skincare: {
                prodottiMattina: document.getElementById('prodottiMattina').value || 'Non specificato',
                prodottiSera: document.getElementById('prodottiSera').value || 'Non specificato',
                prodottiCapelli: document.getElementById('prodottiCapelli').value || 'Non specificato',
                lavaggioCapelli: document.getElementById('lavaggioCapelli').value
            },
            ambiente: {
                temperatura: document.getElementById('temperatura').value || 'Non specificato',
                cambioTessuti: document.getElementById('cambioTessuti').value
            },
            pelle: {
                zonaT: document.getElementById('pelleZonaT').value,
                guance: document.getElementById('pelleGuance').value,
                occhi: document.getElementById('pelleOcchi').value,
                collo: document.getElementById('pelleCollo').value,
                cuoio: document.getElementById('pelleCuoio').value,
                prurito: document.getElementById('prurito').value,
                desquamazione: document.getElementById('desquamazione').value,
                rossore: document.getElementById('rossore').value
            },
            note: document.getElementById('note').value || 'Nessuna nota'
        };

        // Controlla se esiste già un'entry per questa data
        let entries = JSON.parse(localStorage.getItem('sebdermEntries')) || [];
        const existingEntryIndex = entries.findIndex(entry => entry.data === formData.data);

        if (existingEntryIndex !== -1) {
            alert('Esiste già un\'entry per questa data. Modifica quella esistente.');
            return;
        }

        // Salva i dati
        saveEntry(formData);
        
        // Reset del form
        this.reset();
        resetFormValues();
        
        alert('Dati salvati con successo!');
    });

    function resetFormValues() {
        document.getElementById('data').valueAsDate = new Date();
        
        // Reset dei range slider
        Object.entries(rangeSliders).forEach(([sliderId, valueId]) => {
            const slider = document.getElementById(sliderId);
            const value = document.getElementById(valueId);
            if (slider && value) {
                const defaultValue = sliderId.includes('pelle') ? '50' : '5';
                slider.value = defaultValue;
                value.textContent = defaultValue;
            }
        });
    }

    function saveEntry(entry) {
        let entries = JSON.parse(localStorage.getItem('sebdermEntries')) || [];
        entries.unshift(entry);
        localStorage.setItem('sebdermEntries', JSON.stringify(entries));
        displayEntries();
    }

    function editEntry(index) {
        const entries = JSON.parse(localStorage.getItem('sebdermEntries')) || [];
        const entry = entries[index];

        // Popola il form con i dati dell'entry
        document.getElementById('data').value = entry.data;
        
        // Popola tutti i campi del form
        populateFormFields(entry);

        // Rimuovi la vecchia entry
        entries.splice(index, 1);
        localStorage.setItem('sebdermEntries', JSON.stringify(entries));
        displayEntries();

        // Apri la prima sezione
        const firstSection = document.querySelector('.section-content');
        firstSection.classList.add('active');
        firstSection.previousElementSibling.classList.add('active');

        // Scorri alla parte superiore della pagina
        window.scrollTo(0, 0);
    }

    function populateFormFields(entry) {
        // Generali
        document.getElementById('peso').value = entry.generali.peso !== 'Non specificato' ? entry.generali.peso : '';

        // Sonno
        document.getElementById('oreSonno').value = entry.sonno.ore !== 'Non specificato' ? entry.sonno.ore : '';
        document.getElementById('qualitaSonno').value = entry.sonno.qualita;
        document.getElementById('oraDormire').value = entry.sonno.oraDormire !== 'Non specificato' ? entry.sonno.oraDormire : '';
        document.getElementById('oraSveglia').value = entry.sonno.oraSveglia !== 'Non specificato' ? entry.sonno.oraSveglia : '';

        // ... popola tutti gli altri campi in modo simile ...
        // (Il codice completo per popolare tutti i campi è omesso per brevità)

        // Aggiorna i valori visualizzati per i range slider
        Object.entries(rangeSliders).forEach(([sliderId, valueId]) => {
            const slider = document.getElementById(sliderId);
            const value = document.getElementById(valueId);
            if (slider && value) {
                value.textContent = slider.value;
            }
        });
    }

    function displayEntries() {
        const entries = JSON.parse(localStorage.getItem('sebdermEntries')) || [];
        const entriesList = document.getElementById('entriesList');
        
        if (entries.length === 0) {
            entriesList.innerHTML = '<p>Nessun dato salvato</p>';
            return;
        }

        entriesList.innerHTML = entries.map((entry, index) => `
            <div class="entry-card">
                <span class="edit-icon" onclick="editEntry(${index})">✎</span>
                <strong>Data:</strong> ${formatDate(entry.data)}<br>
                <strong>Condizione Pelle:</strong><br>
                - Zona T: ${entry.pelle.zonaT}%<br>
                - Guance: ${entry.pelle.guance}%<br>
                - Cuoio capelluto: ${entry.pelle.cuoio}%<br>
                <strong>Stress:</strong> ${entry.stress.livello}/10<br>
                <strong>Note:</strong> ${entry.note}
            </div>
        `).join('');
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('it-IT', options);
    }

    // Rendi editEntry globale
    window.editEntry = editEntry;

    // Mostra lo storico all'avvio
    displayEntries();
});