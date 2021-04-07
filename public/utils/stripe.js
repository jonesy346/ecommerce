import UI from "/ui.js";

const ui = new UI();
import Storage from "/storage.js";

export default class Stripe {
    stripeHandler = StripeCheckout.configure({
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
                alert(data.message);
                ui.clearCart(Storage);
            }).catch(error => {
                console.error(error);
            })
        }
    })
}