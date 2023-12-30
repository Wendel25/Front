import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductEvent } from 'src/app/models/enums/productEvent';
import { DeleteProductAction } from 'src/app/models/interfaces/products/event/DeleteProductAction';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { getAllProductsResponse } from 'src/app/models/interfaces/products/response/getAllProductsResponse';

@Component({
  selector: 'app-products-table',
  templateUrl: './products-table.component.html',
  styleUrls: []
})

export class ProductsTableComponent {
  @Input() products: Array<getAllProductsResponse> = []
  @Output() productEvent = new EventEmitter<EventAction>();
  @Output() deleteProductEvent = new EventEmitter<DeleteProductAction>();

  public productsSelected!: getAllProductsResponse;
  public addProductEvent = ProductEvent.ADD_PRODUCT_EVENT;
  public editProductEvent = ProductEvent.EDIT_PRODUCT_EVENT;

  handleProductEvent(action: string, id?: string): void {
    if(action && action != ''){
      const productEventData = id && id !== '' ? {action, id} : { action};
      this.productEvent.emit(productEventData);
    }
  }

  handleDeleteProductEvent(product_id: string, product_name: string): void{
    if(product_id !== '' && product_name !== ''){
      this.deleteProductEvent.emit({
        product_id,
        product_name
      })
    }
  }

}
