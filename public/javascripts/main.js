/**
 * Контроллер растения
 */
class Plant {
    /**
    * @param {String} name Название
    * @param {String} latinName Латинское название
    * @param {String} description Описание
    * @param {Views} views Ссылка на коллекцию представлений
    */
    constructor(name, latinName, description, views) {
        this.name = name;
        this.latinName = latinName;
        this.description = description;
        this.views = views;
    }
    /**
     * Возвращает представление в виде HTML
     * @param {String} viewId Идентификатор представления
     * @returns {String}
     */
    get(viewId) {
        return this.views.get(viewId, this);
    }
    /**
     * Вставляет представление на страницу
     * @param {String} viewId Идентификатор представления
     */
    insert(viewId) {
        this.views.insert(viewId, this);
    }
}
/**
 * Коллекция представлений
 */
class Views {
    /**
     * Массив функций, возвращающих представления
     * @type {Map<String,Function>}
     */
    views = new Map();
    /**
     * @param {String} selector Селектор места вставки изменяющегося содержимого
     */
    constructor(selector) {
        document.addEventListener("DOMContentLoaded", () => {
            /**
             * @property Элемент, в котрый будет вставляться представление
             */
            this.$root = document.querySelector(selector);
            if (!this.$root) throw new Error("Root element doesn't exist");
        });
    }
    /**
     * Добавляет функцию представления в массив
     * @param {String} id Идентификатор представления
     * @param {Function<String>} func Функция, принимающая PlantModel и возвращающая представление
     * @returns {Views} this
     */
    add(id, func) {
        this.views.set(id, func);
        return this;
    }
    /**
     * Вставляет представление, сгенерированное функцией представления
     * @param {String} id Идентификатор представления
     * @param {PlantModel} model Растение
     * @returns {Views} this
     */
    insert(id, model) {
        const func = this.views.get(id);
        /**@type {String} */
        const view = func(model);
        this.$root.innerHTML = view;

        document.querySelectorAll("a").forEach(
            link => link.onclick = linkHandler
        )
        document.querySelectorAll("form").forEach(
            form => form.onsubmit = formHandler
        )
        return this;
    }
    /**
     * Возвращает представление
     * @param {String=} id Идентификатор функции
     * @returns {String|Array<Function>}
     */
    get(id, model) {
        if (id) {
            return this.views.get(id)(model);
        } else {
            return this.views;
        }
    }
}

class Router {
    /**
     * @type {Map<String|RegExp,Function<void>}
     */
    routes = new Map();
    /**
     * @type {Function<void>} Маршрут по умолчанию (срабатывает, если ни один не подошёл)
     */
    defaultRoute;
    /**
     * Добавляет маршрут в массив
     * @param {String|RegExp} uri Путь
     * @param {Function<String>} func Функция обработки маршрута
     * @returns {Router} this
     */
    add(uri, func) {
        this.routes.set(uri, func);
        return this;
    }
    /**
     * Устанавливает маршрут по умолчанию
     * @param {Function<void>} func Обработчик маршрута по умолчанию
     */
    default(func) {
        this.defaultRoute = func;
    }
    /**
     * Вызывает функцию обработки маршрута, соответствующую пути
     * @param {String} method Метод HTTP-запроса
     * @param {String} path Запрашиваемый адрес
     * @param {Boolean} fromHistory Был ли произведён переход по истории браузера, или же по ссылке
     * @param {Object=} data Необязательные данные, передаваемые обработчику
    */
    async request(method, path, fromHistory, data) {
        method = method.toUpperCase();
        if (method == "GET") $main.innerHTML = "";
        let routeExists = false;
        this.routes.forEach((func, uri) => {
            if ((uri instanceof RegExp && path.match(uri)) || path == uri) {
                func(method, path, data);
                routeExists = true;
            }
        })
        if (!routeExists) {
            this.defaultRoute?.();
        }
        if (!fromHistory && path != history.state?.path) {
            window.history.pushState({ path: path }, document.title, path);
        }
    }
}

