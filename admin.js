let orders = [
    { id: 'Alpha Coal Delivery', material: 'Anthracite Coal', mine: 'Eagle Point', quantity: 500, status: 'Active' },
    { id: 'Beta Iron Supply', material: 'Iron Ore', mine: 'Silver Hollow', quantity: 250, status: 'Delayed' }
];

let trucks = [
    { id: 'T-01', model: 'Volvo FMX 460', name: 'Big Blue', plate: 'TN-01-AB-1234', load: '25 Tons', status: 'Available' },
    { id: 'T-02', model: 'Scania G440', name: 'Road King', plate: 'TN-01-CD-5678', load: '30 Tons', status: 'Available' },
    { id: 'T-03', model: 'Tata Prima 4925', name: 'Steel Titan', plate: 'TN-01-EF-9012', load: '20 Tons', status: 'At Work' },
    { id: 'T-04', model: 'MAN TGS', name: 'Desert Storm', plate: 'TN-01-GH-3456', load: '28 Tons', status: 'Available' }
];

const minesData = [
    { name: 'Eagle Point', material: 'Anthracite Coal' },
    { name: 'Silver Hollow', material: 'Iron Ore' },
    { name: 'Black Ridge', material: 'Copper Ore' },
    { name: 'Dusty Plains', material: 'Bauxite' }
];

let historyLog = [];

// ===== RENDER FUNCTIONS =====
function renderOrders() {
    const tbody = document.querySelector('#content-area .data-table tbody');
    if (!tbody) return;
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.material}</td>
            <td>${order.mine}</td>
            <td>${order.quantity}</td>
            <td><span class="badge ${order.status === 'Active' ? 'badge-success' : 'badge-warning'}">${order.status}</span></td>
            <td>
                <button class="small-btn delete-btn" onclick="deleteOrder('${order.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function renderTrucks() {
    const tbody = document.querySelector('#content-area .data-table tbody');
    if (!tbody) return;
    tbody.innerHTML = trucks.map(truck => `
        <tr>
            <td><span class="status-light ${truck.status === 'Available' ? 'green' : 'red'}"></span></td>
            <td>${truck.model}</td>
            <td>${truck.name} / ${truck.plate}</td>
            <td>${truck.load}</td>
            <td><span class="badge ${truck.status === 'Available' ? 'badge-success' : 'badge-warning'}">${truck.status === 'Available' ? 'Ready to Work' : 'At Work'}</span></td>
        </tr>
    `).join('');
}

function renderHistory() {
    const tbody = document.querySelector('#content-area .data-table tbody');
    if (!tbody) return;
    
    if (historyLog.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No history available yet.</td></tr>';
        return;
    }

    tbody.innerHTML = historyLog.map(log => `
        <tr>
            <td>${log.orderId}</td>
            <td>${log.date}</td>
            <td>${log.material} (${log.quantity} Tons)</td>
            <td>${log.mineSite}</td>
            <td>${log.truckName}</td>
            <td><span class="badge badge-success">Assigned</span></td>
        </tr>
    `).join('');
}

