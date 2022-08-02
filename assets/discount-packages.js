class DiscountPackages extends HTMLElement {
  constructor() {
    super();
    this.total = 0;
    this.itemCount = 1;
    this.product = {};
    this.products = [];
    this.selectedProducts = [];
    this.selections = [];

    const template = document.getElementById('dp-template');
    const templateElement = template.content.cloneNode(true);
    this.appendChild(templateElement);
    
    const data = JSON.parse(this.getAttribute('package'));
    const currentProductId = JSON.parse(this.getAttribute('product-id'));

    this.products = data.products.sort((a, b) => {
      if (a.id === currentProductId) return -1;
      if (b.id === currentProductId) return 1
      return 0;
    });

    this.product = this.products[0];
    this.products = this.products.slice(1);

    this.itemCount = data.itemCount;
    this.discount = data.discount;
    
    this.selectedItemCount = 2;
    this.selectedProducts = [this.product, this.products[0]];
    this.selections = [
      {
        product: this.product,
        variant: this.product.variants[0],
        quantity: 1,
      }, 
      { 
        product: this.products[0],
        variant: this.products[0].variants[0],
        quantity: 1,
      }
    ];
    
    this.removeAttribute('package');

    this.querySelector('.package__add-to-cart').addEventListener('click', (event) => {
      this.addToCart(event);
    });
  }

  render() {
    this.updateCount();
    this.updatePrice();

    const productTemplate = document.getElementById('dp-product');
    const productSingleEntry = this.querySelector('[data-product-single]');
    const productListEntry = this.querySelector('[data-product-list]');

    this.setupProduct(this.product, productTemplate, productSingleEntry, true);
    this.products.forEach((product, index) => this.setupProduct(product, productTemplate, productListEntry, index === 0));

    // Update
    if (this.discount.enabled) {
      const discount = this.querySelector('[data-package-discount]');
      const discountAmount = this.discount.type === 'percentage' ? `${this.discount.value}%`: window.theme.Currency.formatMoney(this.discount.value * 100);
      discount.innerText = discountAmount;
      discount.classList.add(this.discount.type);
    } else {
      this.querySelector('.package__discount-message').style.display = 'none';
    }
  }

  updateRender() {
    this.updateCount();
    this.updatePrice();
  }

  setupProduct(product, template, entrypoint, setActive) {
    if (!product.available) return;
    const productEl = template.content.cloneNode(true);
    const productContainerEl = productEl.querySelector('[data-product]');
    const imgEl = productEl.querySelector('[data-product-image]');
    const titleEl = productEl.querySelector('[data-product-title]');
    const priceEl = productEl.querySelector('[data-product-price]');
    const quantityEl = productEl.querySelector('[data-quantity]');
    const quantityToggleEl = Array.from(productEl.querySelectorAll('[data-quantity-toggle]'));
    const checkboxEl = productEl.querySelector('[data-product-checkbox]');
    const variantSelectorEl = productEl.querySelector('[data-product-variant-selector]');
    const addInputEl = productEl.querySelector('[data-add-input]');

    productContainerEl.setAttribute('data-product', product.id);
    imgEl.src = this.getSizedImage(product.featured_image, { width: 500 });
    titleEl.innerText = product.title;
    priceEl.innerText = window.theme.Currency.formatMoney(product.variants[0].price);
    addInputEl.name = `items[${product.variants[0].id}]`;

    if (setActive) {
      checkboxEl.checked = true;
      quantityEl.disabled = false;
      variantSelectorEl.disabled = false;
      addInputEl.disabled = false;
    }

    product.variants.forEach((variant, index) => {
      const option = document.createElement('option');
      option.value = variant.id;
      option.innerText = variant.title;
      if (index === 0) option.selected = true;
      variantSelectorEl.appendChild(option);
    });

    if (product.variants.length === 1) {
      variantSelectorEl.style.opacity = 0;
    } else {
      variantSelectorEl.addEventListener('input', (event) => {
        const variantId = parseInt(event.target.value, 10);
        const selectedVariant = product.variants.find((variant) => variant.id === variantId);
        priceEl.innerText = window.theme.Currency.formatMoney(selectedVariant.price);
        imgEl.src = this.getSizedImage(selectedVariant.featured_image.src, { width: 500 });
        addInputEl.name = `items[${variantId}]`;

        const selectionIndex = this.selections.findIndex(({ product: p }) => p.id === product.id);
        if (selectionIndex !== -1) {
          this.selections[selectionIndex] = {
            ...this.selections[selectionIndex],
            variant: selectedVariant,
          }
          this.updateRender();
        }
      });
    }

    quantityToggleEl.forEach((toggle) => {
      toggle.addEventListener('click', (event) => {
        const currentQty = parseInt(quantityEl.value, 10);
        const adjustment = parseInt(event.target.dataset.quantityToggle, 10);
        let newQty = currentQty + adjustment;
        if (newQty < quantityEl.min) newQty = parseInt(quantityEl.min, 10);
        quantityEl.value = newQty;
        addInputEl.value = newQty;

        const selectionIndex = this.selections.findIndex(({ product: p }) => p.id === product.id);
        if (selectionIndex !== -1) {
          this.selections[selectionIndex] = {
            ...this.selections[selectionIndex],
            quantity: newQty,
          }
          this.updateRender();
        }
      });
    })

    checkboxEl.addEventListener('input', (event) => {
      if (event.target.checked) {
        this.selectedProducts.push(product);
        this.selections.push({ product, variant: product.variants[0], quantity: parseInt(quantityEl.value, 10) });
        variantSelectorEl.disabled = false;
        quantityEl.disabled = false;
        addInputEl.disabled = false;
      } else {
        this.selectedProducts = this.selectedProducts.filter((p) => p.id !== product.id);
        this.selections = this.selections.filter(({ product: p }) => p.id !== product.id);
        variantSelectorEl.disabled = true;
        quantityEl.disabled = true;
        addInputEl.disabled = true;
      }

      this.selectedItemCount = this.selectedProducts.length;
      this.updateRender();
    });

    const quickViewModalButton = productEl.querySelector('[data-product-quickview]');
    if (quickViewModalButton) quickViewModalButton.classList.add(`js-modal-open-quick-modal-${product.id}`);

    entrypoint.appendChild(productEl);

    if (quickViewModalButton) {
      theme.preloadProductModal(product.handle, product.id, quickViewModalButton);
    }
  }

  addToCart(event) {
    event.preventDefault();
    const form = event.target.closest('form');
    if (this.discount.enabled) {
      fetch(`/discount/${window.atob(this.discount.code)}`)
      .then(() => {
        this.formSubmit(form);
      })
    } else {
      this.formSubmit(form);
    }
  }

  getFormData(form) {
    const data = new FormData(form);
    let items = [];
    for (const pair of data.entries()) {
      const id = pair[0].replace('items[','').replace(']','');
      const item = {
        id,
        quantity: pair[1],
        properties: {
          '_DiscountPackages': true,
        },
      }
      items.push(item);
    }
    return items;
  }

  formSubmit(form) {
    const items = this.getFormData(form);
    fetch(window.theme.routes.cartAdd, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items }),
    })
    .then((res) => res.json())
    .then((res) => { window.location = window.theme.routes.cartPage })
    .catch(console.error); 
  }

  updateCount() {
    const itemCount = this.querySelector('.package__item-count');
    const packageDiscount = this.querySelector('.package__info--discount');
    const packageMinimum = this.querySelector('.package__info--minimum');
    
    const itemCountWithQuantity = this.selections.reduce((total, { quantity }) => {
      return total += quantity;
    }, 0);

    itemCount.innerText = `${itemCountWithQuantity} ${itemCountWithQuantity > 1 ? 'items': 'item'}`;

    if (this.discount.enabled && this.selectedItemCount < this.discount.min_quantity) {
      if (packageDiscount) packageDiscount.classList.add('hide');
      if (packageMinimum) packageMinimum.classList.remove('hide');
    } else {
      if (packageDiscount) packageDiscount.classList.remove('hide');
      if (packageMinimum) packageMinimum.classList.add('hide');
    }
  }

  updatePrice() {
    const originalTotalPrice = this.getOriginalTotalPrice();
    const totalPrice = this.getTotalPrice();

    const comparePriceEl = this.querySelector('.package__total-compare');
    const totalPriceEl = this.querySelector('.package__total-amount');

    if (totalPrice < originalTotalPrice && comparePriceEl) comparePriceEl.innerText = window.theme.Currency.formatMoney(originalTotalPrice);
    totalPriceEl.innerText = window.theme.Currency.formatMoney(totalPrice);
  }

  getOriginalTotalPrice() {
    return this.selections.reduce((total, { variant, quantity }) => {
      return total += (variant.price * quantity);
    }, 0);
  }
  
  getTotalPrice() {
    return this.selections.reduce((total, { variant, quantity }) => {
      if (
        !this.discount.enabled ||
        this.selectedProducts.length < this.discount.min_quantity
      ) return total += (variant.price * quantity);
      
      let discountedProductPrice = (variant.price * quantity);
      if (this.discount.type === 'percentage') discountedProductPrice -= (discountedProductPrice * (this.discount.value / 100));
      if (this.discount.type === 'fixed_amount') discountedProductPrice -= (this.discount.value * quantity);
      return total += discountedProductPrice;
    }, 0);
  }

  getSizedImage(src, { width, height }) {
    let source =  src;
    if (width) source += `&width=${width}`;
    if (height) source += `&height=${height}`;
    return source;
  }

  connectedCallback() {
    document.addEventListener('DOMContentLoaded', () => this.render());
  }
}

window.customElements.define('discount-packages', DiscountPackages);