const plantViews = new Views("main");
plantViews
    .add("card", ({ name, latinName, description }) => {
        return `
    <div class="w3-padding w3-half">
            <section class="w3-card-4 w3-container w3-theme w3-margin-top" style="height: 230px">
                <img src="/images/${latinName.toLowerCase()}.jpg" alt="" class="w3-col small w3-left-align w3-margin">
                <a class="w3-xlarge" href="/plants/${latinName.toLowerCase()}">${name}</a>
                <p class="w3-small description">${description}
            </section>
    </div>`
    })
    .add("plant", ({ name, latinName, description }) => {
        return `
    <div class="w3-section">
        <section class="w3-card w3-padding w3-theme w3-container">
        <h1 id="name">${name}&nbsp;<span class="w3-text-dark-gray w3-medium vert-middle">(${latinName})</span></h1>
        <div class="w3-threequarter w3-padding" id="description">
            ${name} - ${description}
        </div>
        <img src="/images/${latinName}.jpg" class="w3-quarter">
    </section>
    <a href="/plants/${latinName}?edit">Редактировать</a>
</div>`
    })
    .add("edit", ({ name, latinName, description } = {}) => {
        const newElement = !(name || latinName || description);
        return `
    <h2>${newElement ? "Создание" : "Изменение"} растения</h2>
    <form method="POST" action="/plants">
        Название: <input type="text" name="name" value="${name ?? ""}" required maxlength="100"><br>
        Латинское название: <input type="text" name="latin" value="${latinName ?? ""}" ${newElement ? "" : "readonly"} required maxlength="100"><br>
        Описание: <br> <textarea name="description" cols="30" rows="10" required>${description ?? ""}</textarea><br>
        <input type="submit" value="Записать">
    </form>
`
    })
console.log(plantViews.views);

const catalogViews = new Views("main")
.add("edit", catalog => {
    let html = `<h2>${catalog[0] ? 'Редактирование каталога' : "Не найдено"}</h2>
                <p><a href='/plants?add'>Добавить растение</a></p>`;
    catalog.forEach(item => {
        html += `
        <div>
        <a href='/plants/${item.LatinName}' class="name">${item.Name}(${item.LatinName})</a><br>
        <p>${item.Description}</p>
        <a href="/plants/${item.LatinName}?edit" class="underline">Редактировать</a>
        <a data-method="DELETE" data-action="/plants/${item.LatinName}" class="underline">Удалить</a>
        </div>
        <hr>`
    })
    return html;
})
.add("list", () => {
    return `<div class="w3-right"><a href="?edit">Редактировать</a></div>
    <div class="w3-row-padding w3-section">
    <div class="w3-third">
        <h2 class="w3-text-theme w3-center">Научная классификация</h2>
        <section class="w3-card-4 w3-bar-block w3-theme w3-margin-top">
            <a class="w3-bar-item w3-button" href="plants?tag=водоросли">Водоросли</a>
            <a class="w3-bar-item w3-button" href="plants?tag=мхи">Мхи</a>
            <a class="w3-bar-item w3-button" href="plants?tag=хвойные">Хвойные</a>
            <a class="w3-bar-item w3-button" href="plants?tag=цветковые">Цветковые</a>
        </section>
    </div>
    <div class="w3-third">
        <h2 class="w3-text-theme w3-center">По жизненной форме</h2>
        <section class="w3-card-4 w3-bar-block w3-theme w3-margin-top">
            <a class="w3-bar-item w3-button" href="plants?tag=травы">Травы</a>
            <a class="w3-bar-item w3-button" href="plants?tag=кустарники">Кустарники</a>
            <a class="w3-bar-item w3-button" href="plants?tag=деревья">Деревья</a>
            <a class="w3-bar-item w3-button" href="plants?tag=лианы">Лианы</a>
        </section>
    </div>
    <div class="w3-third">
        <h2 class="w3-text-theme w3-center">По времени цветения</h2>
        <section class="w3-card-4 w3-bar-block w3-theme w3-margin-top">
            <a class="w3-bar-item w3-button w3-theme-d2" href="plants?tag=май">Май</a>
            <a class="w3-bar-item w3-button" href="plants?tag=июнь">Июнь</a>
            <a class="w3-bar-item w3-button" href="plants?tag=июль">Июль</a>
            <a class="w3-bar-item w3-button" href="plants?tag=август">Август</a>
        </section>
    </div>
</div>`
})

