import React, { useEffect, useState } from "react";
import "../css/ThongBaoList.css"; 
import UserService from "../services/user.service";
import { Modal, Button, Table, Card, Badge, Spinner, Row, Col } from "react-bootstrap";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaBookOpen, FaUsers, FaMapMarkerAlt, FaClock, FaChalkboardTeacher, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";

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
  const [loading, setLoading] = useState(true);
  const [showStudentList, setShowStudentList] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Variables for schedule changing feature
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showReSchedule, setShowReSchedule] = useState(false);
  const [startPeriod, setStartPeriod] = useState('');
  const [endPeriod, setEndPeriod] = useState('');
  const [studyDate, setStudyDate] = useState('');

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
        handleError(`Không thể tải lịch ${isGiangVien ? "dạy" : "học"}. Vui lòng thử lại sau.`);
        setLoading(false);
      });
  }, [currentUser, currentWeek, isGiangVien, data]);

  const fetchSchedule = () => {
    if (isGiangVien) {
      return UserService.getLichDayGiangVien(currentWeek);
    } else {
      return UserService.getLichHocLopTheoTuan(currentWeek);
    }
  };

  const handleViewStudents = async (maLop, tenLop) => {
    if (!maLop) return;
    
    try {
      setLoadingStudents(true);
      setSelectedClass({ maLop, tenLop });
      setShowStudentList(true);
      
      const response = await UserService.getDanhSachSinhVienLop(maLop);
      setStudentList(response.data);
      console.log("response.data");
      console.log(response.data);
      setLoadingStudents(false);
    } catch (error) {
      setStudentList([]);
      setLoadingStudents(false);
    }
  };

  const handleViewReSchedule = (lesson) => {
    if (!lesson) return;
    const maLop = lesson.lopHoc.maLop || "";
    const tenLop = lesson.lopHoc.tenLop || "";
    
    setSelectedClass({ maLop, tenLop });
    setSelectedLesson(lesson);
    setShowReSchedule(true);
  }

  const handleCloseModal = () => {
    setShowStudentList(false);
    setSelectedClass(null);
    setStudentList([]);
  };

  const handleCloseReScheduleModal = () => {
    setShowReSchedule(false);
    setSelectedLesson(null);
  };

  const goToPreviousWeek = () => setCurrentWeek((prev) => prev - 1);
  const goToNextWeek = () => setCurrentWeek((prev) => prev + 1);

  const periods = Array.from({ length: 14 }, (_, i) => `Tiết ${i + 1}`);
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
  const day = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  const getCurrentDayCode = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Convert từ định dạng JavaScript (0 = Chủ nhật) sang định dạng ứng dụng
    const dayMap = { 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT', 0: 'SUN' };
    return dayMap[dayOfWeek];
  };

  const currentDayCode = getCurrentDayCode();
  
  const handleError = (errorMessage) => {
    toast.error(errorMessage);
  };

  if (loading) {
    return (
      <Card className="schedule-container">
        <Card.Body className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải lịch {isGiangVien ? "dạy" : "học"}...</p>
        </Card.Body>
      </Card>
    );
  }

  // Make sure schedule is always an array
  const scheduleData = Array.isArray(schedule) ? schedule : [];
  
  // Group lessons by day for easier debugging
  const lessonsByDay = day.reduce((acc, dayOfWeek) => {
    acc[dayOfWeek] = scheduleData.filter(item => item.thuTrongTuan === dayOfWeek);
    return acc;
  }, {});

  const handleReScheduleSave = async () => {
    if (!selectedLesson) return;
  
    const requestData = {
      maTKB: selectedLesson.maTKB,
      tietBatDau: Number(startPeriod),
      tietKetThuc: Number(endPeriod),
      ngayHoc: studyDate,
    };
  
    try {
      await UserService.requestReschedule(requestData);
      toast.success("Đã thay đổi lịch dạy thành công!");
      
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
        handleError(`Không thể tải lịch ${isGiangVien ? "dạy" : "học"}. Vui lòng thử lại sau.`);
        setLoading(false);
      });

      handleCloseReScheduleModal(); // đóng modal
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Trả về nội dung lỗi từ backend (ví dụ: "Lịch dạy bị trùng với thời khóa biểu khác!")
        toast.error(error.response.data);
      }
      else if (error.response.data === "Không thể chỉnh lịch dạy về quá khứ" && error.response.status === 400) {
        // Trả về nội dung lỗi từ backend
        toast.error(error.response.data);

      } else {
        toast.error("Không thể thay đổi lịch dạy. Vui lòng thử lại.");
      }
      console.error("Lỗi gửi yêu cầu:", error);
    }
  };
  

  return (
    <Card className="schedule-container">
      <Card.Header className="schedule-header">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="schedule-title">
            <FaCalendarAlt className="me-2" />
            Thời khóa biểu - Tuần {currentWeek}
          </h2>
          <div className="schedule-nav">
            <Button 
              variant="outline-primary" 
              className="week-nav-btn me-2" 
              onClick={goToPreviousWeek}
            >
              <FaChevronLeft /> Tuần trước
            </Button>
            <Button 
              variant="outline-primary" 
              className="week-nav-btn" 
              onClick={goToNextWeek}
            >
              Tuần sau <FaChevronRight />
            </Button>
          </div>
        </div>
        <div className="week-range">
          <FaCalendarAlt className="me-2" />
          {getWeekRange(currentWeek)}
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="schedule-table-container">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="period-header">Tiết</th>
                {days.map((day, index) => (
                  <th 
                    key={day} 
                    className={`day-header ${day[index] === currentDayCode ? 'current-day' : ''}`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period, index) => (
                <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td className="period-cell">{period}</td>
                  {day.map((dayOfWeek, dayIndex) => {
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

                    const isCurrentDay = dayOfWeek === currentDayCode && currentWeek === getCurrentWeekNumber();

                    // Xác định ô thuộc cột thứ 2 (MON)
                    const isMondayCell = dayOfWeek === 'MON';

                    return (
                      <td key={dayOfWeek} 
                          rowSpan={lesson ? Math.max(1, parseInt(lesson.tietKetThuc) - parseInt(lesson.tietBatDau) + 1) : 1} 
                          style={isMiddleOfLesson ? { display: "none" } : {}} 
                          className={`${lesson ? "schedule-cell" : ""} ${isCurrentDay ? "current-day-cell" : ""} ${isMondayCell && !lesson ? "monday-empty-cell" : ""}`}>
                        {lesson && (
                          <div className="lesson-content">
                            <div className="lesson-header">
                              <Badge bg="primary" className="lesson-code">
                                <FaBookOpen className="me-1" />
                                {lesson.monHoc?.maMon}
                              </Badge>
                              {lesson.monHoc?.tenMon && 
                                <div className="lesson-name">{lesson.monHoc.tenMon}</div>
                              }
                            </div>
                            
                            <div className="lesson-details">
                              <div className="lesson-info">
                                <FaUsers className="info-icon" /> 
                                <span>Mã Lớp: {lesson.lopHoc?.maLop}</span>
                              </div>
                              
                              <div className="lesson-info">
                                <FaMapMarkerAlt className="info-icon" /> 
                                <span>Phòng: {lesson.phong?.maPhong}</span>
                              </div>
                              
                              <div className="lesson-info">
                                <FaClock className="info-icon" /> 
                                <span>Tiết: {lesson.tietBatDau}-{lesson.tietKetThuc}</span>
                              </div>
                              
                              {isGiangVien ? 
                                (lesson.lopHoc && (
                                  <>
                                    <div className="lesson-info">
                                      <FaUsers className="info-icon" /> 
                                      <span>Lớp: {lesson.lopHoc.tenLop || lesson.lopHoc.maLop}</span>
                                    </div>
                                    <Button 
                                      variant="primary" 
                                      size="sm" 
                                      className="view-students-btn mt-2"
                                      onClick={() => handleViewStudents(lesson.lopHoc.maLop, lesson.lopHoc.tenLop || lesson.lopHoc.maLop)}
                                    >
                                      <FaUsers className="me-1" /> Xem danh sách SV
                                    </Button>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      className="view-students-btn mt-2"
                                      onClick={() => handleViewReSchedule(lesson)}
                                      style={{
                                        display: new Date(lesson.ngayHoc) >= new Date() ? "inline-block" : "none",
                                      }}
                                    >
                                      <FaCalendarAlt className="me-1" /> Thay đổi lịch dạy
                                    </Button>
                                  </>
                                )) :
                                (lesson.giangVien && (
                                  <div className="lesson-info">
                                    <FaChalkboardTeacher className="info-icon" /> 
                                    <span>GV: {lesson.giangVien.nguoiDung?.hoTen || lesson.giangVien.maGV}</span>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card.Body>

      {/* Modal xem danh sách sinh viên */}
      <Modal show={showStudentList} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="student-list-header">
          <Modal.Title>
            <FaUsers className="me-2" />
            Danh sách sinh viên lớp {selectedClass?.tenLop || selectedClass?.maLop}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingStudents ? (
            <div className="text-center p-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Đang tải danh sách sinh viên...</p>
            </div>
          ) : studentList.length > 0 ? (
            <Table striped bordered hover responsive className="student-list-table">
              <thead>
                <tr>
                  <th width="60">STT</th>
                  <th width="120">Mã SV</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Giới tính</th>
                </tr>
              </thead>
              <tbody>
                {studentList.map((student, index) => (
                  <tr key={student.maSV || index}>
                    <td className="text-center">{index + 1}</td>
                    <td>{student.maSV}</td>
                    <td>{student.hoTen || 'N/A'}</td>
                    <td>{student.email || 'N/A'}</td>
                    <td>{student.gioiTinh || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted p-3">
              <p>Không có sinh viên nào trong lớp này.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal form thay đổi lịch dạy */}
      <Modal show={showReSchedule} onHide={handleCloseReScheduleModal} size="lg">
        <Modal.Header closeButton className="student-list-header">
          <Modal.Title>
            <FaUsers className="me-2" />
            Thay đổi lịch dạy lớp {selectedClass?.tenLop || selectedClass?.maLop}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <form>
          <div className="mb-3">
            <label htmlFor="startPeriod" className="form-label">Tiết bắt đầu</label>
            <input
              type="number"
              className="form-control"
              id="startPeriod"
              min="1"
              max="14"
              defaultValue={selectedLesson?.tietBatDau}
              placeholder="Nhập tiết bắt đầu"
              value={startPeriod}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 1 && value <= 14) {
                  setStartPeriod(value);
                  // Tự động đặt Tiết kết thúc bằng Tiết bắt đầu nếu chưa có giá trị
                  if (!endPeriod || endPeriod < value) {
                    setEndPeriod(value);
                  }
                } else {
                  toast.error("Tiết bắt đầu phải nằm trong khoảng từ 1 đến 14.");
                }
              }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="endPeriod" className="form-label">Tiết kết thúc</label>
            <input
              type="number"
              className="form-control"
              id="endPeriod"
              min="1"
              max="14"
              defaultValue={selectedLesson?.tietKetThuc}
              placeholder="Nhập tiết kết thúc"
              value={endPeriod}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 1 && value <= 14) {
                  if (startPeriod && value < startPeriod) {
                    toast.error("Tiết kết thúc phải lớn hơn hoặc bằng tiết bắt đầu.");
                  } else {
                    setEndPeriod(value);
                  }
                } else {
                  toast.error("Tiết kết thúc phải nằm trong khoảng từ 1 đến 14.");
                }
              }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="studyDate" className="form-label">Ngày học</label>
            <input
              type="date"
              className="form-control"
              id="studyDate"
              defaultValue={selectedLesson?.ngayHoc}
              value={studyDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setStudyDate(e.target.value)}
            />
          </div>
        </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleReScheduleSave}>
            Lưu
          </Button>
          <Button variant="secondary" onClick={handleCloseReScheduleModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}

export default ThoiKhoaBieu; 