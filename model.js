const mariadb = require("mariadb");

class Model {
    constructor() {
        const PROD = Boolean(process.env.PORT);
        const dbAddress = PROD ? process.env.JAWSDB_MARIA_URL.replace("mysql", "mariadb") : {
            host: "localhost",
            user: "daniil",
            password: "12qw"
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
    async get(latinName) {
        if (latinName) {
            return (await this.data.query(`SELECT * FROM items WHERE LatinName='${latinName.toLowerCase()}'`))[0]
        } else {
            return await this.data.query(`SELECT * FROM items`);
        }
    }

    async set(name,latinName,description) {
        const exist = await this.get(latinName);
        if (exist) {
            return await this.data.query(`UPDATE items SET Name='${name}',Description='${description}' WHERE LatinName='${latinName.toLowerCase()}'`)
        } else {
            return await this.data.query(`INSERT INTO items (Name,LatinName,Description) VALUES ('${name}','${latinName}','${description}');`)
        }
    }

}
module.exports = Model;