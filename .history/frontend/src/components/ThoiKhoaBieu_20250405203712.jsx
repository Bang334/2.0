import React, { useEffect, useState } from "react";
import "../css/ThongBaoList.css"; 
import UserService from "../services/user.service";
import { Modal, Button, Table } from "react-bootstrap";

const getCurrentWeekNumber = () => {
  const today = new Date();
  const oneJan = new Date(today.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((today - oneJan) / 86400000) + 1;
  return Math.ceil(dayOfYear / 7);
};

const getWeekRange = (weekNumber) => {
  const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);
  const daysOffset = (weekNumber - 1) * 7 - 2;
  const startDate = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset));
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  // Format ngày (dd/MM/yyyy)
  const formatDate = (date) => 
    `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

function ThoiKhoaBieu({ data, currentUser, isGiangVien }) {
  const [schedule, setSchedule] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekNumber());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStudentList, setShowStudentList] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    // If data is provided directly, use it
    if (data && Array.isArray(data)) {
      if (data.length > 0) {
        // Chuẩn hóa dữ liệu nếu cần
        const normalizedData = data.map(item => ({
          ...item,
          tietBatDau: parseInt(item.tietBatDau),
          tietKetThuc: parseInt(item.tietKetThuc),
          tuan: parseInt(item.tuan)
        }));
        
        setSchedule(normalizedData);
      } else {
        setSchedule(data);
      }
      return;
    }

    // Otherwise fetch the data based on user role
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);

    const fetchSchedule = () => {
      if (isGiangVien) {
        return UserService.getLichDayGiangVien(currentWeek);
      } else {
        return UserService.getLichHocLopTheoTuan(currentWeek);
      }
    };
    
    fetchSchedule()
      .then((response) => {
        if (response.data && response.data.length > 0) {
          // Chuẩn hóa dữ liệu
          const normalizedData = response.data.map(item => ({
            ...item,
            tietBatDau: parseInt(item.tietBatDau),
            tietKetThuc: parseInt(item.tietKetThuc),
            tuan: parseInt(item.tuan)
          }));
          
          setSchedule(normalizedData);
        } else {
          setSchedule(response.data || []);
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(`Không thể tải lịch ${isGiangVien ? "dạy" : "học"}. Vui lòng thử lại sau.`);
        setLoading(false);
      });
  }, [currentUser, currentWeek, isGiangVien, data]);

  const handleViewStudents = async (maLop, tenLop) => {
    if (!maLop) return;
    
    try {
      setLoadingStudents(true);
      setSelectedClass({ maLop, tenLop });
      setShowStudentList(true);
      
      const response = await UserService.getDanhSachSinhVienLop(maLop);
      setStudentList(response.data);
      setLoadingStudents(false);
    } catch (error) {
      setStudentList([]);
      setLoadingStudents(false);
    }
  };

  const handleCloseModal = () => {
    setShowStudentList(false);
    setSelectedClass(null);
    setStudentList([]);
  };

  const goToPreviousWeek = () => setCurrentWeek((prev) => prev - 1);
  const goToNextWeek = () => setCurrentWeek((prev) => prev + 1);

  const periods = Array.from({ length: 14 }, (_, i) => `Tiết ${i + 1}`);
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
  const day = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  if (loading) {
    return (
      <div className="table-container">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải lịch {isGiangVien ? "dạy" : "học"}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  // Make sure schedule is always an array
  const scheduleData = Array.isArray(schedule) ? schedule : [];
  
  // Group lessons by day for easier debugging
  const lessonsByDay = day.reduce((acc, dayOfWeek) => {
    acc[dayOfWeek] = scheduleData.filter(item => item.thuTrongTuan === dayOfWeek);
    return acc;
  }, {});

  return (
    <div className="table-container">
      <div className="schedule-header">
        <h2>Thời khóa biểu - Tuần {currentWeek} ({getWeekRange(currentWeek)})</h2>
        <div>
          <button onClick={goToPreviousWeek}>⬅ Tuần trước</button>
          <button onClick={goToNextWeek}>Tuần sau ➡</button>
        </div>
      </div>

      <table className="schedule-table">
        <thead>
          <tr>
            <th className="headtable">Tiết</th>
            {days.map((day) => (
              <th key={day} className="headtable">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period, index) => (
            <tr key={index}>
              <td>{period}</td>
              {day.map((dayOfWeek) => {
                // Lấy danh sách các bài học trong ngày này 
                const lessonsForThisDay = scheduleData.filter(item => item.thuTrongTuan === dayOfWeek);
                
                // Tìm bài học cho ô hiện tại
                const lesson = scheduleData.find((item) => {
                  // Đảm bảo so sánh số với số
                  const itemTietBatDau = parseInt(item.tietBatDau);
                  const currentTiet = index + 1;
                  
                  // So sánh ngày trong tuần và tiết bắt đầu
                  return item.thuTrongTuan === dayOfWeek && 
                         itemTietBatDau === currentTiet;
                });
                
                const isMiddleOfLesson = scheduleData.some((item) => {
                  // Đảm bảo so sánh số với số
                  const itemTietBatDau = parseInt(item.tietBatDau);
                  const itemTietKetThuc = parseInt(item.tietKetThuc);
                  const currentTiet = index + 1;
                  
                  return item.thuTrongTuan === dayOfWeek && 
                         itemTietBatDau < currentTiet && 
                         itemTietKetThuc >= currentTiet;
                });

                return (
                  <td key={dayOfWeek} 
                      rowSpan={lesson ? Math.max(1, parseInt(lesson.tietKetThuc) - parseInt(lesson.tietBatDau) + 1) : 1} 
                      style={isMiddleOfLesson ? { display: "none" } : {}} 
                      className={lesson ? "schedule-cell" : ""}>
                    {lesson && (
                      <div>
                        <b>Mã môn: {lesson.monHoc?.maMon}</b> <br />
                        {lesson.monHoc?.tenMon && <span>Môn: {lesson.monHoc.tenMon}<br /></span>}
                        <span>Lớp: {lesson.lopHoc?.maLop}<br /></span>
                        <span>Phòng: {lesson.phong?.maPhong}<br /></span>
                        <span>Tiết: {lesson.tietBatDau}-{lesson.tietKetThuc}<br /></span>
                        {isGiangVien ? 
                          (lesson.lopHoc && (
                            <>
                              <span>Lớp: {lesson.lopHoc.tenLop || lesson.lopHoc.maLop}<br /></span>
                              <button 
                                className="btn btn-sm btn-primary mt-2"
                                onClick={() => handleViewStudents(lesson.lopHoc.maLop, lesson.lopHoc.tenLop || lesson.lopHoc.maLop)}
                              >
                                Xem danh sách SV
                              </button>
                            </>
                          )) :
                          (lesson.giangVien && <span>GV: {lesson.giangVien.nguoiDung?.hoTen || lesson.giangVien.maGV}</span>)
                        }
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal xem danh sách sinh viên */}
      <Modal show={showStudentList} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Danh sách sinh viên lớp {selectedClass?.tenLop || selectedClass?.maLop}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingStudents ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status" />
              <p>Đang tải danh sách sinh viên...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>MSSV</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Liên hệ</th>
                  <th>Giới tính</th>
                </tr>
              </thead>
              <tbody>
                {studentList.length > 0 ? (
                  studentList.map((sinhVien) => (
                    <tr key={sinhVien.maSV}>
                      <td>{sinhVien.maSV}</td>
                      <td>{sinhVien.hoTen}</td>
                      <td>{sinhVien.email}</td>
                      <td>{sinhVien.lienHe}</td>
                      <td>{sinhVien.gioiTinh}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">Không có sinh viên trong lớp này</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ThoiKhoaBieu; 