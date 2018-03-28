export abstract class ViewResolverBase {
    getProblemClass(): Function {
        return null;
    }
    getClasses(phaseConstructor: Function): any {
        return null;
    }
}
