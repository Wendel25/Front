import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductsDataTransferService } from './../../../../shared/service/products/products-data-transfer.service';
import { Router } from '@angular/router';
import { getAllProductsResponse } from 'src/app/models/interfaces/products/response/getAllProductsResponse';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProductFormComponent } from '../../components/product-form/product-form.component';

@Component({
  selector: 'app-products-home',
  templateUrl: './products-home.component.html',
  styleUrls: []
})

export class ProductsHomeComponent implements OnInit ,OnDestroy{
  private readonly destroy$: Subject<void> = new Subject();
  private ref!: DynamicDialogRef;

  public productDatas: Array<getAllProductsResponse> = []

  constructor(
    private productsService:  ProductsService,
    private ProductsDTferService: ProductsDataTransferService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
  ){}

  ngOnInit(): void {
    this.getServiceProductsData();
  }

  getServiceProductsData() {
    const productsLoaded = this.ProductsDTferService.getProductsData();

    if(productsLoaded.length > 0){
      this.productDatas = productsLoaded;
    }else this.getApiProducts();
  }

  getApiProducts() {
    this.productsService.getAllProducts()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ((response) => {
        if(response.length > 0){
          this.productDatas = response;
        }
      }),
      error: ((err) => {
        console.error(err);
        this.router.navigate(['/dashboard']);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar Produtos',
          life: 3000
        })
      })
    })
  }

  handleProductAction(event: EventAction): void{
    if(event) {
      this.ref =  this.dialogService.open(ProductFormComponent,{
        header: event?.action,
        width: '70%',
        contentStyle: { overflow: 'auto'},
        baseZIndex: 10000,
        maximizable: true,
        data: {
          event: event,
          productDatas: this.productDatas
        },
      });

      this.ref.onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.getApiProducts(),
      })
    }
  }

  handleDeleteProductAction(event: { product_id: string, product_name: string }): void{
    if(event){
      this.confirmationService.confirm({
        message: `Confirma a exclusão do produto: ${event?.product_name}`,
        header: 'Confirmação de exclusão',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: () => this.delectProduct(event?.product_id)
      })
    }
  }

  delectProduct(product_id: string) {
   if(product_id){
    this.productsService.deleteProduct(product_id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if(response){
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Produto removido com sucesso!',
            life: 3000
          });

          this.getApiProducts();
        }
      },
      error: (err) =>{
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao remover produto!',
          life: 3000
        })
      }
    })
   }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
