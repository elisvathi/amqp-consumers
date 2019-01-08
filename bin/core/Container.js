"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:ban-types
exports.defaultContainer = new (class {
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
