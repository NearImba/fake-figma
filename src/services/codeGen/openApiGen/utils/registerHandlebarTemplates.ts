import handlebars from './handlebarsInstance';
import path from 'path';
import { HttpClient } from '../HttpClient';
import { registerHandlebarHelpers } from './registerHandlebarHelpers';

import { readFile } from 'fs/promises';
import { readFileSync } from 'fs';


function registerPartial(key: string, fpath: string) {
    readFile(path.join(__dirname, fpath), {
        encoding: 'utf-8'
    }).then(content => {
        handlebars.registerPartial(key, content);
    }).catch(() => {
        console.error('info:' + path);
    });
}

function getTemplateInstance(fpath: string): Handlebars.TemplateDelegate {
    const content = readFileSync(path.join(__dirname, fpath), {
        encoding: 'utf-8'
    });
    return handlebars.compile(content);
}

export interface Templates {
    index: Handlebars.TemplateDelegate;
    client: Handlebars.TemplateDelegate;
    exports: {
        model: Handlebars.TemplateDelegate;
        schema: Handlebars.TemplateDelegate;
        service: Handlebars.TemplateDelegate;
    };
    near: {
        imports: Handlebars.TemplateDelegate;
        fetch: Handlebars.TemplateDelegate;
    };
    core: {
        settings: Handlebars.TemplateDelegate;
        apiError: Handlebars.TemplateDelegate;
        apiRequestOptions: Handlebars.TemplateDelegate;
        apiResult: Handlebars.TemplateDelegate;
        cancelablePromise: Handlebars.TemplateDelegate;
        request: Handlebars.TemplateDelegate;
        baseHttpRequest: Handlebars.TemplateDelegate;
        httpRequest: Handlebars.TemplateDelegate;
    };
}

/**
 * Read all the Handlebar templates that we need and return on wrapper object
 * so we can easily access the templates in out generator / write functions.
 */
