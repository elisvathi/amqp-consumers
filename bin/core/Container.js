// tslint:disable-next-line:ban-types
const defaultContainer = new (class {
    constructor() {
        // tslint:disable-next-line:ban-types
        this.instances = [];
    }
    get(someClass) {
        let instance = this.instances.find((instance) => instance.type === someClass);
        if (!instance) {
            instance = { type: someClass, object: new someClass() };
            this.instances.push(instance);
        }
        return instance.object;
    }
})();
//# sourceMappingURL=Container.js.map