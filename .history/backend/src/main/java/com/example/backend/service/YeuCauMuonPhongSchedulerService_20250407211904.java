package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.example.backend.repository.YeuCauMuonPhongRepository;
import com.example.backend.repository.ThongBaoGuiRepository;
import com.example.backend.repository.ThongBaoNhanRepository;
import com.example.backend.model.YeuCauMuonPhong;
import com.example.backend.model.ThongBaoGui;
import com.example.backend.model.ThongBaoNhan;
import com.example.backend.model.ThongBaoNhan.TrangThai;
import java.util.Date;
import java.util.List;
import java.util.Calendar;

@Service
public class YeuCauMuonPhongSchedulerService {

    @Autowired
    private YeuCauMuonPhongRepository yeuCauMuonPhongRepository;

    @Autowired
    private ThongBaoGuiRepository thongBaoGuiRepository;

    @Autowired
    private ThongBaoNhanRepository thongBaoNhanRepository;

    @Scheduled(fixedRate = 300000) // Chạy mỗi 5 phút (5 * 60 * 1000 ms)
    public void kiemTraVaCapNhatTrangThaiYeuCau() {
        // Lấy thời gian hiện tại
        Date now = new Date();
        
        // Lấy danh sách các yêu cầu đã duyệt
        List<YeuCauMuonPhong> danhSachYeuCau = yeuCauMuonPhongRepository.findByTrangThai(YeuCauMuonPhong.TrangThai.DADUYET);
        
        for (YeuCauMuonPhong yeuCau : danhSachYeuCau) {
            // Tính thời gian trễ (30 phút sau thời gian mượn)
            Calendar thoiGianTre = Calendar.getInstance();
            thoiGianTre.setTime(yeuCau.getThoiGianMuon());
            thoiGianTre.add(Calendar.MINUTE, 30);
            
            // Nếu đã quá thời gian trễ cho phép
            if (now.after(thoiGianTre.getTime())) {
                // Cập nhật trạng thái yêu cầu
                yeuCau.setTrangThai(YeuCauMuonPhong.TrangThai.KHONGDUOCDUYET);
                yeuCau.setLyDo("Yêu cầu đặt phòng đã bị hủy vì bạn đến trễ");
                yeuCauMuonPhongRepository.save(yeuCau);
                
                // Tạo thông báo
                ThongBaoGui thongBaoGui = new ThongBaoGui();
                thongBaoGui.setTieuDe("Thông báo hủy yêu cầu mượn phòng");
                thongBaoGui.setNoiDung("Yêu cầu mượn phòng " + yeuCau.getPhong().getMaPhong() + 
                    " từ " + yeuCau.getThoiGianMuon() + " đến " + yeuCau.getThoiGianTra() + 
                    " đã bị hủy do bạn đến trễ.");
                thongBaoGui.setThoiGian(now);
                thongBaoGui = thongBaoGuiRepository.save(thongBaoGui);
                
                // Gửi thông báo đến người mượn
                ThongBaoNhan thongBaoNhan = new ThongBaoNhan();
                thongBaoNhan.setThongBaoGui(thongBaoGui);
                thongBaoNhan.setNguoiNhan(yeuCau.getNguoiMuon());
                thongBaoNhan.setTrangThai(TrangThai.CHUADOC);
                thongBaoNhanRepository.save(thongBaoNhan);
            }
        }
    }
} 