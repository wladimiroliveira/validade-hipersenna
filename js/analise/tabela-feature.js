// table-features.js (Versão Atualizada)

const InteractiveTable = {
    table: null,
    columnToggleMenu: null,
    filterPopup: null,
    activeFilters: {},

    init(tableId, controlsId) {
        this.table = document.getElementById(tableId);
        const controls = document.getElementById(controlsId);

        if (!this.table || !controls) {
            console.error("Tabela ou container de controles não encontrado.");
            return;
        }

        controls.style.display = 'block';
        this.columnToggleMenu = controls.querySelector('#column-toggle-menu');
        this.activeFilters = {};
        this.cleanup();
        this.setupColumnToggler();
        this.setupColumnFiltering();
        this.createFilterPopup();
    },

    cleanup() {
        this.columnToggleMenu.innerHTML = '';
        this.table.querySelectorAll('.filter-icon').forEach(icon => icon.remove());
        const existingPopup = document.getElementById('filter-popup');
        if (existingPopup) existingPopup.remove();
    },

    setupColumnToggler() {
        const headers = this.table.querySelectorAll('thead th');
        headers.forEach((header, index) => {
            const columnName = header.textContent.trim();
            if (!columnName) return;

            const listItem = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.dataset.columnIndex = index;

            listItem.appendChild(checkbox);
            listItem.appendChild(document.createTextNode(` ${columnName}`));
            this.columnToggleMenu.appendChild(listItem);

            checkbox.addEventListener('change', (e) => {
                this.toggleColumn(e.target.dataset.columnIndex, e.target.checked);
            });
        });
    },
    
    toggleColumn(columnIndex, isVisible) {
        const cells = this.table.querySelectorAll(`th:nth-child(${+columnIndex + 1}), td:nth-child(${+columnIndex + 1})`);
        cells.forEach(cell => {
            cell.classList.toggle('column-hidden', !isVisible);
        });
    },

    setupColumnFiltering() {
        this.table.querySelectorAll('thead th').forEach((header, index) => {
            const icon = document.createElement('span');
            icon.className = 'filter-icon';
            icon.innerHTML = ' ▼';
            icon.dataset.columnIndex = index;
            
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showFilterPopup(e.currentTarget);
            });
            header.appendChild(icon);
        });
    },
    
    createFilterPopup() {
        const popup = document.createElement('div');
        popup.id = 'filter-popup';
        // --- HTML do Pop-up Atualizado ---
        popup.innerHTML = `
            <input type="text" id="filter-search" placeholder="Pesquisar valores...">
            
            <div class="filter-actions">
                <a href="#" id="filter-select-all">Selecionar Tudo</a> |
                <a href="#" id="filter-invert">Inverter Seleção</a>
            </div>
            
            <div class="filter-options" id="filter-options-list"></div>
            <div class="filter-buttons">
                <button id="filter-apply-btn" class="apply-btn">Aplicar</button>
                <button id="filter-clear-btn" class="clear-btn">Limpar Filtro</button>
                <button id="filter-cancel-btn">Cancelar</button>
            </div>
        `;
        document.body.appendChild(popup);
        this.filterPopup = popup;

        document.addEventListener('click', (e) => {
            if (this.filterPopup.style.display === 'block' && !this.filterPopup.contains(e.target) && !e.target.classList.contains('filter-icon')) {
                this.filterPopup.style.display = 'none';
            }
        });
    },

    showFilterPopup(filterIcon) {
        const columnIndex = filterIcon.dataset.columnIndex;
        const rect = filterIcon.getBoundingClientRect();
        this.filterPopup.style.left = `${rect.left}px`;
        this.filterPopup.style.top = `${rect.bottom + window.scrollY}px`;
        
        this.populateFilterPopup(columnIndex);
        this.filterPopup.style.display = 'block';
    },

    populateFilterPopup(columnIndex) {
        const optionsContainer = this.filterPopup.querySelector('#filter-options-list');
        const searchInput = this.filterPopup.querySelector('#filter-search');
        optionsContainer.innerHTML = '';
        searchInput.value = '';

        const values = new Set();
        this.table.querySelectorAll('tbody tr').forEach(row => {
             if (row.style.display !== 'none') {
                 const cell = row.querySelector(`td:nth-child(${+columnIndex + 1})`);
                 if (cell) values.add(cell.textContent.trim());
             }
        });

        const currentColumnFilter = this.activeFilters[columnIndex] || new Set();
        const sortedValues = [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        sortedValues.forEach(value => {
            const id = `filter-val-${value.replace(/[^a-zA-Z0-9]/g, '-')}`; // ID mais robusto
            const isChecked = currentColumnFilter.size === 0 || currentColumnFilter.has(value);
            
            optionsContainer.innerHTML += `
                <div>
                    <input type="checkbox" id="${id}" value="${value}" ${isChecked ? 'checked' : ''}>
                    <label for="${id}">${value}</label>
                </div>
            `;
        });
        
        searchInput.onkeyup = () => {
            const filter = searchInput.value.toLowerCase();
            optionsContainer.querySelectorAll('div').forEach(div => {
                const label = div.querySelector('label');
                if (label.textContent.toLowerCase().includes(filter)) {
                    div.style.display = '';
                } else {
                    div.style.display = 'none';
                }
            });
        };

        // --- Lógica dos novos botões ---
        
        // NOVO: Evento para "Selecionar Tudo"
        this.filterPopup.querySelector('#filter-select-all').onclick = (e) => {
            e.preventDefault();
            optionsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        };

        // NOVO: Evento para "Inverter Seleção"
        this.filterPopup.querySelector('#filter-invert').onclick = (e) => {
            e.preventDefault();
            optionsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = !cb.checked);
        };
        
        // Configura os botões principais
        this.filterPopup.querySelector('#filter-apply-btn').onclick = () => this.applyFilter(columnIndex);
        this.filterPopup.querySelector('#filter-clear-btn').onclick = () => this.clearFilter(columnIndex);
        this.filterPopup.querySelector('#filter-cancel-btn').onclick = () => this.filterPopup.style.display = 'none';
    },

    applyFilter(columnIndex) {
        const selectedValues = new Set();
        this.filterPopup.querySelectorAll('.filter-options input[type="checkbox"]:checked').forEach(cb => {
            selectedValues.add(cb.value);
        });

        const allValuesCount = this.filterPopup.querySelectorAll('.filter-options input[type="checkbox"]').length;

        if (selectedValues.size === allValuesCount) {
             delete this.activeFilters[columnIndex];
        } else {
            this.activeFilters[columnIndex] = selectedValues;
        }

        this.updateTableRows();
        this.filterPopup.style.display = 'none';
    },

    clearFilter(columnIndex) {
        delete this.activeFilters[columnIndex];
        this.updateTableRows();
        this.filterPopup.style.display = 'none';
    },

    updateTableRows() {
        this.table.querySelectorAll('tbody tr').forEach(row => {
            let isVisible = true;
            for (const colIdx in this.activeFilters) {
                const cell = row.querySelector(`td:nth-child(${+colIdx + 1})`);
                const cellValue = cell ? cell.textContent.trim() : '';
                if (!this.activeFilters[colIdx].has(cellValue)) {
                    isVisible = false;
                    break;
                }
            }
            row.style.display = isVisible ? '' : 'none';
        });

        this.table.querySelectorAll('.filter-icon').forEach((icon, index) => {
            icon.classList.toggle('active', !!this.activeFilters[index]);
        });
    }
};