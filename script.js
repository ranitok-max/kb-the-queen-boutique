const WHATSAPP_NUMBER = "447404824408";
let products = [];
let currentProduct = null;
let selectedColor = "";
let selectedSize = "";
let cart = JSON.parse(localStorage.getItem("kbCart") || "[]");

const money = n => `£${n.toFixed(2)}`;
const grid = document.getElementById("productGrid");
const modal = document.getElementById("productModal");
const drawer = document.getElementById("cartDrawer");

async function init(){
  products = await fetch("products.json").then(r=>r.json());
  renderProducts(products);
  updateCart();
}
function renderProducts(list){
  grid.innerHTML = list.map(p=>`
    <article class="product-card">
      <div class="product-image" onclick="openProduct(${p.id})">
        <img src="${p.main}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-card-body">
        <span class="product-category">${p.category.toUpperCase()}</span>
        <h3>${p.name}</h3>
        <p class="subtitle">${p.subtitle}</p>
        <p class="price">${money(p.price)}</p>
        <div class="card-actions">
          <button class="view-btn" onclick="openProduct(${p.id})">Ver produto</button>
          <button class="quick-add" onclick="openProduct(${p.id})" aria-label="Escolher opções">+</button>
        </div>
      </div>
    </article>`).join("");
}
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  const f=btn.dataset.filter;
  renderProducts(f==="Todos"?products:products.filter(p=>p.category===f));
}));

function openProduct(id){
  currentProduct=products.find(p=>p.id===id);
  selectedColor=currentProduct.colors[0];
  selectedSize=currentProduct.sizes[0];
  document.getElementById("modalCategory").textContent=currentProduct.category;
  document.getElementById("modalName").textContent=currentProduct.name;
  document.getElementById("modalSubtitle").textContent=currentProduct.subtitle;
  document.getElementById("modalPrice").textContent=money(currentProduct.price);
  document.getElementById("modalDescription").textContent=currentProduct.description;
  document.getElementById("modalNote").textContent=currentProduct.note;
  renderOptions();
  renderMedia(currentProduct.gallery[0],0);
  renderThumbs();
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
}
function renderOptions(){
  const colors=document.getElementById("colorOptions");
  colors.innerHTML=currentProduct.colors.map(c=>`<button class="option ${c===selectedColor?"selected":""}" onclick="selectColor('${c.replaceAll("'","\\'")}')">${c}</button>`).join("");
  const sizes=document.getElementById("sizeOptions");
  sizes.innerHTML=currentProduct.sizes.map(s=>`<button class="option ${s===selectedSize?"selected":""}" onclick="selectSize('${s.replaceAll("'","\\'")}')">${s}</button>`).join("");
}
function selectColor(c){
  selectedColor=c; renderOptions();
  if(currentProduct.colorImages && currentProduct.colorImages[c]){
    const media={type:"image",src:currentProduct.colorImages[c],label:c};
    renderMedia(media,-1);
  }
}
function selectSize(s){selectedSize=s;renderOptions()}
function renderThumbs(){
  document.getElementById("mediaThumbs").innerHTML=currentProduct.gallery.map((m,i)=>`
    <button class="media-thumb ${i===0?"active":""}" onclick="renderMediaByIndex(${i})" title="${m.label}">
      ${m.type==="video"?`<video src="${m.src}" muted preload="metadata"></video>`:`<img src="${m.src}" alt="${m.label}">`}
    </button>`).join("");
}
function renderMediaByIndex(i){renderMedia(currentProduct.gallery[i],i)}
function renderMedia(media,index){
  const stage=document.getElementById("mediaStage");
  stage.innerHTML=media.type==="video"
    ? `<video src="${media.src}" controls playsinline preload="metadata"></video>`
    : `<img src="${media.src}" alt="${media.label}">`;
  document.querySelectorAll(".media-thumb").forEach((t,j)=>t.classList.toggle("active",j===index));
}
function closeModal(){
  modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.style.overflow="";
}
document.querySelectorAll("[data-close-modal]").forEach(x=>x.addEventListener("click",closeModal));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();closeCart()}});

function addCurrentToCart(){
  const existing=cart.find(x=>x.id===currentProduct.id && x.color===selectedColor && x.size===selectedSize);
  if(existing) existing.qty+=1;
  else cart.push({id:currentProduct.id,name:currentProduct.name,price:currentProduct.price,image:currentProduct.colorImages?.[selectedColor]||currentProduct.main,color:selectedColor,size:selectedSize,qty:1});
  saveCart();closeModal();openCart();
}
document.getElementById("addToCartBtn").addEventListener("click",addCurrentToCart);
document.getElementById("buyNowBtn").addEventListener("click",()=>{
  const text=`Olá KB The Queen Boutique! Quero encomendar:%0A%0A${currentProduct.name}%0ACor: ${selectedColor}%0ATamanho: ${selectedSize}%0APreço: ${money(currentProduct.price)}%0A%0APodem confirmar a disponibilidade?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,"_blank");
});
function saveCart(){localStorage.setItem("kbCart",JSON.stringify(cart));updateCart()}
function updateCart(){
  document.getElementById("cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);
  const wrap=document.getElementById("cartItems");
  if(!cart.length) wrap.innerHTML=`<div class="empty-cart">A tua sacola está vazia.</div>`;
  else wrap.innerHTML=cart.map((x,i)=>`
    <div class="cart-item">
      <img src="${x.image}" alt="${x.name}">
      <div><h4>${x.name}</h4><p>Cor: ${x.color}</p><p>Tamanho: ${x.size}</p><p>${x.qty} × ${money(x.price)}</p></div>
      <button class="remove-item" onclick="removeItem(${i})">×</button>
    </div>`).join("");
  document.getElementById("cartTotal").textContent=money(cart.reduce((a,x)=>a+x.price*x.qty,0));
}
function removeItem(i){cart.splice(i,1);saveCart()}
function openCart(){drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
function closeCart(){drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true");document.body.style.overflow=""}
document.getElementById("cartBtn").addEventListener("click",openCart);
document.querySelectorAll("[data-close-cart]").forEach(x=>x.addEventListener("click",closeCart));
document.getElementById("clearCartBtn").addEventListener("click",()=>{cart=[];saveCart()});
document.getElementById("checkoutBtn").addEventListener("click",()=>{
  if(!cart.length){alert("A tua sacola está vazia.");return}
  const lines=cart.map((x,i)=>`${i+1}. ${x.name}%0A   Cor: ${x.color}%0A   Tamanho: ${x.size}%0A   Quantidade: ${x.qty}%0A   Subtotal: ${money(x.price*x.qty)}`).join("%0A%0A");
  const total=money(cart.reduce((a,x)=>a+x.price*x.qty,0));
  const text=`Olá KB The Queen Boutique! Quero finalizar esta encomenda:%0A%0A${lines}%0A%0ATotal: ${total}%0A%0APodem confirmar a disponibilidade e o pagamento?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,"_blank");
});
init();
