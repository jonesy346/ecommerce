// display products
export default class UI {
    displayProducts(products, storage) {
        let result = '';
        if (productList.length === 0) {
            productList = products;
        }
        products.forEach(product => {
            let inCart = cart.find(item => item.id === product.id);
            let isDisabled = (inCart) ? "disabled" : "";
            let btnInnerText = (inCart) ? "in cart" : "add to bag";
            result += `
            <!-- single product -->
            <article class="product" data-category=${product.category}>
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id} ${isDisabled}>
                        <i class="fas fa-shopping-cart"></i>
                        ${btnInnerText}
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!-- end of single product -->
            `
        });
        productsDOM.innerHTML = result;
        this.getBagButtons(storage);
    }

    showFilteredProducts(event, storage) {
        const category = event.target.dataset.filter;

        if (category === "all") {
            this.displayProducts(productList, storage);
            return;
        }

        let newList = []; 

        productList.forEach(product => {
            if (product.category === category) {
                newList.push(product);
            } 
        });

        this.displayProducts(newList, storage);
    }

    setFilterBtns(storage) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', event => {
                this.showFilteredProducts(event, storage);
            });
        });
    }

    getBagButtons(storage) {
        console.log(storage);
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }

            button.addEventListener('click', event => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get product from products
                let cartItem = { ...storage.getProduct(id), amount:1 };

                // add product to the cart
                cart = [...cart, cartItem];

                // save cart in local storage
                storage.saveCart(cart);

                // set cart values
                this.setCartValues(cart);

                // display cart item
                this.addCartItem(cartItem);

                // show the cart
                this.showCart();
            });
        })
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const downOption = (item.amount > 1) ? "chevron-down" : "trash";

        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price} (ea.)</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-${downOption}" data-id=${item.id}></i>
        </div>
        `;
        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }

    setupAPP(storage) {
        cart = storage.getCart();
        this.setCartValues(cart);
        this.populate(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populate(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }

    cartLogic(storage, stripeHandler) {
        // clear cart button
        clearCartBtn.addEventListener('click', () => {
            this.clearCart(storage);
        });

        // checkout button
        checkoutBtn.addEventListener('click', () => {
            const price = parseFloat(cartTotal.innerText) * 100;
            stripeHandler.open({
                amount: price
            });
        });

        // cart functionality
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id, storage);
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id); 
                tempItem.amount = tempItem.amount + 1;
                storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
                if (tempItem.amount >= 1 && addAmount.nextElementSibling.nextElementSibling.classList.contains("fa-trash")) {
                    addAmount.nextElementSibling.nextElementSibling.classList.remove("fa-trash");
                    addAmount.nextElementSibling.nextElementSibling.classList.add("fa-chevron-down");
                } 
            } else if (event.target.classList.contains("fa-trash")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                cartContent.removeChild(lowerAmount.parentElement.parentElement);
                this.removeItem(id, storage);
            } else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id); 
                tempItem.amount = tempItem.amount - 1;

                storage.saveCart(cart);
                this.setCartValues(cart);
                lowerAmount.previousElementSibling.innerText = tempItem.amount;
                if (tempItem.amount === 1) {
                    lowerAmount.classList.remove("fa-chevron-down");
                    lowerAmount.classList.add("fa-trash");
                }   
            }
        })
    }

    clearCart(storage) {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id, storage));
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id, storage) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }

}