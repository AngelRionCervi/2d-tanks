module.exports = function () {

    this.getKeyByValue = (object, value) => {
        return Object.keys(object).find(key => object[key] === value);
    }

    Object.filter = (obj, predicate) =>
        Object.keys(obj)
            .filter(key => predicate(obj[key]))
            .reduce((res, key) => (res[key] = obj[key], res), {});
}