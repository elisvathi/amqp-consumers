// tslint:disable-next-line:ban-types
const defaultContainer: { get<T>(someClass: { new(...args: any[]): T } | Function): T } = new (class {
  // tslint:disable-next-line:ban-types
  private instances: Array<{ type: Function, object: any }> = [];
  public get<T>(someClass: { new(...args: any[]): T }): T {
    let instance = this.instances.find((instance) => instance.type === someClass);
    if (!instance) {
      instance = { type: someClass, object: new someClass() };
      this.instances.push(instance);
    }

    return instance.object;
  }
})();
