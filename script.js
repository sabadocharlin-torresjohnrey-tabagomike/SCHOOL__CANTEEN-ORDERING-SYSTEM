let cartItems = [];
let allOrders = [];
let currentCategory = 'all';

function updatePriceDisplay(idKey) {
    let select = document.getElementById(`size-${idKey}`);
    if(!select) return;
    let selectedOption = select.options[select.selectedIndex];
    let price = selectedOption.getAttribute('data-price');
    let priceEl = document.getElementById(`price-${idKey}`);
    if(priceEl) priceEl.innerText = `₱${price}`;
}

function filterCategory(category, btnElement) {
    currentCategory = category;
    let buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    let items = document.querySelectorAll('.item-card');
    items.forEach(item => {
        let cat = item.getAttribute('data-category');
        if (category === 'all' || cat === category) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterMenu() {
    let query = document.getElementById('searchInput').value.toLowerCase();
    let items = document.querySelectorAll('.item-card');
    items.forEach(item => {
        let name = item.getAttribute('data-name');
        let cat = item.getAttribute('data-category');
        let matchesSearch = name.includes(query);
        let matchesCategory = (currentCategory === 'all' || cat === currentCategory);
        if (matchesSearch && matchesCategory) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function triggerCheckmarkFeedback(btnElement) {
    if (!btnElement) return;
    let originalText = btnElement.innerText;
    btnElement.innerText = '✔ Added!';
    btnElement.classList.add('added-success');
    
    setTimeout(() => {
        btnElement.innerText = originalText;
        btnElement.classList.remove('added-success');
    }, 3000);
}

function addOrderFromCard(itemName, sizeId, qtyId, btnElement) {
    let select = document.getElementById(sizeId);
    let qtyInput = document.getElementById(qtyId);
    if (!select || !qtyInput) return;

    let selectedOption = select.options[select.selectedIndex];
    let sizeName = selectedOption.value;
    let price = parseFloat(selectedOption.getAttribute('data-price'));
    let qty = parseInt(qtyInput.value) || 1;

    let existing = cartItems.find(i => i.name === itemName && i.size === sizeName);
    if (existing) {
        existing.qty += qty;
    } else {
        cartItems.push({ name: itemName, size: sizeName, price: price, qty: qty });
    }
    updateCartDisplay();
    triggerCheckmarkFeedback(btnElement);
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    updateCartDisplay();
}

function updateCartDisplay() {
    let tbody = document.getElementById('cart-list');
    tbody.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #777;">YOUR TRAY IS EMPTY. Touch any item to order!</td></tr>`;
        document.getElementById('total-price').innerText = '0.00';
        return;
    }

    cartItems.forEach((item, index) => {
        let itemTotal = item.price * item.qty;
        total += itemTotal;
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.size}</td>
                <td>${item.qty}</td>
                <td>₱${itemTotal}</td>
                <td><button class="btn-cancel" onclick="removeFromCart(${index})">X</button></td>
            </tr>
        `;
    });
    document.getElementById('total-price').innerText = total.toFixed(2);
}

function checkout() {
    let customerName = document.getElementById('customerName').value.trim();
    if (!customerName) {
        alert('Please enter your Customer Identification Name before placing an order.');
        return;
    }
    if (cartItems.length === 0) {
        alert('Your tray is empty!');
        return;
    }

    let totalAmount = cartItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
    let orderSummaryText = cartItems.map(i => `${i.qty}x ${i.name} (${i.size})`).join(', ');

    allOrders.push({
        customer: customerName,
        items: orderSummaryText,
        total: totalAmount
    });

    alert('Order placed successfully! Thank you, ' + customerName + '!');
    cartItems = [];
    updateCartDisplay();
    document.getElementById('customerName').value = '';
    displayAdminOrders();
}

function toggleAdmin() {
    let customerView = document.getElementById('customer-view');
    let adminView = document.getElementById('admin-view');
    if (adminView.style.display === 'block') {
        adminView.style.display = 'none';
        customerView.style.display = 'block';
    } else {
        adminView.style.display = 'block';
        customerView.style.display = 'none';
        displayAdminOrders();
    }
}

function displayAdminOrders() {
    let tbody = document.getElementById('admin-order-list');
    tbody.innerHTML = '';

    if (allOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #777;">No customer orders yet.</td></tr>`;
        return;
    }

    allOrders.forEach((order, index) => {
        tbody.innerHTML += `
            <tr>
                <td>#${index + 1}</td>
                <td>${order.customer}</td>
                <td>${order.items}</td>
                <td>₱${order.total.toFixed(2)}</td>
                <td><button class="btn-complete" onclick="completeOrder(${index})">Complete / Clear</button></td>
            </tr>
        `;
    });
}

function completeOrder(index) {
    allOrders.splice(index, 1);
    displayAdminOrders();
}

/* Modal Popup Functions with Add to Cart */
function openProductModal(title, imgSrc, price, options, sourceSizeId, sourceQtyId) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalImg').src = imgSrc;
    document.getElementById('modalPrice').innerText = price;
    
    let modalSelect = document.getElementById('modalSizeSelect');
    modalSelect.innerHTML = '';
    
    let sourceSelect = document.getElementById(sourceSizeId);
    if (sourceSelect) {
        for (let opt of sourceSelect.options) {
            let newOpt = document.createElement('option');
            newOpt.value = opt.value;
            newOpt.setAttribute('data-price', opt.getAttribute('data-price'));
            newOpt.innerText = opt.innerText;
            modalSelect.appendChild(newOpt);
        }
    }

    let sourceQty = document.getElementById(sourceQtyId);
    document.getElementById('modalQtyInput').value = sourceQty ? sourceQty.value : 1;

    let addBtn = document.getElementById('modalAddBtn');
    addBtn.onclick = function() {
        let selectedOption = modalSelect.options[modalSelect.selectedIndex];
        let sizeName = selectedOption.value;
        let itemPrice = parseFloat(selectedOption.getAttribute('data-price'));
        let qty = parseInt(document.getElementById('modalQtyInput').value) || 1;

        let existing = cartItems.find(i => i.name === title && i.size === sizeName);
        if (existing) {
            existing.qty += qty;
        } else {
            cartItems.push({ name: title, size: sizeName, price: itemPrice, qty: qty });
        }
        updateCartDisplay();

        // Find corresponding item card button to trigger checkmark animation
        let cardButtons = document.querySelectorAll('.item-card button');
        cardButtons.forEach(btn => {
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${title}'`)) {
                triggerCheckmarkFeedback(btn);
            }
        });

        closeProductModal();
    };

    document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}