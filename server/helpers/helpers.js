module.exports = function () {

    this.getKeyByValue = (object, value) => Object.keys(object).find(key => object[key] === value);

    this.closest = (arr, nbr) => arr.sort((a, b) => Math.abs(nbr - a) - Math.abs(nbr - b))[0];

    Object.filter = (obj, predicate) =>
        Object.keys(obj)
            .filter(key => predicate(obj[key]))
            .reduce((res, key) => (res[key] = obj[key], res), {});
}