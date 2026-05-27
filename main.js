// ========== API НАСТРОЙКА ==========
const API_URL = 'https://6a06cd77c83ba8ad9b3de40b.mockapi.io/clients';
let USE_MOCK = false;

// ========== ВСТРОЕННЫЕ ДАННЫЕ (MOCK) ==========
let mockDatabase = [];
let nextId = 4;

function initMockData() {
    if (mockDatabase.length > 0) return;
    
    mockDatabase = [
        {
            id: 1,
            name: 'Иван',
            surname: 'Иванов',
            patronymic: 'Иванович',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-20T14:45:00.000Z',
            contacts: [
                {type: 'Телефон', value: '+7 999 123-45-67'},
                {type: 'Email', value: 'ivan@test.ru'}
            ]
        },
        {
            id: 2,
            name: 'Никита',
            surname: 'Гирлянченко',
            patronymic: 'Сергеевич',
            createdAt: '2026-05-26T19:03:00.000Z',
            updatedAt: '2026-05-26T19:25:00.000Z',
            contacts: [
                {type: 'VK', value: 'vk.com/giniko'},
                {type: 'Telegram', value: '@giniko'}
            ]
        },
        {
            id: 3,
            name: 'Мария',
            surname: 'Кузнецова',
            patronymic: 'Дмитриевна',
            createdAt: '2024-03-01T00:00:00.000Z',
            updatedAt: '2024-03-01T00:00:00.000Z',
            contacts: [
                {type: 'Телефон', value: '+7 888 123-45-67'},
                {type: 'Email', value: 'maria@test.ru'}
            ]
        }
    ];
}
initMockData();

// ========== API ФУНКЦИИ ==========
const api = {
    async getClients(search = '') {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 200));
            let filtered = [...mockDatabase];
            if (search) {
                const lowerSearch = search.toLowerCase();
                filtered = filtered.filter(c => 
                    `${c.surname} ${c.name} ${c.patronymic}`.toLowerCase().includes(lowerSearch)
                );
            }
            return filtered;
        }
        
        try {
            const url = search ? `${API_URL}?search=${search}` : API_URL;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Ошибка загрузки');
            const data = await response.json();
            
            return data.map(item => ({
                id: parseInt(item.id),
                name: item.name || item.firstName,
                surname: item.surname || item.lastName,
                patronymic: item.patronymic || item.middleName || '',
                createdAt: item.createdAt || item.created_at || new Date().toISOString(),
                updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
                contacts: item.contacts || []
            }));
        } catch (error) {
            console.error('API ошибка:', error);
            return [];
        }
    },
    
    async getClientById(id) {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 150));
            const client = mockDatabase.find(c => c.id === parseInt(id));
            if (!client) throw new Error('Клиент не найден');
            return JSON.parse(JSON.stringify(client));
        }
        
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Клиент не найден');
        const item = await response.json();
        return {
            id: parseInt(item.id),
            name: item.name || item.firstName,
            surname: item.surname || item.lastName,
            patronymic: item.patronymic || item.middleName || '',
            createdAt: item.createdAt || item.created_at || new Date().toISOString(),
            updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
            contacts: item.contacts || []
        };
    },
    
    async createClient(clientData) {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 250));
            const now = new Date().toISOString();
            const newClient = {
                id: nextId++,
                name: clientData.name,
                surname: clientData.surname,
                patronymic: clientData.patronymic || '',
                contacts: clientData.contacts || [],
                createdAt: now,
                updatedAt: now
            };
            mockDatabase.push(newClient);
            return newClient;
        }
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: clientData.name,
                surname: clientData.surname,
                patronymic: clientData.patronymic,
                contacts: clientData.contacts,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
        });
        if (!response.ok) throw new Error('Ошибка создания');
        return await response.json();
    },
    
    async updateClient(id, clientData) {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 250));
            const index = mockDatabase.findIndex(c => c.id === parseInt(id));
            if (index === -1) throw new Error('Клиент не найден');
            
            mockDatabase[index] = { 
                ...mockDatabase[index],
                name: clientData.name,
                surname: clientData.surname,
                patronymic: clientData.patronymic || '',
                contacts: clientData.contacts || [],
                updatedAt: new Date().toISOString()
            };
            return mockDatabase[index];
        }
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: clientData.name,
                surname: clientData.surname,
                patronymic: clientData.patronymic,
                contacts: clientData.contacts,
                updatedAt: new Date().toISOString()
            })
        });
        if (!response.ok) throw new Error('Ошибка обновления');
        return await response.json();
    },
    
    async deleteClient(id) {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 200));
            mockDatabase = mockDatabase.filter(c => c.id !== parseInt(id));
            return true;
        }
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok && response.status !== 404) {
            throw new Error('Ошибка удаления');
        }
        return true;
    }
};

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let currentClients = [];
let currentSort = { field: 'id', order: 'asc' };
let currentSearchQuery = '';
let isLoading = false;

