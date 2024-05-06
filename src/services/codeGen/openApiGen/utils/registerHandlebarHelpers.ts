import camelCase from 'camelcase';
import handlebars from './handlebarsInstance';
import { EOL } from 'os';

import type { Enum } from '../client/interfaces/Enum';
import type { Model } from '../client/interfaces/Model';
import type { HttpClient } from '../HttpClient';
import { unique } from './unique';

export const registerHandlebarHelpers = (root: {
    httpClient: HttpClient;
    useOptions: boolean;
    useUnionTypes: boolean;
}): void => {
    [handlebars].forEach(ctx => {
        ctx.registerHelper('ifdef', function (this: any, ...args): string {
            const options = args.pop();
            if (!args.every(value => !value)) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        ctx.registerHelper(
            'equals',
            function (this: any, a: string, b: string, options: Handlebars.HelperOptions): string {
                return a === b ? options.fn(this) : options.inverse(this);
            }
        );

        ctx.registerHelper(
            'notEquals',
            function (this: any, a: string, b: string, options: Handlebars.HelperOptions): string {
                return a !== b ? options.fn(this) : options.inverse(this);
            }
        );

        ctx.registerHelper(
            'containsSpaces',
            function (this: any, value: string, options: Handlebars.HelperOptions): string {
                return /\s+/.test(value) ? options.fn(this) : options.inverse(this);
            }
        );

        ctx.registerHelper(
            'union',
            function (this: any, properties: Model[], parent: string | undefined, options: Handlebars.HelperOptions) {
                const type = handlebars.partials['type'];
                const types = properties.map(property => type({ ...root, ...property, parent }));
                const uniqueTypes = types.filter(unique);
                let uniqueTypesString = uniqueTypes.join(' | ');
                if (uniqueTypes.length > 1) {
                    uniqueTypesString = `(${uniqueTypesString})`;
                }
                return options.fn(uniqueTypesString);
            }
        );

        ctx.registerHelper(
            'intersection',
            function (this: any, properties: Model[], parent: string | undefined, options: Handlebars.HelperOptions) {
                const type = handlebars.partials['type'];
                const types = properties.map(property => type({ ...root, ...property, parent }));
                const uniqueTypes = types.filter(unique);
                let uniqueTypesString = uniqueTypes.join(' & ');
                if (uniqueTypes.length > 1) {
                    uniqueTypesString = `(${uniqueTypesString})`;
                }
                return options.fn(uniqueTypesString);
            }
        );

        ctx.registerHelper(
            'enumerator',
            function (
                this: any,
                enumerators: Enum[],
                parent: string | undefined,
                name: string | undefined,
                options: Handlebars.HelperOptions
            ) {
                if (!root.useUnionTypes && parent && name) {
                    return `${parent}.${name}`;
                }
                return options.fn(
                    enumerators
                        .map(enumerator => enumerator.value)
                        .filter(unique)
                        .join(' | ')
                );
            }
        );

        ctx.registerHelper('escapeComment', function (value: string): string {
            return value
                .replace(/\*\//g, '*')
                .replace(/\/\*/g, '*')
                .replace(/\r?\n(.*)/g, (_, w) => `${EOL} * ${w.trim()}`);
        });

        ctx.registerHelper('escapeDescription', function (value: string): string {
            return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
        });

        ctx.registerHelper('camelCase', function (value: string): string {
            return camelCase(value);
        });

        ctx.registerHelper('json', function (context): string {
            return JSON.stringify(context);
        });
    });
};
