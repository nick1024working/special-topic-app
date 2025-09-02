import { Injectable } from "@angular/core";

@Injectable({ providedIn:'root'})

export class TopContentApi {
    cartItemCount: (count: number) => void = () => {};
}