// ========== ФОРМАТИРОВАНИЕ ДАТЫ ==========
function formatDate(dateString) {
    if (!dateString) return '—';
    try {
        let date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '—';
        }
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return '—';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== СОРТИРОВКА ==========
function sortClients(clientsArray, field, order) {
    return [...clientsArray].sort((a, b) => {
        let valA, valB;
        if (field === 'fio') {
            valA = `${a.surname} ${a.name} ${a.patronymic}`;
            valB = `${b.surname} ${b.name} ${b.patronymic}`;
            return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (field === 'createdAt' || field === 'updatedAt') {
            valA = new Date(a[field] || 0);
            valB = new Date(b[field] || 0);
            return order === 'asc' ? valA - valB : valB - valA;
        }
        valA = a[field];
        valB = b[field];
        return order === 'asc' ? valA - valB : valB - valA;
    });
}

function updateSortIcons() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.sort === currentSort.field) {
            th.classList.add(currentSort.order === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });
}

// ========== ОТРИСОВКА КОНТАКТОВ ==========
function renderContacts(contacts) {
    if (!contacts || contacts.length === 0) return '—';
    
    return contacts.map(contact => {
        const type = contact.type;
        const value = contact.value;
        if (!value) return '';
        
        let iconClass = '';
        let iconText = '';
        let href = '';
        
        if (type === 'Телефон') {
            iconClass = 'phone';
            iconText = '📞';
            href = `tel:${value.replace(/[^+0-9]/g, '')}`;
        } else if (type === 'Email') {
            iconClass = 'email';
            iconText = '✉️';
            href = `mailto:${value}`;
        } else if (type === 'VK') {
            iconClass = 'vk';
            iconText = 'VK';
            href = value.startsWith('http') ? value : `https://${value}`;
        } else if (type === 'Facebook') {
            iconClass = 'fb';
            iconText = 'FB';
            href = value.startsWith('http') ? value : `https://${value}`;
        } else if (type === 'Twitter') {
            iconClass = 'tw';
            iconText = 'TW';
            href = value.startsWith('http') ? value : `https://${value}`;
        } else if (type === 'Telegram') {
            iconClass = 'tg';
            iconText = 'TG';
            href = value.startsWith('http') ? value : `https://${value}`;
        } else {
            iconClass = 'default';
            iconText = '👤';
        }
        
        const tooltip = `${type}: ${value}`;
        
        if (href) {
            return `<a href="${href}" target="_blank" class="contact-link" title="${escapeHtml(tooltip)}"><span class="contact-icon ${iconClass}">${iconText}</span></a>`;
        }
        return `<span class="contact-icon ${iconClass}" title="${escapeHtml(tooltip)}">${iconText}</span>`;
    }).join('');
}

