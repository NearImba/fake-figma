import { getAllInterface, searchApiByUrl } from "./collections";
import { generateSeperateApiCode, generateSeperateImportsCode, generateSeperateModelsCode } from "./nearGen/gen";

const Max = 8;
export function findRelationApis(api: string, workspaceFolderPath = '') {
    const arr = searchApiByUrl(api, workspaceFolderPath, Max);
    return arr.map(tapi => {
        const models = tapi.imports;
        const ms = getAllInterface(workspaceFolderPath).filter(item => models.indexOf(item.name) > -1);
        return {
            api: tapi.path,
            models: generateSeperateModelsCode(ms, workspaceFolderPath),
            importsCode: generateSeperateImportsCode(tapi),
            fetchCode: generateSeperateApiCode(tapi, workspaceFolderPath),
        };
    });
}