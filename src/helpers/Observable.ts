import { AmqpMessage } from "../core/AmqpMessage";
export declare interface ISubscriptionHandlers<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  verification?: (data: any) => boolean;
}

export class Observable<T> {
  public once = true;
  protected subscribers: Array<ISubscriptionHandlers<T>> = [];
  public subscribe(handlers: ISubscriptionHandlers<T>): void {
    this.subscribers.push(handlers);
  }
  public unsubscribe(handlers: ISubscriptionHandlers<T>) {
    const subscriber = this.subscribers.indexOf(handlers);
    if (subscriber > -1) {
      this.subscribers.splice(subscriber, 1);
    }
  }

  public notifySuccess(success: T) {
    const toRemove: number[] = [];
    this.subscribers.forEach((subscriber, index: number) => {
      if (!subscriber.verification || subscriber.verification(success)) {
        if (subscriber.onSuccess) {
          subscriber.onSuccess(success);
          if (this.once) {
            toRemove.push(index);
          }
        }
      }
    });
    toRemove.forEach((i) => {
      this.subscribers.splice(i, 1);
    });
  }
  public notifyError(error: any, verification= true) {
    const toRemove: number[] = [];
    this.subscribers.forEach((subscriber, index: number) => {
      if (!subscriber.verification || !verification || subscriber.verification(error)) {
        if (subscriber.onError) {
          subscriber.onError(error);
          if (this.once) {
            toRemove.push(index);
          }
        }
      }
    });
    toRemove.forEach((i) => {
      this.subscribers.splice(i, 1);
    });
  }
}

export interface IRpcResponse<T> {
  message: AmqpMessage<T>;
  queue: string;
}
