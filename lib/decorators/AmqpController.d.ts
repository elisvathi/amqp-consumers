import { IControllerConfig } from "./Interfaces";
export declare function AmqpController<T extends {
    new (...args: any[]): {};
}>(config?: IControllerConfig): (target: T) => void;
//# sourceMappingURL=AmqpController.d.ts.map