function renderAssigning() {
    const area = document.getElementById('content-area');
    if (!area) return;

    const orderOptions = orders.map(o =>
        `<option value="${o.id}">${o.id} — ${o.material} (${o.quantity} Tons)</option>`
    ).join('');

    const materialsList = [...new Set(minesData.map(m => m.material))];
    const materialOptions = materialsList.map(mat => 
        `<option value="${mat}">${mat}</option>`
    ).join('');

    const truckOptions = trucks
        .filter(t => t.status === 'Available')
        .map(t => `<option value="${t.id}">${t.name} (${t.plate}) — ${t.load}</option>`)
        .join('');

    area.innerHTML = `
        <div class="header-row">
            <h3>Assign</h3>
        </div>
        <div class="assign-layout">
            <div class="assignment-form glass-panel">
                <div class="input-group">
                    <label>Which Order?</label>
                    <select id="assign-order-select" onchange="updateOrderDetails()">
                        <option value="">-- Select Order --</option>
                        ${orderOptions}
                    </select>
                </div>

                <div class="input-group">
                    <label>Select Material</label>
                    <select id="assign-material-select" onchange="updateMineOptions()">
                        <option value="">-- Select Material First --</option>
                        ${materialOptions}
                    </select>
                </div>

                <div class="input-group">
                    <label>Select Mine Site</label>
                    <select id="assign-mine-select" onchange="updateOrderDetails()">
                        <option value="">-- Waiting for Material --</option>
                    </select>
                </div>

                <div class="input-group">
                    <label>Select Delivery Truck</label>
                    <select id="assign-truck-select" onchange="updateOrderDetails()">
                        <option value="">-- Select Truck Box --</option>
                        ${truckOptions || '<option disabled>No trucks available</option>'}
                    </select>
                </div>

                <button class="submit-btn" onclick="assignTruck()">Assign the Order</button>
            </div>
            
            <div class="order-summary-panel glass-panel" id="selected-order-details" style="display:none;">
                <h4>Order Summary</h4>
                <div class="summary-content">
                    <p><strong>Order Name:</strong> <span id="det-id"></span></p>
                    <p><strong>Material:</strong> <span id="det-material"></span></p>
                    <p><strong>Quantity:</strong> <span id="det-quantity"></span> Tons</p>
                    <p><strong>Assigned Mine:</strong> <span id="det-mine"></span></p>
                    <p><strong>Allocated Truck:</strong> <span id="det-truck"></span></p>
                    <p><strong>Status:</strong> <span id="det-status" class="badge"></span></p>
                </div>
            </div>
        </div>
    `;
}

// ===== SECTION TEMPLATES =====
const sections = {
    order: `
        <div class="header-row">
            <h3>Recent Orders</h3>
            <button class="action-btn" onclick="openOrderModal()"><i class="fas fa-plus"></i> New Order</button>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Order Name</th>
                    <th>Material</th>
                    <th>Mine Site</th>
                    <th>Quantity (Tons)</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `,
    transport: `
        <div class="header-row">
            <h3>Transport Availability</h3>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Truck Model</th>
                    <th>Truck Name / Plate</th>
                    <th>Max Load</th>
                    <th>Availability</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `,
    history: `
        <div class="header-row">
            <h3>Assignment History</h3>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Order Name</th>
                    <th>Date</th>
                    <th>Material/Qty</th>
                    <th>Mine Site</th>
                    <th>Truck</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `,
    mines: `
        <div class="header-row">
            <h3>Mine Site Availability</h3>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Mine Name</th>
                    <th>Material Produced</th>
                    <th>Stock Quantity</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><span class="status-light green"></span></td>
                    <td>Eagle Point</td><td>Anthracite Coal</td><td>4,200 Tons</td>
                    <td><button class="small-btn">Details</button></td>
                </tr>
                <tr>
                    <td><span class="status-light green"></span></td>
                    <td>Silver Hollow</td><td>Iron Ore</td><td>1,850 Tons</td>
                    <td><button class="small-btn">Details</button></td>
                </tr>
                <tr>
                    <td><span class="status-light red"></span></td>
                    <td>Black Ridge</td><td>Copper Ore</td><td>0 Tons</td>
                    <td><button class="small-btn">Details</button></td>
                </tr>
                <tr>
                    <td><span class="status-light green"></span></td>
                    <td>Dusty Plains</td><td>Bauxite</td><td>3,100 Tons</td>
                    <td><button class="small-btn">Details</button></td>
                </tr>
            </tbody>
        </table>
    `,
    portfolio: `
        <div class="header-row"><h3>Fleet & Mine Portfolio</h3></div>
        <div class="portfolio-grid">
            <div class="portfolio-column">
                <h4>Lorry Availability</h4>
                <div class="column-list">
                    <div class="list-item"><span class="status-light green"></span> Big Blue (TN-01-AB-1234)</div>
                    <div class="list-item"><span class="status-light green"></span> Road King (TN-01-CD-5678)</div>
                    <div class="list-item"><span class="status-light green"></span> Desert Storm (TN-01-GH-3456)</div>
                </div>
            </div>
            <div class="portfolio-column">
                <h4>Lorry At Work</h4>
                <div class="column-list">
                    <div class="list-item"><span class="status-light red"></span> Steel Titan (TN-01-EF-9012)</div>
                </div>
            </div>
            <div class="portfolio-column">
                <h4>Mine Availability</h4>
                <div class="column-list">
                    <div class="list-item"><span class="status-light green"></span> Eagle Point (Anthracite)</div>
                    <div class="list-item"><span class="status-light green"></span> Silver Hollow (Iron Ore)</div>
                    <div class="list-item"><span class="status-light red"></span> Black Ridge (Copper Ore)</div>
                    <div class="list-item"><span class="status-light green"></span> Dusty Plains (Bauxite)</div>
                </div>
            </div>
        </div>
        <div class="portfolio-summary">
            <div class="summary-row">
                <span class="label">Total No. of Trucks:</span>
                <span class="value">04</span>
            </div>
            <div class="summary-row">
                <span class="label">No. of Trucks At Work:</span>
                <span class="value">01</span>
            </div>
            <div class="summary-row">
                <span class="label">No. of Mines:</span>
                <span class="value">04</span>
            </div>
        </div>
    `,
    billing: `
        <div class="header-row"><h3>Billing Details</h3></div>
        <table class="data-table">
            <thead>
                <tr><th>Invoice ID</th><th>Date</th><th>Client</th><th>Amount</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td>#INV-882</td>
                    <td>Apr 02, 2026</td>
                    <td>Global Logistics Ltd.</td>
                    <td>$45,200.00</td>
                </tr>
            </tbody>
        </table>
    `
};

