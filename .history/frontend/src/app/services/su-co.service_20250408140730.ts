import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuCoService {
  private apiUrl = `${environment.apiUrl}/quanly/suco`;

  constructor(private http: HttpClient) { }

  getAllSuCo(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getSuCoByTrangThai(trangThai: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/trangthai/${trangThai}`);
  }

  updateTrangThaiSuCo(id: number, trangThai: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/trangthai?trangThai=${trangThai}`, {});
  }

  getThongKeSuCo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/thongke`);
  }
} 