// ========== ОТРИСОВКА ТАБЛИЦЫ ==========
function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    let filtered = [...currentClients];
    if (currentSearchQuery) {
        filtered = filtered.filter(c => 
            `${c.surname} ${c.name} ${c.patronymic}`.toLowerCase().includes(currentSearchQuery)
        );
    }
    
    const sorted = sortClients(filtered, currentSort.field, currentSort.order);
    
    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Нет данных</td></tr>';
        return;
    }
    
    let html = '';
    for (const client of sorted) {
        const fio = `${client.surname} ${client.name} ${client.patronymic}`;
        html += `
            <tr data-client-id="${client.id}">
                <td style="width: 60px;">${client.id}</td>
                <td>${escapeHtml(fio)}</td>
                <td>${formatDate(client.createdAt)}</td>
                <td>${formatDate(client.updatedAt)}</td>
                <td class="contacts-cell">${renderContacts(client.contacts)}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${client.id}">Изменить</button>
                    <button class="delete-btn" data-id="${client.id}">Удалить</button>
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteClient(parseInt(btn.dataset.id)));
    });
    
    updateSortIcons();
}

// ========== ЗАГРУЗКА КЛИЕНТОВ ==========
async function loadClients(showLoader = true) {
    if (isLoading) return;
    
    const loader = document.getElementById('tableLoader');
    if (showLoader && loader) loader.style.display = 'flex';
    isLoading = true;
    
    try {
        currentClients = await api.getClients(currentSearchQuery);
        renderTable();
        console.log('✅ Загружено клиентов:', currentClients.length);
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
    } finally {
        if (showLoader && loader) loader.style.display = 'none';
        isLoading = false;
    }
}

// ========== УДАЛЕНИЕ ==========
async function deleteClient(id) {
    if (!confirm('Вы уверены, что хотите удалить этого клиента?')) return;
    
    const loader = document.getElementById('tableLoader');
    if (loader) loader.style.display = 'flex';
    
    try {
        await api.deleteClient(id);
        // Принудительно перезагружаем данные
        await loadClients(true);
        console.log('✅ Клиент удалён');
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        // Даже при ошибке пробуем перезагрузить данные
        await loadClients(true);
        alert('Ошибка при удалении, но данные обновлены');
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// ========== МОДАЛЬНОЕ ОКНО ==========
function showModal(title, bodyHtml, onSave, onDelete) {
    const modalRoot = document.getElementById('modalRoot');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                ${bodyHtml}
            </div>
        </div>
    `;
    
    modalRoot.appendChild(overlay);
    setTimeout(() => overlay.classList.add('open'), 10);
    
    const closeModal = () => {
        overlay.classList.remove('open');
        setTimeout(() => overlay.remove(), 200);
    };
    
    // Закрытие по крестику
    const closeBtn = overlay.querySelector('.close-modal');
    closeBtn.addEventListener('click', closeModal);
    
    // Закрытие по клику на фон
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    
    // Обработка формы
    const form = overlay.querySelector('#clientForm');
    if (form && onSave) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await onSave(form, closeModal);
        });
    }
    
    // Кнопка удаления
    const deleteBtn = overlay.querySelector('.delete-client-btn');
    if (deleteBtn && onDelete) {
        deleteBtn.addEventListener('click', async () => {
            if (confirm('Удалить клиента?')) {
                await onDelete();
                closeModal();
            }
        });
    }
    
    // Кнопка отмены
    const cancelBtn = overlay.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    return { closeModal };
}

function createContactRow(contact = { type: 'Телефон', value: '' }) {
    const div = document.createElement('div');
    div.className = 'contact-row';
    div.innerHTML = `
        <select class="contact-type">
            <option value="Телефон" ${contact.type === 'Телефон' ? 'selected' : ''}>📞 Телефон</option>
            <option value="Email" ${contact.type === 'Email' ? 'selected' : ''}>✉️ Email</option>
            <option value="VK" ${contact.type === 'VK' ? 'selected' : ''}>VK</option>
            <option value="Facebook" ${contact.type === 'Facebook' ? 'selected' : ''}>FB</option>
            <option value="Twitter" ${contact.type === 'Twitter' ? 'selected' : ''}>TW</option>
            <option value="Telegram" ${contact.type === 'Telegram' ? 'selected' : ''}>TG</option>
        </select>
        <input type="text" class="contact-value" placeholder="Введите данные контакта" value="${escapeHtml(contact.value)}">
        <button type="button" class="remove-contact">✖</button>
    `;
    return div;
}

