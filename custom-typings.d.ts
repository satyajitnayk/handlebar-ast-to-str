declare module 'Handlebars' {
  export namespace AST {
    interface Node {
      body?: Node[];
      path?: hbs.AST.PathExpression;
      params?: Node[];
      program?: hbs.AST.Program;
      original?: string;
      value?: string | number | boolean;
    }
  }
}
