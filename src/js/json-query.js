function getQueryPathsFromExpr(expression) {
    return expression.split(/\.\[|\]\.|\.|\[|\]/);
}
function geResult(object, queryPaths) {
    let result = Object.assign({}, object);
    for (let queryPath of queryPaths) {
        if (queryPath == '')
            continue;
        if (result) {
            result = result[queryPath];
        }
        else {
            result = 'undefined';
            break;
        }
    }
    return result;
}
export function findNodeByQuery(object, queryExpr) {
    if (!queryExpr || queryExpr == '') {
        return undefined;
    }
    const queryPaths = getQueryPathsFromExpr(queryExpr);
    return geResult(object, queryPaths);
}