// ========== ФОРМА ==========
async function openClientForm(client = null) {
    const isEdit = !!client;
    const title = isEdit ? 'Изменить данные' : 'Новый клиент';
    
    const idHtml = isEdit ? `<div style="margin-bottom: 16px; font-size: 13px; color: #64748b;">ID: ${client.id}</div>` : '';
    
    const formHtml = `
        <form id="clientForm">
            <div id="formErrors" class="form-errors" style="display:none"></div>
            ${idHtml}
            <div class="form-group">
                <label>Фамилия <span class="required">*</span></label>
                <input type="text" id="surname" value="${escapeHtml(client?.surname || '')}">
            </div>
            <div class="form-group">
                <label>Имя <span class="required">*</span></label>
                <input type="text" id="name" value="${escapeHtml(client?.name || '')}">
            </div>
            <div class="form-group">
                <label>Отчество</label>
                <input type="text" id="patronymic" value="${escapeHtml(client?.patronymic || '')}">
            </div>
            <div class="contacts-section">
                <h3>Контакты</h3>
                <div id="contactsContainer"></div>
                <button type="button" class="add-contact-btn" id="addContactBtn">+ Добавить контакт</button>
            </div>
            <div class="form-actions">
                <button type="submit" class="save-btn">Сохранить</button>
                <button type="button" class="cancel-btn">Отмена</button>
                ${isEdit ? '<button type="button" class="delete-client-btn">Удалить клиента</button>' : ''}
            </div>
        </form>
    `;
    
    let currentContacts = client?.contacts ? [...client.contacts] : [{ type: 'Телефон', value: '' }];
    
    const { closeModal } = showModal(title, formHtml, async (form, close) => {
        const surname = form.querySelector('#surname').value.trim();
        const name = form.querySelector('#name').value.trim();
        const patronymic = form.querySelector('#patronymic').value.trim();
        const errors = [];
        
        if (!surname) errors.push('Фамилия обязательна');
        if (!name) errors.push('Имя обязательно');
        
        const contactRows = form.querySelectorAll('.contact-row');
        const contacts = [];
        contactRows.forEach(row => {
            const type = row.querySelector('.contact-type').value;
            const value = row.querySelector('.contact-value').value.trim();
            if (value) {
                contacts.push({ type, value });
            }
        });
        
        if (errors.length > 0) {
            const errorsDiv = form.querySelector('#formErrors');
            errorsDiv.style.display = 'block';
            errorsDiv.innerHTML = errors.map(e => `<p>⚠️ ${e}</p>`).join('');
            return;
        }
        
        const saveBtn = form.querySelector('.save-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = 'Сохранение...';
        saveBtn.disabled = true;
        
        try {
            const clientData = { surname, name, patronymic, contacts };
            
            if (isEdit) {
                await api.updateClient(client.id, clientData);
            } else {
                await api.createClient(clientData);
            }
            
            await loadClients(true);
            close();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения');
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }, isEdit ? async () => {
        await api.deleteClient(client.id);
        await loadClients(true);
    } : null);
    
    setTimeout(() => {
        const container = document.getElementById('contactsContainer');
        const addBtn = document.getElementById('addContactBtn');
        
        function renderContactsList() {
            if (!container) return;
            container.innerHTML = '';
            currentContacts.forEach((contact, idx) => {
                const row = createContactRow(contact);
                const removeBtn = row.querySelector('.remove-contact');
                removeBtn.addEventListener('click', () => {
                    currentContacts.splice(idx, 1);
                    renderContactsList();
                });
                container.appendChild(row);
            });
            if (addBtn) {
                addBtn.style.display = currentContacts.length >= 10 ? 'none' : 'inline-block';
            }
        }
        
        if (addBtn) {
            const newAddBtn = addBtn.cloneNode(true);
            addBtn.parentNode.replaceChild(newAddBtn, addBtn);
            newAddBtn.addEventListener('click', () => {
                if (currentContacts.length < 10) {
                    currentContacts.push({ type: 'Телефон', value: '' });
                    renderContactsList();
                }
            });
        }
        
        renderContactsList();
    }, 100);
}

async function openEditModal(id) {
    const loader = document.getElementById('tableLoader');
    if (loader) loader.style.display = 'flex';
    try {
        const client = await api.getClientById(id);
        if (loader) loader.style.display = 'none';
        await openClientForm(client);
    } catch (error) {
        if (loader) loader.style.display = 'none';
        alert('Ошибка загрузки данных клиента');
    }
}

// ========== ПОИСК ==========
let debounceTimer;
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearchQuery = e.target.value.toLowerCase();
            loadClients(true);
        }, 300);
    });
}

// ========== СОРТИРОВКА ==========
function setupSorting() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (currentSort.field === field) {
                currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.field = field;
                currentSort.order = 'asc';
            }
            renderTable();
        });
    });
}

// ========== КНОПКА ДОБАВЛЕНИЯ ==========
const addBtn = document.getElementById('addClientBtn');
if (addBtn) {
    addBtn.addEventListener('click', () => openClientForm());
}

// ========== ЗАПУСК ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ CRM система запущена');
    setupSorting();
    loadClients(true);
});