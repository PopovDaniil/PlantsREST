let $main;

window.onload = () => {
    // router("GET",location.href,$main,true)
    index();
};
window.onpopstate = () => {
    router("GET", history.state.uri, $main, true);
}
/**
 * 
 * @param {String} name  
 * @param {String} latinName 
 * @param {String} description 
 */
function card(name, latinName, description) {
    return `
    <div class="w3-padding w3-half">
            <section class="w3-card-4 w3-container w3-theme w3-margin-top" style="height: 230px">
                <img src="/images/${latinName.toLowerCase()}.jpg" alt="" class="w3-col small w3-left-align w3-margin">
                <a class="w3-xlarge" href="/plants/${latinName.toLowerCase()}">${name}</a>
                <p class="w3-small">${description}
            </section>
    </div>`
}
/**
     * 
     * @param {String} name 
     * @param {String} latinName 
     * @param {String} description 
*/
function plant(name, latinName, description) {
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
</div>
    `
}
/**
 * 
 * @param {String} name  
 * @param {String} latinName 
 * @param {String} description 
 */
function edit(name, latinName, description) {
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
}
/**
 * 
 * @param {Array} catalog 
 */
function list(catalog) {
    let html = "<h2>Редактирование каталога</h2>";
    catalog.forEach(item => {
        html += `
        <span class="name">${item.Name}(${item.LatinName})</span><br>
        <p>${item.Description}</p>
        <a href="/catalog/${item.LatinName}/edit" class="underline">Редактировать</a>
        <a onclick="deleteItem(${item.LatinName})" class="underline">Удалить</a>
        <hr>`
    })
    return html;
}
    /**
     * 
     * @param {Boolean} transitted Был ли совершён переход по сайту
     */
    async function index(event, transitted) {
        const plants = await requestAPI("/plants");
        randomCards(plants, "#content", 6);

        document.querySelectorAll("a").forEach(
            link => link.onclick = linkHandler
        );
        document.title = "Главная";
        $main = document.querySelector("main");
        if (!transitted) {
            window.history.replaceState({ uri: "/" }, document.title, "/");
        }
    }
    /**
     * Вставляет в root содержимое, соответвующее указанному адресу, запрашивая данные с сервера
     * @param {String} method Метод HTTP-запроса
     * @param {String} uri Запрашиваемый адрес
     * @param {HTMLElement} root Место вставки содержимого
     * @param {Boolean} inHistory Был ли произведён переход по истории браузера
     */
    async function router(method, uri, root, inHistory) {
        let title;
        root.innerHTML = "";
        if (uri == "/") {
            const indexHTML = `<h2>Главная</h2><div id="content"></div>`;
            root.insertAdjacentHTML("afterbegin", indexHTML);
            index({}, true);
        } else if (uri.endsWith("edit")) {
            const content = await requestAPI(uri);
            root.innerHTML = edit(content.Name, content.LatinName, content.Description);
            title = `Редактирование ${content.Name}`
        } else if (uri == "/catalog") {
            const plants = await requestAPI("/plants");
            root.innerHTML = list(plants);
            title = "Каталог";
        } else {
            const content = await requestAPI(uri, { method: method });
            console.log(content);
            title = content.Name;
            root.innerHTML = plant(content.Name, content.LatinName, content.Description);
        }

        if (!inHistory && uri != history.state.uri) {
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

        await router(method, uri + params, $main, false)

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

    function randint(min, max) {
        const r = Math.random();
        const l = r * (max - min) + min;
        return Math.round(l);
    };
    /**
     * 
     * @param {Array} model 
     * @param {String} selector 
     * @param {Number} number 
     * @param {String} classes
     */
    function randomCards(model, selector, number, classes = "") {
        const root = document.querySelector(selector);
        if (!root) throw new Error("Root element doesn't exist");
        root.className = classes;
        for (let i = 0; i < number; i++) {
            const r = randint(0, model.length - 1);
            const crd = card(model[r].Name, model[r].LatinName, model[r].Description);
            root.insertAdjacentHTML("beforeend", crd);
        }
    }
    async function requestAPI(resource = "", options = {}) {
        const response = await fetch("/api" + resource, {
            method: options.method || "GET",
            body: options.data
        })
        return await response.json();
    }