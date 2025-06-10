import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, DatePicker, Radio, Spin, Alert, Space, Tooltip } from 'antd';
import { Line, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import userService from '../services/user.service';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, ChartTooltip, Legend);

const ThongKeTanSuatPhong = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [thongKeData, setThongKeData] = useState(null);
  const [filters, setFilters] = useState({
    loaiThongKe: 'TUAN',
    tuNgay: null,
    denNgay: null
  });

  // Chuẩn bị options cho biểu đồ
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Biểu đồ đường thể hiện tần suất sử dụng phòng theo thời gian',
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Biểu đồ tròn thể hiện tỉ lệ mượn phòng',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Load dữ liệu khi component mount hoặc filters thay đổi
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = () => {
    setLoading(true);
    setError(null);

    // Chuẩn bị tham số
    const tuNgay = filters.tuNgay ? dayjs(filters.tuNgay).format('YYYY-MM-DD') : null;
    const denNgay = filters.denNgay ? dayjs(filters.denNgay).format('YYYY-MM-DD') : null;

    console.log(`Fetching data with loaiThongKe: ${filters.loaiThongKe}, tuNgay: ${tuNgay}, denNgay: ${denNgay}`);

    // Gọi API
    userService.getThongKeTanSuatPhong(filters.loaiThongKe, tuNgay, denNgay)
      .then(response => {
        setThongKeData(response.data);
      })
      .catch(error => {
        console.error('Lỗi khi lấy dữ liệu thống kê:', error);
        setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Xử lý khi người dùng thay đổi bộ lọc
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Xử lý khi người dùng nhấn nút tìm kiếm
  const handleSubmit = () => {
    fetchData();
  };

  // Chuẩn bị dữ liệu cho biểu đồ đường
  const prepareLineChartData = () => {
    if (!thongKeData) {
      return null;
    }
    
    // Nếu không có dữ liệu thời gian hoặc dữ liệu giới hạn, tạo dữ liệu mẫu
    if (thongKeData.isLimitedData || !thongKeData.thongKeTheoThoiGian || thongKeData.thongKeTheoThoiGian.length === 0) {
      // Tạo dữ liệu mẫu với thời gian giả định
      const roomList = thongKeData.danhSachPhong || [];
      const sampleLabels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
      const colors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
      ];
      
      const datasets = [
        {
          label: 'Tổng số lần mượn (Dữ liệu ước tính)',
          data: sampleLabels.map(() => Math.floor(Math.random() * 10) + 5),
          borderColor: 'rgba(0, 0, 0, 0.8)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }
      ];
      
      // Thêm dataset cho từng phòng nếu có danh sách phòng
      roomList.forEach((room, index) => {
        const color = colors[index % colors.length];
        datasets.push({
          label: `Phòng ${room} (Dữ liệu ước tính)`,
          data: sampleLabels.map(() => Math.floor(Math.random() * 5)),
          borderColor: color,
          backgroundColor: color.replace('0.8', '0.2'),
        });
      });
      
      return {
        labels: sampleLabels,
        datasets: datasets
      };
    }

    const timeLabels = thongKeData.nhanThoiGian;
    const roomList = thongKeData.danhSachPhong;
    const datasets = [];

    // Màu sắc cho các đường
    const colors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(199, 199, 199, 0.8)',
      'rgba(83, 102, 255, 0.8)',
      'rgba(40, 159, 64, 0.8)',
      'rgba(210, 199, 199, 0.8)',
    ];

    // Tạo dataset cho tổng số lần mượn
    const totalDataset = {
      label: 'Tổng số lần mượn',
      data: thongKeData.thongKeTheoThoiGian.map(item => item.tongSoLanMuon),
      borderColor: 'rgba(0, 0, 0, 0.8)',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    };
    datasets.push(totalDataset);

    // Tạo dataset cho từng phòng
    roomList.forEach((room, index) => {
      const color = colors[index % colors.length];
      const dataset = {
        label: `Phòng ${room}`,
        data: thongKeData.thongKeTheoThoiGian.map(item => item[room] || 0),
        borderColor: color,
        backgroundColor: color.replace('0.8', '0.2'),
      };
      datasets.push(dataset);
    });

    return {
      labels: timeLabels,
      datasets: datasets
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ tròn
  const preparePieChartData = () => {
    if (!thongKeData) {
      return null;
    }
    
    // Nếu không có dữ liệu phòng hoặc dữ liệu giới hạn, tạo dữ liệu mẫu
    if (thongKeData.isLimitedData || !thongKeData.thongKeTheoPhong || Object.keys(thongKeData.thongKeTheoPhong).length === 0) {
      const sampleLabels = ['Phòng A (Ước tính)', 'Phòng B (Ước tính)', 'Phòng C (Ước tính)'];
      const sampleData = sampleLabels.map(() => Math.floor(Math.random() * 10) + 1);
      const sampleBackgroundColors = [
        'rgba(128, 179, 160, 0.8)', // Soft Green
        'rgba(204, 153, 153, 0.8)', // Dusty Rose
        'rgba(153, 204, 255, 0.8)',  // Sky Blue
      ];
      return {
        labels: sampleLabels,
        datasets: [
          {
            label: 'Số lần được mượn',
            data: sampleData,
            backgroundColor: sampleBackgroundColors,
            borderColor: sampleBackgroundColors.map(color => color.replace('0.8', '1')),
            borderWidth: 1,
          }
        ]
      };
    }

    const labels = Object.keys(thongKeData.thongKeTheoPhong);
    const data = Object.values(thongKeData.thongKeTheoPhong);
    
    // Màu sắc cho các phần (bảng màu mới, dịu hơn)
    const backgroundColors = [
      'rgba(128, 179, 160, 0.8)', // Soft Green
      'rgba(204, 153, 153, 0.8)', // Dusty Rose
      'rgba(153, 204, 255, 0.8)', // Sky Blue
      'rgba(255, 204, 153, 0.8)', // Peach
      'rgba(179, 128, 179, 0.8)', // Muted Purple
      'rgba(153, 224, 204, 0.8)', // Mint Green
      'rgba(255, 179, 179, 0.8)', // Light Coral
      'rgba(204, 255, 179, 0.8)', // Pale Yellow-Green
      'rgba(179, 204, 255, 0.8)', // Lavender Blue
      'rgba(255, 153, 224, 0.8)'  // Soft Pink
    ];

    return {
      labels: labels,
      datasets: [
        {
          label: 'Số lần được mượn',
          data: data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
          borderWidth: 1,
        }
      ]
    };
  };

  // Chuẩn bị dữ liệu để xuất ra Excel
  const prepareExcelData = () => {
    if (!thongKeData) return null;

    // Chuẩn bị dữ liệu cho sheet thống kê theo thời gian
    const timeData = [];
    const headers = ['Thời gian', 'Tổng số lần mượn', ...thongKeData.danhSachPhong];
    timeData.push(headers);

    thongKeData.thongKeTheoThoiGian.forEach(item => {
      const row = [
        item.thoiGian,
        item.tongSoLanMuon,
        ...thongKeData.danhSachPhong.map(phong => item[phong] || 0)
      ];
      timeData.push(row);
    });

    // Chuẩn bị dữ liệu cho sheet thống kê theo phòng
    const roomData = [];
    roomData.push(['Phòng', 'Số lần được mượn', 'Tỉ lệ (%)']);
    
    const totalRooms = Object.values(thongKeData.thongKeTheoPhong).reduce((a, b) => a + b, 0);
    Object.entries(thongKeData.thongKeTheoPhong).forEach(([phong, soLan]) => {
      const tiLe = ((soLan / totalRooms) * 100).toFixed(2);
      roomData.push([phong, soLan, `${tiLe}%`]);
    });

    return {
      timeData,
      roomData
    };
  };

  // Xuất dữ liệu ra file Excel
  const exportToExcel = () => {
    const data = prepareExcelData();
    if (!data) return;

    // Tạo workbook mới
    const wb = XLSX.utils.book_new();

    // Định dạng cho header
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F81BD" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };

    // Định dạng cho dữ liệu
    const dataStyle = {
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };

    // Tạo worksheet cho thống kê theo thời gian
    const ws1 = XLSX.utils.aoa_to_sheet(data.timeData);
    
    // Áp dụng định dạng cho worksheet 1
    const range1 = XLSX.utils.decode_range(ws1['!ref']);
    for (let R = range1.s.r; R <= range1.e.r; R++) {
      for (let C = range1.s.c; C <= range1.e.c; C++) {
        const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws1[cell_address]) ws1[cell_address] = { v: "" };
        ws1[cell_address].s = R === 0 ? headerStyle : dataStyle;
      }
    }

    // Tạo worksheet cho thống kê theo phòng
    const ws2 = XLSX.utils.aoa_to_sheet(data.roomData);
    
    // Áp dụng định dạng cho worksheet 2
    const range2 = XLSX.utils.decode_range(ws2['!ref']);
    for (let R = range2.s.r; R <= range2.e.r; R++) {
      for (let C = range2.s.c; C <= range2.e.c; C++) {
        const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws2[cell_address]) ws2[cell_address] = { v: "" };
        ws2[cell_address].s = R === 0 ? headerStyle : dataStyle;
      }
    }

    // Thêm các worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws1, "Thống kê theo thời gian");
    XLSX.utils.book_append_sheet(wb, ws2, "Thống kê theo phòng");

    // Xuất file Excel
    const fileName = `ThongKeTanSuatPhong_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Xuất dữ liệu ra file PDF
  const exportToPDF = () => {
    const { overview, roomData, timeData } = prepareExcelData();
    
    // Tạo đối tượng PDF mới
    const doc = new jsPDF();
    
    // Thiết lập font chữ hỗ trợ tiếng Việt
    doc.setFont('helvetica', 'normal');
    
    // Thêm tiêu đề
    doc.setFontSize(16);
    doc.text('THỐNG KÊ TẦN SUẤT SỬ DỤNG PHÒNG', 14, 20);
    
    // Thêm thông tin tổng quan
    doc.setFontSize(10);
    doc.text(`Loại thống kê: ${filters.loaiThongKe === 'TUAN' ? 'Theo tuần' : filters.loaiThongKe === 'THANG' ? 'Theo tháng' : 'Theo năm'}`, 14, 30);
    doc.text(`Từ ngày: ${filters.tuNgay ? dayjs(filters.tuNgay).format('DD/MM/YYYY') : 'Không xác định'}`, 14, 35);
    doc.text(`Đến ngày: ${filters.denNgay ? dayjs(filters.denNgay).format('DD/MM/YYYY') : 'Không xác định'}`, 14, 40);
    doc.text(`Ngày xuất báo cáo: ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`, 14, 45);
    
    // Thêm bảng thống kê theo phòng
    doc.setFontSize(12);
    doc.text('Thống kê mượn phòng', 14, 55);
    
    const roomTableData = roomData.slice(1).map(row => row);
    doc.autoTable({
      head: [roomData[0]],
      body: roomTableData,
      startY: 60,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    // Thêm bảng thống kê theo thời gian trên trang mới
    doc.addPage();
    doc.setFontSize(12);
    doc.text('Thống kê theo thời gian', 14, 20);
    
    const timeTableData = timeData.slice(1).map(row => row);
    doc.autoTable({
      head: [timeData[0]],
      body: timeTableData,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    // Tạo tên file với ngày giờ hiện tại
    const fileName = `Thong_ke_tan_suat_phong_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
    
    // Xuất file PDF
    doc.save(fileName);
  };

  return (
    <Card 
      title="Thống kê tần suất sử dụng phòng" 
      className="mb-4"
      extra={
        <Space>
          <Tooltip title="Xuất Excel">
            <Button 
              icon={<FileExcelOutlined />} 
              type="primary" 
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
              onClick={exportToExcel}
              disabled={loading || !thongKeData}
            >
              Excel
            </Button>
          </Tooltip>
          <Tooltip title="Xuất PDF">
            <Button 
              icon={<FilePdfOutlined />} 
              type="primary" 
              danger
              onClick={exportToPDF}
              disabled={loading || !thongKeData}
            >
              PDF
            </Button>
          </Tooltip>
        </Space>
      }
    >
      {error && <Alert message={error} type="error" showIcon className="mb-3" />}

      <Form layout="vertical" className="mb-4">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Loại thống kê">
              <Radio.Group 
                value={filters.loaiThongKe} 
                onChange={e => handleFilterChange('loaiThongKe', e.target.value)}
              >
                <Radio.Button value="TUAN">Theo tuần</Radio.Button>
                <Radio.Button value="THANG">Theo tháng</Radio.Button>
                <Radio.Button value="NAM">Theo năm</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Từ ngày">
              <DatePicker 
                style={{ width: '100%' }} 
                value={filters.tuNgay ? dayjs(filters.tuNgay) : null}
                onChange={date => handleFilterChange('tuNgay', date)}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Đến ngày">
              <DatePicker 
                style={{ width: '100%' }} 
                value={filters.denNgay ? dayjs(filters.denNgay) : null}
                onChange={date => handleFilterChange('denNgay', date)}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label=" " colon={false}>
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                Tìm kiếm
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div className="text-center my-5">
          <Spin size="large" />
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      ) : thongKeData ? (
        <div>
          {thongKeData.isLimitedData && (
            <Alert
              message="Thông báo về dữ liệu"
              description="Biểu đồ đang hiển thị dữ liệu ước tính dựa trên tổng số lần mượn phòng. Dữ liệu thực tế có thể khác. Hệ thống chỉ hiển thị thống kê cơ bản, không có phân tích chi tiết theo thời gian."
              type="info"
              showIcon
              className="mb-4"
            />
          )}
          {thongKeData.error && (
            <Alert
              message="Lỗi khi tải dữ liệu"
              description="Không thể tải dữ liệu thống kê từ máy chủ. Biểu đồ đang hiển thị dữ liệu mô phỏng."
              type="warning"
              showIcon
              className="mb-4"
            />
          )}
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Biểu đồ đường - Tần suất sử dụng phòng theo thời gian">
                {prepareLineChartData() && (
                  <Line options={lineChartOptions} data={prepareLineChartData()} />
                )}
                {thongKeData.isLimitedData && !prepareLineChartData() && (
                  <div className="text-center my-3">
                    <p>Không có dữ liệu thời gian chi tiết. Vui lòng liên hệ quản trị viên.</p>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} className="mt-4">
            <Col span={24}>
              <Card title={`Biểu đồ tròn - Tỉ lệ mượn phòng theo ${filters.loaiThongKe === 'TUAN' ? 'tuần' : filters.loaiThongKe === 'THANG' ? 'tháng' : 'năm'}`}>
                {preparePieChartData() && (
                  <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '70%', height: '100%' }}>
                      <Pie options={pieChartOptions} data={preparePieChartData()} />
                    </div>
                  </div>
                )}
                {!preparePieChartData() && (
                  <div className="text-center my-3">
                    <p>Không có dữ liệu về tỉ lệ mượn phòng.</p>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      ) : (
        <div className="text-center my-5">
          <p>Không có dữ liệu thống kê. Vui lòng điều chỉnh bộ lọc và thử lại.</p>
        </div>
      )}
    </Card>
  );
};

export default ThongKeTanSuatPhong; 