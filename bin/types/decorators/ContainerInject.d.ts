import { IContainerClass } from "../core/Interfaces";
export interface IContainerInjectionMetadata {
    type: IContainerClass<any>;
    indices: number[];
}
export declare function ContainerInject<T>(clazz: IContainerClass<T>): (target: any, propertyKey: string, propertyIndex: number) => void;
//# sourceMappingURL=ContainerInject.d.ts.map