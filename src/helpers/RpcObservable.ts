import { IRpcResponse, ISubscriptionHandlers, Observable } from "./Observable";
export class RpcObservable<T> extends Observable<IRpcResponse<T>> {
  public rpcSubscribe(queue: string, correlationId: string,
                      onSuccess?: (data: IRpcResponse<T>) => void, onError?: (error: any) => void) {
    const subscription: ISubscriptionHandlers<IRpcResponse<T>> = {};
    subscription.onError = onError;
    subscription.onSuccess = onSuccess;
    subscription.verification = (data: IRpcResponse<T>) => {
      if (data.queue === queue && data.message.properties.correlationId === correlationId) {
        return true;
      }
      return false;
    };
    this.subscribe(subscription);
  }
}