// ===== SHOW SECTION =====
function showSection(type) {
    const contentArea = document.getElementById('content-area');
    const title = document.getElementById('section-title');
    const menuItems = document.querySelectorAll('.menu-item');

    const titles = {
        order: 'Order Management',
        assigning: 'Assign',
        transport: 'Transport Availability',
        mines: 'Mine Site Availability',
        history: 'Assignment History',
        portfolio: 'Business Portfolio',
        billing: 'Billing Details'
    };
    if (title) title.textContent = titles[type] || '';

    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick') === `showSection('${type}')`) {
            item.classList.add('active');
        }
    });

    contentArea.style.opacity = '0';
    contentArea.style.transform = 'translateY(10px)';

    setTimeout(() => {
        if (type === 'assigning') {
            renderAssigning();
        } else {
            contentArea.innerHTML = sections[type] || '<p>Section not found.</p>';
            if (type === 'order') renderOrders();
            if (type === 'transport') renderTrucks();
            if (type === 'history') renderHistory();
        }
        contentArea.style.opacity = '1';
        contentArea.style.transform = 'translateY(0)';
    }, 200);
}

// ===== ORDER MODAL =====
function openOrderModal() {
    document.getElementById('order-modal').style.display = 'flex';
}

function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
    document.getElementById('new-order-form').reset();
}

function deleteOrder(id) {
    if (confirm(`Delete order #${id}?`)) {
        orders = orders.filter(o => o.id !== id);
        renderOrders();
    }
}

// ===== ASSIGNMENT LOGIC =====
function updateOrderDetails() {
    const orderSelect = document.getElementById('assign-order-select');
    const matSelect = document.getElementById('assign-material-select');
    const mineSelect = document.getElementById('assign-mine-select');
    const truckSelect = document.getElementById('assign-truck-select');
    const detailsBox = document.getElementById('selected-order-details');
    if (!orderSelect || !detailsBox) return;

    const orderId = orderSelect.value;
    if (!orderId) {
        detailsBox.style.display = 'none';
        return;
    }

    const order = orders.find(o => o.id === orderId);
    if (order) {
        document.getElementById('det-id').textContent = order.id;
        
        // Grab values if selected, else from order as fallback
        const matVal = matSelect && matSelect.value ? matSelect.value : order.material;
        const mineVal = mineSelect && mineSelect.value ? mineSelect.value : 'Not assigned yet';
        
        // Get truck name based on id
        let truckNameStr = 'No truck selected';
        if (truckSelect && truckSelect.value) {
            const tr = trucks.find(t => t.id === truckSelect.value);
            if (tr) truckNameStr = tr.name + ' (' + tr.plate + ')';
        }

        document.getElementById('det-material').textContent = matVal;
        document.getElementById('det-quantity').textContent = order.quantity;
        document.getElementById('det-mine').textContent = mineVal;
        document.getElementById('det-truck').textContent = truckNameStr;
        
        const badge = document.getElementById('det-status');
        badge.textContent = order.status;
        badge.className = 'badge ' + (order.status === 'Active' ? 'badge-success' : 'badge-warning');
        
        detailsBox.style.display = 'block';
    }
}

