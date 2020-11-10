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
    </div>
    `
    }

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
    <a href="edit">Редактировать</a>
</div>
    `
}

async function index() {
    const plants = await requestAPI("/plants");
    randomCards(plants, "#content", 6);

    document.querySelectorAll("a").forEach(
        link => link.onclick = linkHandler
    )

}

async function linkHandler(event) {
    event.preventDefault();
    const uri = this.pathname;
    if (uri == "/") {
        const indexHTML = `<h2>Главная</h2><div id="content"></div>`;
        const $main = document.querySelector("main");
        $main.innerHTML = "";
        $main.insertAdjacentHTML("afterbegin", indexHTML);
        index();
    } else {
        const content = await requestAPI(uri);
        const main = document.querySelector("main");
        main.innerHTML = plant(content.Name, content.LatinName, content.Description);
    }
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
    })
    return await response.json();
}