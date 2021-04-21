const mariadb = require("mariadb");

class Model {
    constructor() {
        const PROD = Boolean(process.env.PORT);
        const dbAddress = PROD ? process.env.JAWSDB_MARIA_URL.replace("mysql", "mariadb") : {
            host: "localhost",
            user: "daniil" 
        };
        (async () => {
            try {
                this.db = await mariadb.createConnection(dbAddress)
                    .catch(err => {
                        throw new Error("MariaDB connection error:" + err.message)
                    });
                if (!PROD) this.db.query("USE catalog");
            } catch (err) {
                console.error(err);
                process.exit(1);
            }
            this.plants = new Plants(this.db);
        })()
    }
}

class Plants {
    /**
     * @param {import("mariadb").Connection} db 
     */
    constructor(db) {
        this.data = db;
    }
    /**
     * 
     * @param {String} latinName
     */
    async get({latinName,description, tag} = {}) {
        if (latinName && !description && !tag) {
            return (await this.data.query(`SELECT * FROM items WHERE LatinName='${latinName.toLowerCase()}'`))[0]
        } 
        else if (description) {
            return await this.data.query(`SELECT * FROM items WHERE Description LIKE '%${description}%' or LatinName LIKE '%${description}%' or Name LIKE '%${description}%'`)
        }
        else if (tag) {
            return await this.data.query(`SELECT * FROM items WHERE Tags LIKE '% ${tag} %' OR Tags LIKE '${tag}' OR Tags Like '${tag} %' OR Tags Like '% ${tag}'`);
        }
        else {
            return await this.data.query(`SELECT * FROM items`);
        }
    }

    async set(name,latinName,description, tags) {
        const exist = await this.get(latinName);
        if (exist) {
            return await this.data.query(`UPDATE items SET Name='${name}',Description='${description}', Tags='${tags}' WHERE LatinName='${latinName.toLowerCase()}'`)
        } else {
            return await this.data.query(`INSERT INTO items (Name,LatinName,Description, Tags) VALUES ('${name}','${latinName.toLowerCase()}','${description}', '${tags}');`)
        }
    }
    async delete(latinName) {
        return await this.data.query(`DELETE FROM items WHERE LatinName='${latinName.toLowerCase()}'`)
    }
}
module.exports = Model;