function updateMineOptions() {
    const matSelect = document.getElementById('assign-material-select');
    const mineSelect = document.getElementById('assign-mine-select');
    if (!matSelect || !mineSelect) return;

    const selectedMaterial = matSelect.value;
    
    if (!selectedMaterial) {
        mineSelect.innerHTML = '<option value="">-- Waiting for Material --</option>';
        updateOrderDetails();
        return;
    }

    const filteredMines = minesData.filter(m => m.material === selectedMaterial);
    
    if (filteredMines.length === 0) {
        mineSelect.innerHTML = '<option value="">-- No Mines Found --</option>';
        updateOrderDetails();
        return;
    }

    mineSelect.innerHTML = '<option value="">-- Select Mine Box --</option>' + 
        filteredMines.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
    
    updateOrderDetails();
}

function assignTruck() {
    const orderId = document.getElementById('assign-order-select').value;
    const materialId = document.getElementById('assign-material-select').value;
    const mineId = document.getElementById('assign-mine-select').value;
    const truckId = document.getElementById('assign-truck-select').value;

    if (!orderId || !materialId || !mineId || !truckId) {
        alert('Please select an Order, Material, Mine Site, and a Truck.');
        return;
    }

    const truck = trucks.find(t => t.id === truckId);
    const order = orders.find(o => o.id === orderId);

    if (truck && order) {
        truck.status = 'At Work';
        order.status = 'In Progress';
        order.assignedMine = mineId; 

        // Add to history log
        historyLog.unshift({
            orderId: order.id,
            date: new Date().toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' }),
            material: materialId,
            quantity: order.quantity,
            mineSite: mineId,
            truckName: truck.name
        });

        alert(`✅ ${truck.name} has been assigned to Order '${order.id}' at ${mineId}!`);
        renderAssigning(); // Refresh the assignment form
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    showSection('order');

    const orderForm = document.getElementById('new-order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const newOrder = {
                id: document.getElementById('order-name').value,
                material: document.getElementById('order-material').value,
                mine: document.getElementById('order-mine').value,
                quantity: document.getElementById('order-quantity').value,
                status: 'Active'
            };
            orders.unshift(newOrder);
            closeOrderModal();
            renderOrders();
        });
    }
});

// ===== DYNAMIC STYLES =====
const style = document.createElement('style');
style.textContent = `
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .action-btn { background: var(--primary); border: none; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    .small-btn { background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: white; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .delete-btn { color: #ef4444 !important; border-color: rgba(239, 68, 68, 0.3) !important; }
    .delete-btn:hover { background: #ef4444 !important; color: white !important; }
    #content-area { transition: opacity 0.3s ease, transform 0.3s ease; }
    .submit-btn { display: block; width: 100%; margin-top: 20px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; color: white; padding: 14px; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,210,255,0.4); }
    
    /* Assign Layout Styles */
    .assign-layout { display: flex; gap: 25px; align-items: flex-start; }
    .assignment-form { flex: 1; max-width: 50%; padding: 25px; }
    .order-summary-panel { flex: 1; padding: 25px; border-left: 3px solid var(--primary); animation: fadeIn 0.3s ease-out; }
    .order-summary-panel h4 { margin-bottom: 15px; color: var(--text-light); font-size: 1.1rem; }
    .summary-content p { margin: 10px 0; font-size: 0.95rem; }
    .summary-content strong { color: var(--primary); display: inline-block; width: 120px; }
`;
document.head.appendChild(style);
