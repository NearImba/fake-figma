/**
 * We precompile the handlebar templates during the build process,
 * however in the source code we want to reference these templates
 * by importing the hbs files directly. Of course this is not allowed
 * by Typescript, so we need to provide some declaration for these
 * types.
 * @see: build.js for more information
 */
type TemplateDelegate = import('handlebars').TemplateDelegate;
declare module '*.hbs' {
    const template: TemplateDelegate;
    export default template;
}

