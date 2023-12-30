import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { GetCategoryResponse } from 'src/app/models/interfaces/category/responses/GetCategoryResponse';

@Injectable({
  providedIn: 'root'
})

export class CategoryService {
  private API_URL = environment.API_URL;
  private JWT_TOKEN = this.cookie.get('USER_INFO');
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.JWT_TOKEN}`,
    }),
  };

  constructor(
    private http: HttpClient,
    private cookie: CookieService
  ) {}

  getAllCategory(): Observable<Array<GetCategoryResponse>>{
    return this.http.get<Array<GetCategoryResponse>>(
      `${this.API_URL}/categories`,
      this.httpOptions
    );
  }

  createNewCategory(resquestData: {name: string}): Observable<Array<GetCategoryResponse>>{
    return this.http.post<Array<GetCategoryResponse>>(
      `${this.API_URL}/category`,
      resquestData,
      this.httpOptions
    );
  }

  deleteAllCategory(requestDatas: { category_id: string }): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/category/delete`, {
      ...this.httpOptions,
      params: {
        category_id: requestDatas?.category_id,
      },
    });
  }
}
