// getting the products
export default class Products {
    async getProducts() {
        try {
            let result = await fetch("../../products.json");
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const { title, category, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, category, price, id, image };
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}