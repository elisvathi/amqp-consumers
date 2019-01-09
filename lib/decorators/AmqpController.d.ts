import { ControllerConfig } from "./Interfaces";
export declare function AmqpController<T extends {
    new (...args: any[]): {};
}>(config?: ControllerConfig): (target: T) => void;
//# sourceMappingURL=AmqpController.d.ts.map