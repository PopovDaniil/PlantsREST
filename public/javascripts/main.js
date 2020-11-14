window.onload = index;
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

function edit(name,latinName,description) {
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

async function index() {
    const plants = await requestAPI("/plants");
    randomCards(plants, "#content", 6);

    document.querySelectorAll("a").forEach(
        link => link.onclick = linkHandler
    );
    document.title = "Главная";
}
/**
 * 
 * @param {Event} event 
 * @this {HTMLAnchorElement}
 */
async function linkHandler(event) {
    event.preventDefault();
    const uri = this.pathname;
    const params = this.search;
    const method = this.dataset["action"];
    const $main = document.querySelector("main");

    window.history.pushState({uri: uri + params}, "", uri + params);
    $main.innerHTML = "";

    if (uri == "/") {
        const indexHTML = `<h2>Главная</h2><div id="content"></div>`;
        $main.insertAdjacentHTML("afterbegin", indexHTML);
        index();
    } else if (params.endsWith("edit")) {
        const content = await requestAPI(uri);
        $main.innerHTML = edit(content.Name, content.LatinName, content.Description);
    } else {
        const content = await requestAPI(uri, { method: method });
        console.log(content);
        document.title = content.Name;
        $main.innerHTML = plant(content.Name, content.LatinName, content.Description);
    }
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

window.onpopstate = () => console.log(history.state);