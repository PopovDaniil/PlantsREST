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
     * @returns {ThisType<Views>} this
     */
    insert(id, model) {
        const func = this.views.get(id);
        /**@type {String} */
        const view = func(model);
        this.$root.innerHTML = view;
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

const plantViews = new Views("main");
plantViews
    .add("card", ({ name, latinName, description }) => {
        return `
    <div class="w3-padding w3-half">
            <section class="w3-card-4 w3-container w3-theme w3-margin-top" style="height: 230px">
                <img src="/images/${latinName.toLowerCase()}.jpg" alt="" class="w3-col small w3-left-align w3-margin">
                <a class="w3-xlarge" href="/plants/${latinName.toLowerCase()}">${name}</a>
                <p class="w3-small">${description}
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
    .add("edit", ({ name, latinName, description }) => {
        const newElement = !(name || latinName || description);
        return `
    <h2>${newElement ? "Создание" : "Изменение"} элемента</h2>
    <form method="POST" action="/plants/${latinName}" >
        Название: <input type="text" name="name" value="${name}" required maxlength="100"><br>
        Латинское название: <input type="text" name="latin" value="${latinName}" ${newElement ? "readonly" : ""} required maxlength="100"><br>
        Описание: <br> <textarea name="description" cols="30" rows="10" required>${description}</textarea><br>
        <input type="submit" value="Записать">
    </form>
`
    })
console.log(plantViews.views);

const catalogViews = new Views("main");
catalogViews.add("list", catalog => {
    let html = "<h2>Редактирование каталога</h2>";
    catalog.forEach(item => {
        html += `
        <span class="name">${item.Name}(${item.LatinName})</span><br>
        <p>${item.Description}</p>
        <a href="/plants/${item.LatinName}?edit" class="underline">Редактировать</a>
        <a onclick="deleteItem(${item.LatinName})" class="underline">Удалить</a>
        <hr>`
    })
    return html;
})
/**
 * @var {HTMLElement} Элемент, в который будут вставляться представления
 */
let $main;
let firstEntry = false;

document.addEventListener("DOMContentLoaded", () => {
    $main = document.querySelector("main");

    const path = location.pathname + location.search;
    router("GET", path, firstEntry);
    console.log(path);
    firstEntry = true;
});
window.onpopstate = () => {
    router("GET", history.state.uri, true);
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
    function randomCards(model, selector, number, view) {
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
    document.title = "Главная";
    if (!transitted) {
        window.history.replaceState({ uri: "/" }, document.title, "/");
    }
}
/**
 * Вставляет в root содержимое, соответвующее указанному адресу, запрашивая данные с сервера
 * @param {String} method Метод HTTP-запроса
 * @param {String} uri Запрашиваемый адрес
 * @param {Boolean} inHistory Был ли произведён переход по истории браузера
 */
async function router(method, uri, inHistory) {
    let title;
    $main.innerHTML = "";
    if (uri == "/") {
        index({}, true);
    } else if (uri.endsWith("edit")) {
        const content = await requestAPI(uri);
        const plant = new Plant(content.Name, content.LatinName, content.Description, plantViews);
        plant.insert("edit");
        title = `Редактирование ${content.Name}`
    } else if (uri == "/catalog") {
        const catalog = await requestAPI("/plants");
        catalogViews.insert("list",catalog);
        title = "Каталог";
    } else {
        const content = await requestAPI(uri, { method: method });
        console.log(content);
        title = content.Name;
        const plant = new Plant(content.Name, content.LatinName, content.Description, plantViews);
        plant.insert("plant");
    }

    if (!inHistory && uri != history.state?.uri) {
        window.history.pushState({ uri: uri }, title, uri);
    }
    document.title = title;
}

/**
 * Обработчик, запускающийся при нажатии на ссылку
 * @param {Event} event Объект события
 * @this {HTMLAnchorElement} Ссылка
 */
async function linkHandler(event) {
    event.preventDefault();
    const uri = this.pathname;
    const params = this.search;
    const method = this.dataset["action"];

    await router(method, uri + params, false)

    document.querySelectorAll("a").forEach(
        link => link.onclick = linkHandler
    )
    document.querySelectorAll("form").forEach(
        form => form.onsubmit = formHandler
    )
}
/**
 * 
 * @param {Event} event 
 * @this {HTMLFormElement}
 */
async function formHandler(event) {
    event.preventDefault();
    const resource = new URL(this.action).pathname
    type = resource.split("/")[1];
    let data = {};
    if (type == "plants") {
        data = {
            Name: this[0].value,
            LatinName: this[1].value.toLowerCase(),
            Description: this[2].value
        };
    } else throw new Error("Unknown resource type");

    const response = await requestAPI(resource, {
        method: "POST",
        data: JSON.stringify(data)
    })
    console.log(response);
}

async function requestAPI(resource = "", options = {}) {
    const response = await fetch("/api" + resource, {
        method: options.method || "GET",
        body: options.data
    })
    return await response.json();
}