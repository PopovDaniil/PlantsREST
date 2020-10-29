window.onload = () => {
    randomCards(model,"#randomCards",6);
}

function card(name, latinName, description) {
    return `
    <div class="w3-padding w3-half">
            <section class="w3-card-4 w3-container w3-theme w3-margin-top">
                <img src="/images/${latinName}.jpg" alt="" class="w3-col small w3-left-align w3-margin">
                <a class="w3-xlarge" href="/catalog/${latinName}">${name}</a>
                <p class="w3-small">${description}
            </section>
    </div>
    `
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
 */
function randomCards(model, selector, number) {
    const root = document.querySelector(selector);
    for (let i = 0; i < number; i++) {
        const r = randint(0, model.length - 1);
        const crd = card(model[r].name,model[r].latinName,model[r].description);
        root.insertAdjacentHTML("beforeend",crd);
    }
}