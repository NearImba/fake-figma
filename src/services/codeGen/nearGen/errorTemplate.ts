export default (errorPath: string, errorInfo: string) => `/** 
  ${errorPath}
  模版编译错误
  ${errorInfo}
*/`;