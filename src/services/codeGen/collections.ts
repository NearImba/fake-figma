import { Model } from "./openApiGen/client/interfaces/Model";
import { Operation } from "./openApiGen/client/interfaces/Operation";

const allInterfaceMapCollection: { [key: string]: Model[] } = {};

export function addInterface(items: Model[], dir: string) {
    if (allInterfaceMapCollection[dir] === undefined) {
        allInterfaceMapCollection[dir] = []
    }
    const ref = allInterfaceMapCollection[dir];
    items.forEach(itm => {
        const ind = ref.findIndex(item => itm.name === item.name);
        if (ind === -1) {
            ref.push(itm);
        }
    });
}

export function getAllInterface(dir: string) {
    return allInterfaceMapCollection[dir] ?? [];
}

export function searchInterface(searchText: string, dir: string) {
    return getAllInterface(dir).find(it => it.name === searchText);
}

export function removeAllInterface() {
    for (const prop in allInterfaceMapCollection) {
        if (allInterfaceMapCollection.hasOwnProperty(prop)) {
            delete allInterfaceMapCollection[prop];
        }
    }
}

const allApiMapCollection: { [key: string]: Operation[] } = {};

export function addApi(items: Operation[], dir: string, server?: string) {
    if (allApiMapCollection[dir] === undefined) {
        allApiMapCollection[dir] = []
    }
    const ref = allApiMapCollection[dir];
    items.forEach(itm => {
        const ind = ref.findIndex(item => itm.path === item.path);
        if (ind === -1) {
            if (server) {
                itm.basePath = server;
            }
            ref.push(itm);
        }
    });
}

export function getAllApi(dir: string) {
    return allApiMapCollection[dir] ?? [];
}

export function removeAllApi() {
    for (const prop in allApiMapCollection) {
        if (allApiMapCollection.hasOwnProperty(prop)) {
            delete allApiMapCollection[prop];
        }
    }
}

export function searchApiByUrl(searchText: string, dir: string, max: number = 8) {
    const targetData = getAllApi(dir);
    return targetData.filter(api => ((api.basePath || '') + api.path).includes(searchText)).slice(0, max);
}

