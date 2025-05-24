import { Component, OnInit } from '@angular/core';
import { SuCoService } from '../../../services/su-co.service';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-su-co',
  templateUrl: './su-co.component.html',
  styleUrls: ['./su-co.component.css']
})
export class SuCoComponent implements OnInit {
  danhSachSuCo: any[] = [];
  thongKeSuCo: any;
  selectedTrangThai: string = 'all';
  trangThaiOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'ChuaXuLy', label: 'Chưa xử lý' },
    { value: 'DangXuLy', label: 'Đang xử lý' },
    { value: 'DaXuLy', label: 'Đã xử lý' }
  ];

  constructor(private suCoService: SuCoService) { }

  ngOnInit(): void {
    this.loadDanhSachSuCo();
    this.loadThongKeSuCo();
  }

  loadDanhSachSuCo(): void {
    if (this.selectedTrangThai === 'all') {
      this.suCoService.getAllSuCo().subscribe(
        data => this.danhSachSuCo = data,
        error => console.error('Lỗi khi tải danh sách sự cố:', error)
      );
    } else {
      this.suCoService.getSuCoByTrangThai(this.selectedTrangThai).subscribe(
        data => this.danhSachSuCo = data,
        error => console.error('Lỗi khi tải danh sách sự cố:', error)
      );
    }
  }

  loadThongKeSuCo(): void {
    this.suCoService.getThongKeSuCo().subscribe(
      data => {
        this.thongKeSuCo = data;
        this.veBieuDo();
      },
      error => console.error('Lỗi khi tải thống kê sự cố:', error)
    );
  }

  onTrangThaiChange(): void {
    this.loadDanhSachSuCo();
  }

  updateTrangThai(id: number, trangThai: string): void {
    this.suCoService.updateTrangThaiSuCo(id, trangThai).subscribe(
      () => {
        this.loadDanhSachSuCo();
        this.loadThongKeSuCo();
      },
      error => console.error('Lỗi khi cập nhật trạng thái:', error)
    );
  }

  veBieuDo(): void {
    // Vẽ biểu đồ thống kê theo phòng
    const ctxPhong = document.getElementById('bieuDoPhong') as HTMLCanvasElement;
    if (ctxPhong) {
      new Chart(ctxPhong, {
        type: 'bar',
        data: {
          labels: Object.keys(this.thongKeSuCo.thongKePhong),
          datasets: [{
            label: 'Số lượng sự cố',
            data: Object.values(this.thongKeSuCo.thongKePhong),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Vẽ biểu đồ thống kê theo trạng thái
    const ctxTrangThai = document.getElementById('bieuDoTrangThai') as HTMLCanvasElement;
    if (ctxTrangThai) {
      new Chart(ctxTrangThai, {
        type: 'pie',
        data: {
          labels: Object.keys(this.thongKeSuCo.thongKeTrangThai),
          datasets: [{
            data: Object.values(this.thongKeSuCo.thongKeTrangThai),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true
        }
      });
    }
  }
} 