module.exports = function () {

    this.getKeyByValue = (object, value) => Object.keys(object).find(key => object[key] === value);

    this.closest = (arr, nbr) => arr.reduce((prev, curr) => {
        return (Math.abs(curr - nbr) < Math.abs(prev - nbr) ? curr : prev);
    });

    Object.filter = (obj, predicate) =>
        Object.keys(obj)
            .filter(key => predicate(obj[key]))
            .reduce((res, key) => (res[key] = obj[key], res), {});
}