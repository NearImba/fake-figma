import path from 'path';
import { Model } from "../openApiGen/client/interfaces/Model";
import { Operation } from "../openApiGen/client/interfaces/Operation";
import { searchInterface } from "../collections";
import { registerHandlebarTemplates } from '../openApiGen/utils/registerHandlebarTemplates';
import { HttpClient } from "../openApiGen";
import { formatCode as f } from '../openApiGen/utils/formatCode';
import { formatIndentation as i } from '../openApiGen/utils/formatIndentation';
import { Indent } from "../openApiGen/Indent";
import { getSelfDefinedHbs, TemplateFileName } from "./fetchGen";
import errorTemplate from './errorTemplate';

const templates = registerHandlebarTemplates({
    httpClient: HttpClient.FETCH,
    useUnionTypes: false,
    useOptions: false,
});

function format(code: string) {
    return i(f(code), Indent.SPACE_2);
}

interface MC {
    name: string;
    code: string;
}

export function generateSeperateApiCode(operation: Operation, workspaceFolderPath = '') {
    if (workspaceFolderPath) {
        const selfd = getSelfDefinedHbs(workspaceFolderPath);
        if (selfd) {
            let resultText = '';
            try {
                resultText = format(selfd(operation)).replace(/(\n|\s)+(>|;|,)/g, '$2');
            } catch (err) {
                resultText = errorTemplate(path.join(workspaceFolderPath, TemplateFileName), JSON.stringify(err));
            }
            return resultText;
        }
    }
    return format(templates.near.fetch(operation)).replace(/(\n|\s)+(>|;|,)/g, '$2');
}

export function generateSeperateModelsCode(models: Model[], dir: string) {
    const allCodes: MC[] = [];
    const names: string[] = [];
    function generateModelCode(model: Model) {
        names.push(model.name);
        model.imports.forEach(mt => {
            const tmt = searchInterface(mt, dir);
            if (tmt && !names.includes(mt)) {
                generateModelCode(tmt);
            }
        });
        allCodes.push({
            name: model.name,
            code: format(templates.exports.model({
                ...model
            })).replace(/(\n|\s)+(>|;)/g, '$2'),
        });
    }

    models.forEach(md => {
        generateModelCode(md);
    });

    return allCodes;
}

export function generateSeperateImportsCode(operation: Operation) {
    return format(templates.near.imports(operation));
}
