const products = {
  1: {
    id: 1,
    name: "Vestido Longo Queen",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85",
    description: "Vestido longo elegante, confortável e ideal para festas, jantares e ocasiões especiais."
  },
  2: {
    id: 2,
    name: "Vestido Esmeralda",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85",
    description: "Vestido feminino com corte elegante e presença marcante."
  },
  3: {
    id: 3,
    name: "Conjunto Royal Bege",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1200&q=85",
    description: "Conjunto moderno e versátil para um look sofisticado sem esforço."
  },
  4: {
    id: 4,
    name: "Mala Queen Gold",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85",
    description: "Mala elegante para completar os teus looks do dia e da noite."
  }
};

function getCart() {
  return JSON.parse(localStorage.getItem("kbCart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("kbCart", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id) {
  const cart = getCart();
  const item = cart.find(p => p.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  alert("Produto adicionado ao carrinho.");
}

function removeFromCart(id) {
  saveCart(getCart().filter(item => item.id !== id));
  renderCart();
}

function clearCart() {
  saveCart([]);
  renderCart();
}

function updateCartCount() {
  const total = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("#cartCount").forEach(el => el.textContent = total);
}

function toggleMenu() {
  document.getElementById("mainNav")?.classList.toggle("open");
}

function renderProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id") || 1);
  const product = products[id] || products[1];

  document.getElementById("productImage").src = product.image;
  document.getElementById("productName").textContent = product.name;
  document.getElementById("productPrice").textContent = `£${product.price.toFixed(2)}`;
  document.getElementById("productDescription").textContent = product.description;
  document.getElementById("addButton").onclick = () => addToCart(product.id);

  const text = encodeURIComponent(`Olá KB The Queen Boutique, quero encomendar: ${product.name} - £${product.price.toFixed(2)}.`);
  document.getElementById("whatsappProduct").href = `https://wa.me/447404824408?text=${text}`;
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const checkout = document.getElementById("checkoutWhatsApp");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart">O teu carrinho está vazio.<br><br><a class="btn primary" href="index.html">Ver produtos</a></div>`;
    totalEl.textContent = "£0.00";
    checkout.href = "#";
    return;
  }

  let total = 0;
  let message = "Olá KB The Queen Boutique, quero finalizar esta encomenda:%0A";

  container.innerHTML = cart.map(item => {
    const p = products[item.id];
    const subtotal = p.price * item.qty;
    total += subtotal;
    message += `%0A${item.qty}x ${encodeURIComponent(p.name)} - £${subtotal.toFixed(2)}`;
    return `
      <div class="cart-row">
        <img src="${p.image}" alt="${p.name}">
        <div><strong>${p.name}</strong><p>Quantidade: ${item.qty}</p></div>
        <div class="row-price">£${subtotal.toFixed(2)}</div>
        <button onclick="removeFromCart(${p.id})">Remover</button>
      </div>`;
  }).join("");

  totalEl.textContent = `£${total.toFixed(2)}`;
  message += `%0A%0ATotal: £${total.toFixed(2)}`;
  checkout.href = `https://wa.me/447404824408?text=${message}`;
}

document.addEventListener("DOMContentLoaded", updateCartCount);
