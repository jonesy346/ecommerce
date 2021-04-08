import Products from "../utils/products.js";
import UI from "../utils/ui.js";
import Storage from "../utils/storage.js";

// Get the modal
const modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
const showModal = (message) => {
    modal.querySelector('p').innerText = message;
    modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Upon document loading, display the products and add cart functionality
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    // setup app
    ui.setupAPP(Storage);

    // get all products
    products.getProducts().then(products => {
        ui.displayProducts(products, Storage);
        Storage.saveProducts(products);
    }).then(() => {
        ui.setFilterBtns(Storage);
        // ui.getBagButtons(document, Storage);
        ui.cartLogic(Storage, stripeHandler);
    });

    // setup Stripe checkout
    const stripeHandler = StripeCheckout.configure({
        key: stripePublicKey,
        locale: 'en',
        token: function(token) {
            fetch('/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    stripeTokenId: token.id,
                    cart: cart
                })
            }).then(res => {
                return res.json();
            }).then(data => {
                // alert(data.message);
                showModal(data.message);
                ui.clearCart(Storage);
            }).catch(error => {
                console.error(error);
            })
        }
    });
});