const router = new Router();
router
    .add("/", () => {
        index({}, true);
        document.title = "Главная";
    })
    .add(/plants\/.*/, async (method, uri, data) => {
        if (method == "GET") {
            const content = await requestAPI(uri, { method: method });
            console.log(content);
            const plant = new Plant(content.Name, content.LatinName, content.Description, plantViews);
            plant.insert("plant");
            document.title = content.Name;
        } else if (method == "POST" || method == "DELETE") {
            const response = await requestAPI(uri, {
                method,
                data: JSON.stringify(data)
            })
            console.log(response);
            router.request("GET", "/catalog")
        }
    })
    .add("plants?add", async () => {
        plantViews.insert('edit');
        document.title = "Создание растения";
    })
    .add(/plants\?(search|tag)=/, async (method, uri) => {
        const response = await requestAPI(uri);
        console.log(response);
        catalogViews.insert('edit', response)
    })
    .add(/plants/, async (method, uri, data) => {
        if (method == 'POST') {
            const response = await requestAPI(`/plants/${data.latinName}`, {
                method: 'POST',
                data: JSON.stringify(data)
            })
            console.log(response);
            router.request('GET', '/catalog')
        } else if (method == 'GET' && data) {
            const response = await requestAPI(`${uri}?search=${data.search}`);
            console.log(response);
            catalogViews.insert('edit', response)
        }
    })
    .add(/plants\/.*\?edit/, async (method, uri) => {
        const content = await requestAPI(uri);
        const plant = new Plant(content.Name, content.LatinName, content.Description, plantViews);
        plant.insert("edit");
        document.title = `Редактирование ${content.Name}`;
    })
    .add("/catalog", async () => catalogViews.insert("list"))
    .add("/catalog?edit", async () => {
        const content = await requestAPI("/plants");
        catalogViews.insert("edit", content);
    })
    .default(() => {
        console.log("Not found");
    })
console.log(router.routes);

/**
 * @type {HTMLElement} Элемент, в который будут вставляться представления
 */
let $main;

document.addEventListener("DOMContentLoaded", () => {
    $main = document.querySelector("main");

    const path = location.pathname + location.search;
    router.request("GET", path);

    console.log(path);
});
window.onpopstate = () => {
    router.request("GET", history.state.path, true);
}
/**
 * @param {Boolean} transitted Был ли совершён пользователем переход на главную или она открылась прии заходе на сайт
 */
async function index(event, transitted) {
    /**
     * Вставляет указанное количество карточек случайных растений
     * @param {Array} model Каталог
     * @param {String} selector Селектор места вставки
     * @param {Number} number Количество генерируемых карточек
     */
    function randomCards(model, selector, number) {
        const root = document.querySelector(selector);
        if (!root) throw new Error("Root element doesn't exist");
        for (let i = 0; i < number; i++) {
            const r = randint(0, model.length - 1);
            const item = new Plant(model[r].Name, model[r].LatinName, model[r].Description, plantViews);
            const crd = item.get("card");
            root.insertAdjacentHTML("beforeend", crd);
        }

        function randint(min, max) {
            const r = Math.random();
            const l = r * (max - min) + min;
            return Math.round(l);
        };
    }
    const root = document.querySelector("main");
    const indexHTML = `<h2>Главная</h2><div id="content"></div>`;
    root.insertAdjacentHTML("afterbegin", indexHTML);

    const plants = await requestAPI("/plants");
    randomCards(plants, "#content", 6);

    document.querySelectorAll("a").forEach(
        link => link.onclick = linkHandler
    );
    if (!transitted) {
        window.history.replaceState({ uri: "/" }, document.title, "/");
    }
}

/**
 * Обработчик, запускающийся при нажатии на ссылку
 * @param {Event} event Объект события
 * @this {HTMLAnchorElement} Ссылка
 */
async function linkHandler(event) {
    event.preventDefault();
    const uri = this.dataset["action"] || this.pathname;
    const params = this.search;
    const method = this.dataset["method"] || "GET";

    await router.request(method, uri + params, false)
}
/**
 * 
 * @param {Event} event 
 * @this {HTMLFormElement}
 */
async function formHandler(event) {
    event.preventDefault();
    const resource = new URL(this.action).pathname,
        type = resource.split("/")[1],
        method = this.method;

    let data = {};
    if (type == "plants") {
        if (this['search']) {
            data = {
                search: this['search'].value
            }
        } else {
            data = {
                Name: this['name'].value,
                LatinName: this['latin'].value.toLowerCase(),
                Description: this['description'].value
            };
        }
    } else throw new Error("Unknown resource type");

    router.request(method, resource, false, data);
}

async function requestAPI(resource = "", options = {}) {
    const response = await fetch("/api" + resource, {
        method: options.method || "GET",
        body: options.data
    })
    return await response.json();
}