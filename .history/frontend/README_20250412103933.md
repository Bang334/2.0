# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Use Case Diagram cho Sinh viên

```mermaid
flowchart TD
    subgraph subGraph0["Quản lý thông tin cá nhân"]
        UC1["Xem thông tin cá nhân"]
    end
    subgraph subGraph1["Quản lý học tập"]
        UC2["Xem lịch học của lớp"]
    end
    subgraph subGraph2["Quản lý mượn/trả phòng"]
        UC3["Yêu cầu mượn phòng"]
        UC3_1["Hủy yêu cầu quá hạn"]
        UC4["Trả phòng học"]
        UC8["Xem danh sách phòng"]
        UC9["Xem lịch sử mượn phòng"]
    end
    subgraph subGraph3["Quản lý thông báo và phản hồi"]
        UC5["Gửi phản hồi"]
        UC6["Gửi thông báo"]
        UC7["Xem thông báo nhận"]
        UC10["Báo sự cố"]
    end
    
    SV(("Sinh viên")) -- Xem thông tin cá nhân --> UC1
    SV -- Xem lịch học --> UC2
    SV -- Gửi yêu cầu mượn phòng --> UC3
    SV -- Trả phòng học --> UC4
    SV -- Gửi phản hồi --> UC5
    SV -- Gửi thông báo --> UC6
    SV -- Xem thông báo nhận --> UC7
    SV -- Xem danh sách phòng --> UC8
    SV -- Xem lịch sử mượn phòng --> UC9
    SV -- Báo sự cố --> UC10
    
    UC3 -- Đợi duyệt --> QL(("Quản lý"))
    QL -- Duyệt/Từ chối yêu cầu --> UC3
    UC3 -- Auto hủy sau thời gian chờ --> UC3_1
    UC4 -- Báo cáo tình trạng --> QL
    QL -- Kiểm tra và xác nhận --> UC4
    UC5 -- Gửi tới --> QL
    QL -- Phản hồi lại --> UC5
    UC10 -- Báo cáo --> QL
    QL -- Xử lý sự cố --> UC10
    
    %% Quyền hạn bổ sung của Quản lý
    QL -- Điều chỉnh thông tin cá nhân --> UC1
    QL -- Khóa tài khoản --> UC1_1["Khóa Sinh Viên"]
    
    %% Giới hạn
    UC3 --- UC3_C["Giới hạn: Tối đa 3 yêu cầu chờ xử lý"]
    classDef constraints fill:#f9f,stroke:#333,stroke-width:2px;
    class UC3_C constraints;
```

Biểu đồ use case này thể hiện các chức năng và tương tác giữa Sinh viên và Quản lý:

1. **Quy trình mượn phòng**:
   - Sinh viên gửi yêu cầu mượn phòng và phải đợi quản lý duyệt
   - Quản lý có thể duyệt hoặc từ chối yêu cầu
   - Yêu cầu sẽ tự động hủy nếu quá thời gian chờ
   - Sinh viên bị giới hạn tối đa 3 yêu cầu chờ xử lý

2. **Quy trình trả phòng**:
   - Sinh viên trả phòng và báo cáo tình trạng
   - Quản lý kiểm tra và xác nhận việc trả phòng

3. **Quy trình phản hồi và báo sự cố**:
   - Sinh viên gửi phản hồi/báo sự cố đến quản lý
   - Quản lý xử lý và phản hồi lại

4. **Quyền hạn bổ sung của Quản lý**:
   - Quản lý có quyền điều chỉnh thông tin cá nhân của sinh viên
   - Quản lý có quyền khóa tài khoản sinh viên
