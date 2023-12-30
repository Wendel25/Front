import { Injectable } from '@angular/core';
import { BehaviorSubject, take, map} from 'rxjs';
import { getAllProductsResponse } from 'src/app/models/interfaces/products/response/getAllProductsResponse';

@Injectable({
  providedIn: 'root'
})
export class ProductsDataTransferService {
  public productsDataEmitter$ = new BehaviorSubject<Array<getAllProductsResponse> | null >(null);
  public productsData: Array<getAllProductsResponse> = [];

  setProductsData(products: Array<getAllProductsResponse>): void{
    if(products){
      this.productsDataEmitter$.next(products);
      this.getProductsData();
    }
  }

  getProductsData(){
    this.productsDataEmitter$.pipe(
      take(1),
      map((data) => data?.filter((products) => products.amount > 0))
    )
    .subscribe({
      next: (response) =>{
        if(response) {
          this.productsData = response
        }
      }
    });
    return this.productsData;
  }
}