export const registerHandlebarTemplates = (root: {
    httpClient: HttpClient;
    useOptions: boolean;
    useUnionTypes: boolean;
}): Templates => {
    registerHandlebarHelpers(root);

    // Main templates (entry points for the files we write to disk)
    const templates: Templates = {
        index: getTemplateInstance('./hbs/index.hbs'),
        client: getTemplateInstance('./hbs/client.hbs'),
        exports: {
            model: getTemplateInstance('./hbs/exportModel.hbs'),
            schema: getTemplateInstance('./hbs/exportSchema.hbs'),
            service: getTemplateInstance('./hbs/exportService.hbs'),
        },
        near: {
            imports: getTemplateInstance('./hbs/near-imports.hbs'),
            fetch: getTemplateInstance('./hbs/near-fetch.hbs')
        },
        core: {
            settings: getTemplateInstance('./hbs/OpenAPI.hbs'), // templateCoreSettings,
            apiError: getTemplateInstance('./hbs/ApiError.hbs'), // templateCoreApiError,
            apiRequestOptions: getTemplateInstance('./hbs/ApiRequestOptions.hbs'), // templateCoreApiRequestOptions,
            apiResult: getTemplateInstance('./hbs/ApiResult.hbs'), //templateCoreApiResult,
            cancelablePromise: getTemplateInstance('./hbs/CancelablePromise.hbs'), //templateCancelablePromise,
            request: getTemplateInstance('./hbs/request.hbs'), // templateCoreRequest,
            baseHttpRequest: getTemplateInstance('./hbs/BaseHttpRequest.hbs'), //templateCoreBaseHttpRequest,
            httpRequest: getTemplateInstance('./hbs/HttpRequest.hbs'), //templateCoreHttpRequest,
        },
    };

    // Partials for the generations of the models, services, etc.
    registerPartial('exportEnum', './partials/exportEnum.hbs');
    registerPartial('exportInterface', './partials/exportInterface.hbs');
    registerPartial('exportComposition', './partials/exportComposition.hbs');
    registerPartial('exportType', './partials/exportType.hbs');
    registerPartial('header', './partials/header.hbs');
    registerPartial('isNullable', './partials/isNullable.hbs');
    registerPartial('isReadOnly', './partials/isReadOnly.hbs');
    registerPartial('isRequired', './partials/isRequired.hbs');
    registerPartial('parameters', './partials/parameters.hbs');
    registerPartial('result', './partials/result.hbs');
    registerPartial('schema', './partials/schema.hbs');
    registerPartial('schemaArray', './partials/schemaArray.hbs');
    registerPartial('schemaDictionary', './partials/schemaDictionary.hbs');
    registerPartial('schemaEnum', './partials/schemaEnum.hbs');
    registerPartial('schemaGeneric', './partials/schemaGeneric.hbs');
    registerPartial('schemaInterface', './partials/schemaInterface.hbs');
    registerPartial('schemaComposition', './partials/schemaComposition.hbs');
    registerPartial('type', './partials/type.hbs');
    registerPartial('typeArray', './partials/typeArray.hbs');
    registerPartial('typeDictionary', './partials/typeDictionary.hbs');
    registerPartial('typeEnum', './partials/typeEnum.hbs');
    registerPartial('typeGeneric', './partials/typeGeneric.hbs');
    registerPartial('typeInterface', './partials/typeInterface.hbs');
    registerPartial('typeReference', './partials/typeReference.hbs');
    registerPartial('typeUnion', './partials/typeUnion.hbs');
    registerPartial('typeIntersection', './partials/typeIntersection.hbs');
    registerPartial('base', './partials/base.hbs');

    // Generic functions used in 'request' file @see src/templates/core/request.hbs for more info
    registerPartial('functions/catchErrorCodes', './functions/catchErrorCodes.hbs');
    registerPartial('functions/getFormData', './functions/getFormData.hbs');
    registerPartial('functions/getQueryString', './functions/getQueryString.hbs');
    registerPartial('functions/getUrl', './functions/getUrl.hbs');
    registerPartial('functions/isBlob', './functions/isBlob.hbs');
    registerPartial('functions/isDefined', './functions/isDefined.hbs');
    registerPartial('functions/isFormData', './functions/isFormData.hbs');
    registerPartial('functions/isString', './functions/isString.hbs');
    registerPartial('functions/isStringWithValue', './functions/isStringWithValue.hbs');
    registerPartial('functions/isSuccess', './functions/isSuccess.hbs');
    registerPartial('functions/base64', './functions/base64.hbs');
    registerPartial('functions/resolve', './functions/resolve.hbs');

    // Specific files for the fetch client implementation
    // Handlebars.registerPartial('fetch/getHeaders', fetchGetHeaders);
    // Handlebars.registerPartial('fetch/getRequestBody', fetchGetRequestBody);
    // Handlebars.registerPartial('fetch/getResponseBody', fetchGetResponseBody);
    // Handlebars.registerPartial('fetch/getResponseHeader', fetchGetResponseHeader);
    // Handlebars.registerPartial('fetch/sendRequest', fetchSendRequest);
    // Handlebars.registerPartial('fetch/request', fetchRequest);

    // Specific files for the xhr client implementation
    // Handlebars.registerPartial('xhr/getHeaders', xhrGetHeaders);
    // Handlebars.registerPartial('xhr/getRequestBody', xhrGetRequestBody);
    // Handlebars.registerPartial('xhr/getResponseBody', xhrGetResponseBody);
    // Handlebars.registerPartial('xhr/getResponseHeader', xhrGetResponseHeader);
    // Handlebars.registerPartial('xhr/sendRequest', xhrSendRequest);
    // Handlebars.registerPartial('xhr/request', xhrRequest);

    // Specific files for the node client implementation
    // Handlebars.registerPartial('node/getHeaders', nodeGetHeaders);
    // Handlebars.registerPartial('node/getRequestBody', nodeGetRequestBody);
    // Handlebars.registerPartial('node/getResponseBody', nodeGetResponseBody);
    // Handlebars.registerPartial('node/getResponseHeader', nodeGetResponseHeader);
    // Handlebars.registerPartial('node/sendRequest', nodeSendRequest);
    // Handlebars.registerPartial('node/request', nodeRequest);

    // Specific files for the axios client implementation
    // Handlebars.registerPartial('axios/getHeaders', axiosGetHeaders);
    // Handlebars.registerPartial('axios/getRequestBody', axiosGetRequestBody);
    // Handlebars.registerPartial('axios/getResponseBody', axiosGetResponseBody);
    // Handlebars.registerPartial('axios/getResponseHeader', axiosGetResponseHeader);
    // Handlebars.registerPartial('axios/sendRequest', axiosSendRequest);
    // Handlebars.registerPartial('axios/request', axiosRequest);

    // Specific files for the angular client implementation
    // Handlebars.registerPartial('angular/getHeaders', angularGetHeaders);
    // Handlebars.registerPartial('angular/getRequestBody', angularGetRequestBody);
    // Handlebars.registerPartial('angular/getResponseBody', angularGetResponseBody);
    // Handlebars.registerPartial('angular/getResponseHeader', angularGetResponseHeader);
    // Handlebars.registerPartial('angular/sendRequest', angularSendRequest);
    // Handlebars.registerPartial('angular/request', angularRequest);

    return templates;
};
