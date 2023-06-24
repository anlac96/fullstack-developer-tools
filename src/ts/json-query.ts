function getQueryPathsFromExpr(expression: string): string[] {
    return expression.split(/\.\[|\]\.|\.|\[|\]/)
}

function geResult(object: object, queryPaths: string[]): object {
    let result = { ...object }
    for (let queryPath of queryPaths) {
        if (queryPath == '') continue
        if (result) {
            result = result[queryPath]
        } else {
            result = 'undefined'
            break
        }
    }
    return result;
}

export function findNodeByQuery(object: object, queryExpr: string): object {
    if (!queryExpr || queryExpr == '') {
        return undefined
    }
    const queryPaths = getQueryPathsFromExpr(queryExpr)
    return geResult(object, queryPaths);
}

