import { Channel, Connection } from "amqplib";
import { AmqpMessage } from "../core/AmqpMessage";
export declare interface ISubscriptionHandlers<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  verification?: (data: any) => boolean;
}

export class Observable<T> {
  public once = true;
  private subscribers: Array<ISubscriptionHandlers<T>> = [];
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
    this.subscribers.forEach((subscriber) => {
      if (!subscriber.verification || subscriber.verification(success)) {
        if (subscriber.onSuccess) {
          subscriber.onSuccess(success);
          if (this.once) {
            this.unsubscribe(subscriber);
          }
        }
      }
    });
  }
  public notifyError(error: any) {
    this.subscribers.forEach((subscriber) => {
      if (!subscriber.verification || subscriber.verification(error)) {
        if (subscriber.onError) {
          subscriber.onError(error);
          if (this.once) {
            this.unsubscribe(subscriber);
          }
        }
      }
    });
  }
}

export interface IRpcResponse<T> {
  message: AmqpMessage<T>;
  channel: Channel;
  connection: Connection;
  queue: string;
}
