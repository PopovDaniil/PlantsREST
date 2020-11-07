class Model {
    constructor() {
        this.db = require("./db.json");
        this.plants = new Plants(this.db.plants);
    }
}

class Plants {
    constructor(data = []) {
        this.data = data;
    }
    get(latinName) {
        if (latinName) {
            return this.data.filter(
                item => item.latinName.toLowerCase() == latinName
            )[0] || new Error(`Item ${latinName} not found`);
        } else {
            return this.data;
        }
    }
}
module.exports = Model;