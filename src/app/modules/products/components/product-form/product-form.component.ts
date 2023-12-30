import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CategoryService } from './../../../../services/category/category.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { GetCategoryResponse } from 'src/app/models/interfaces/category/responses/GetCategoryResponse';
import { CreateProductRequest } from './../../../../../../../Back/src/models/interfaces/product/CreateProductRequest';
import { ProductsService } from 'src/app/services/products/products.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { getAllProductsResponse } from 'src/app/models/interfaces/products/response/getAllProductsResponse';
import { ProductsDataTransferService } from 'src/app/shared/service/products/products-data-transfer.service';
import { ProductEvent } from 'src/app/models/enums/productEvent';
import { EditProductRequest } from 'src/app/models/interfaces/products/request/EditProductRequest';
import { SaleProductRequest } from 'src/app/models/interfaces/products/request/SaleProductRequest';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: [],
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();

  public categoriesDatas: Array<GetCategoryResponse> = [];
  public selectedCategory: Array<{ name: string; code: string }> = [];
  public productSelectedDatas!: getAllProductsResponse;
  public productsDatas: Array<getAllProductsResponse> = [];
  public saleProductSelected!: getAllProductsResponse;
  public renderDropdown = false
  public productAction!: {
    event: EventAction;
    productDatas: Array<getAllProductsResponse>;
  };

  public addProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: [0, Validators.required],
  });
  public editProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    amount: [0, Validators.required],
    category_id: ['', Validators.required],
  });

  public addProductAction = ProductEvent.ADD_PRODUCT_EVENT;
  public editProductAction = ProductEvent.EDIT_PRODUCT_EVENT;
  public saleProductAction = ProductEvent.SALE_PRODUCT_EVENT;

  public saleProductForm = this.formBuilder.group({
    amount: [0, Validators.required],
    product_id: ['', Validators.required],
  })

  constructor(
    private categoriesService: CategoryService,
    private productsService: ProductsService,
    private productsDtService: ProductsDataTransferService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    public ref: DynamicDialogConfig,
    private refClosed: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.productAction = this.ref.data;

    this.productAction?.event?.action === this.saleProductAction &&
      this.getProductDatas();

    this.getAllCategories();

    this.renderDropdown = true
  }

  getAllCategories(): void {
    this.categoriesService
      .getAllCategory()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.categoriesDatas = response;

            if (
              this.productAction?.event?.action === this.editProductAction &&
              this.productAction?.productDatas
            ) {
              this.getProductSelectedDatas(this.productAction?.event?.id as string);
            }
          }
        },
      });
  }

  handleSubmitAddProduct(): void {
    if (this.addProductForm?.value && this.addProductForm?.valid) {
      const requestCreateProduct: CreateProductRequest = {
        name: this.addProductForm.value.name as string,
        price: this.addProductForm.value.price as string,
        description: this.addProductForm.value.description as string,
        category_id: this.addProductForm.value.category_id as string,
        amount: Number(this.addProductForm.value.amount),
      };

      this.productsService
        .createProduct(requestCreateProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Produto criado com sucesso!',
                life: 3000,
              });

              this.refClosed.close();
            }
          },
          error: (err) => {
            console.log(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar produto!',
              life: 3000,
            });
          },
        });
    }

    this.addProductForm.reset();
  }

  handleSubmitEditProduct(): void {
    if (
      this.editProductForm.value &&
      this.editProductForm.valid &&
      this.productAction.event.id
    ) {
      const requestEditProduct: EditProductRequest = {
        name: this.editProductForm.value.name as string,
        price: this.editProductForm.value.price as string,
        description: this.editProductForm.value.description as string,
        product_id: this.productAction?.event?.id,
        amount: this.editProductForm.value.amount as number,
        category_id: this.editProductForm.value.category_id as string
      };

      this.productsService
        .editProduct(requestEditProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto editado com sucesso!',
              life: 3000,
            });

            this.refClosed.close();
          },
          error: (err) => {
            console.log(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao editar produto!',
              life: 3000,
            });
            this.editProductForm.reset();
          },
        });
    }
  }

  handleSubmitSaleProduct():  void{
    if(this.saleProductForm?.value && this.saleProductForm?.valid){
      const resquestData: SaleProductRequest = {
        amount: this.saleProductForm.value?.amount as number,
        product_id: this.saleProductForm.value?.product_id as string
      };

      this.productsService.sallesProduct(resquestData).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if(response) {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Venda efetuada com sucesso!',
              life: 3000,
            });

            this.getProductDatas();
            this.router.navigate(['/dashboard'])
          }
        },
        error: (err) => {
          console.log(err);

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao efetuar venda!',
            life: 3000,
          });
        }
      });
    }
  }

  getProductSelectedDatas(productId: string): void {
    const allProducts = this.productAction?.productDatas;

    if (allProducts.length > 0) {
      const productFiltered = allProducts.filter(
        (element) => element?.id === productId
      );

      if (productFiltered) {
        this.productSelectedDatas = productFiltered[0];

        this.editProductForm.setValue({
          name: this.productSelectedDatas?.name,
          price: this.productSelectedDatas?.price,
          amount: this.productSelectedDatas?.amount,
          description: this.productSelectedDatas?.description,
          category_id: this.productSelectedDatas?.category?.id,
        });
      }
    }
  }

  getProductDatas(): void {
    this.productsService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.productsDatas = response;
            this.productsDatas &&
              this.productsDtService.setProductsData(this.productsDatas);
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
