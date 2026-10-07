export type Language = "vi" | "en";

export interface Translations {
  common: {
    appName: string;
    tagline: string;
    language: string;
    musicOn: string;
    musicOff: string;
    soundOn: string;
    soundOff: string;
    step: string;
    back: string;
    next: string;
    finish: string;
    copy: string;
    copied: string;
    close: string;
    edit: string;
    preview: string;
    reset: string;
  };
  landing: {
    badge: string;
    heroTitle1: string;
    heroTitle2: string;
    heroDesc: string;
    ctaStart: string;
    ctaGuide: string;
    ctaDemo: string;
    demoHint: string;
    navStudio: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    previewTitle: string;
    previewSubtitle: string;
    openSourceNote: string;
  };
  onboarding: {
    badge: string;
    title: string;
    subtitle: string;
    tabSoftware: string;
    tabContent: string;
    appWorkflowTitle: string;
    appWorkflowSubtitle: string;
    appStep1Title: string;
    appStep1Desc: string;
    appStep2Title: string;
    appStep2Desc: string;
    appStep3Title: string;
    appStep3Desc: string;
    studioTabsTitle: string;
    studioTabsSubtitle: string;
    tool1Title: string;
    tool1Desc: string;
    tool2Title: string;
    tool2Desc: string;
    tool3Title: string;
    tool3Desc: string;
    tool4Title: string;
    tool4Desc: string;
    appTipsTitle: string;
    appTipsDesc: string;
    intro: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    tipsTitle: string;
    tipsDesc: string;
    ctaReady: string;
    skip: string;
  };
  studio: {
    title: string;
    subtitle: string;
    tabTheme: string;
    tabCouple: string;
    tabQuestions: string;
    tabTicket: string;
    btnGetLink: (name: string) => string;
    recTip: string;
    addQuestion: string;
    modalTitle: string;
    modalDesc: string;
    qrHint: string;
    openTab: string;
    messagePlaceholder: string;
    slideLeft: string;
    slideRight: string;
    // Tab 1: Theme & Background
    themeTitle: string;
    themeSubtitle: string;
    modePresets: string;
    modeCustom: string;
    customPaletteTitle: string;
    resetColors: string;
    colorCanvas: string;
    colorCardBg: string;
    colorCharcoal: string;
    colorGold: string;
    colorWax: string;
    bgImageTitle: string;
    bgImageSubtitle: string;
    bgUploadBtn: string;
    bgUploading: string;
    bgUploadSuccess: string;
    bgUploadError: string;
    bgOrUrl: string;
    bgRemoveBtn: string;
    bgImageUrlLabel: string;
    bgImagePlaceholder: string;
    bgSamplesLabel: string;
    bgNone: string;
    bgPaper: string;
    bgCafe: string;
    bgCandle: string;
    bgOverlayLabel: string;
    bgOverlayHint: string;
    // Tab 2: Couple & Cover
    coupleTitle: string;
    coupleSubtitle: string;
    recipientLabel: string;
    recipientPlaceholder: string;
    senderLabel: string;
    senderPlaceholder: string;
    dateTitle: string;
    dateSubtitle: string;
    dateInputLabel: string;
    dateQuickThisSat: string;
    dateQuickThisSun: string;
    dateQuickNextSat: string;
    dateClear: string;
    datePreviewLabel: string;
    dateFallbackText: string;
    badgeLabel: string;
    badgePlaceholder: string;
    coverTitleLabel: string;
    introNoteLabel: string;
    ctaBtnLabel: string;
    footerNoteLabel: string;
    watermarkLabel: string;
    // Tab 3: Questions
    questionsTitle: string;
    questionsSubtitle: string;
    typeCourse: string;
    typePills: string;
    typeShort: string;
    typeLong: string;
    moveUp: string;
    moveDown: string;
    deleteQuestion: string;
    questionTitlePlaceholder: string;
    questionSubPlaceholder: string;
    optionsLabel: string;
    optionTitlePlaceholder: string;
    optionSubPlaceholder: string;
    addOption: string;
    textPlaceholderLabel: string;
    textPlaceholderPrompt: string;
    addQuestionHeader: string;
    btnTypeCourse: string;
    btnTypeCourseDesc?: string;
    btnTypePills: string;
    btnTypePillsDesc?: string;
    btnTypeShort: string;
    btnTypeShortDesc?: string;
    btnTypeLong: string;
    btnTypeLongDesc?: string;
    // Tab 4: Ticket
    ticketTitle: string;
    ticketSubtitle: string;
    ticketBadgeLabel: string;
    ticketTypeLabel: string;
    ticketQuoteLabel: string;
    ticketClosingLabel: string;
    ticketClosingSubLabel: string;
    ticketSendLabel: string;
    ticketDownloadLabel: string;
    btnAddToCalendar: string;
    calendarModalTitle: string;
    calendarModalSub: string;
    calendarOptionApple: string;
    calendarOptionAppleDesc: string;
    calendarOptionGoogle: string;
    calendarOptionGoogleDesc: string;
    calendarDownloadedToast: string;
    // Modal
    modalMsgLabel: string;
    modalCopyMsgBtn: string;
    modalCopyLinkBtn: string;
    // Theme names & Subtitles bilingual
    themeNames: Record<string, string>;
    themeSubtitles: Record<string, string>;
    // Non-blocking interaction toasts
    resetConfirm: string;
    resetSuccessToast: string;
    minQuestionToast: string;
  };
}

export const DICTIONARY: Record<Language, Translations> = {
  vi: {
    common: {
      appName: "Cuộc Hẹn Nhỏ",
      tagline: "Thiệp mời & Lời ngỏ hẹn hò phong cách Editorial Vintage",
      language: "Ngôn ngữ",
      musicOn: "Bật nhạc",
      musicOff: "Tắt nhạc",
      soundOn: "Bật âm thanh",
      soundOff: "Tắt âm thanh",
      step: "Bước",
      back: "Trang trước",
      next: "Tiếp tục",
      finish: "Hoàn tất & Niêm phong",
      copy: "Sao chép",
      copied: "Đã chép",
      close: "Đóng",
      edit: "Chỉnh sửa",
      preview: "Xem trước",
      reset: "Đặt lại",
    },
    landing: {
      badge: "THIỆP MỜI BUỔI HẸN ĐẦU TIÊN",
      heroTitle1: "Một Buổi Hẹn Nhỏ",
      heroTitle2: "Dành Riêng Cho Hai Người.",
      heroDesc:
        "Chuẩn bị một lời mời đi date thật tinh tế, ấm áp và có gu. Thay vì hỏi han lòng vòng 'khi nào rảnh, ăn gì cũng được', hãy cùng đối phương chọn vài chi tiết nhỏ để buổi hẹn đầu tiên diễn ra thoải mái và trọn vẹn nhất.",
      ctaStart: "Bắt đầu tạo thiệp hẹn",
      ctaGuide: "Xem cẩm nang hướng dẫn",
      ctaDemo: "Xem thiệp mẫu (Live Demo) ↗",
      demoHint: "✦ Chạm vào vé để trải nghiệm thiệp mẫu ↗",
      navStudio: "Vào Studio",
      feature1Title: "Riêng Tư & Kín Đáo Tuyệt Đối",
      feature1Desc:
        "Không cần đăng ký tài khoản, không lưu thông tin cá nhân. Bức thiệp chỉ thuộc về riêng hai bạn qua một đường link gửi kín đáo.",
      feature2Title: "Hỏi Han Chu Đáo, Không Gượng Gạo",
      feature2Desc:
        "Gợi ý chọn giờ hẹn, gu ăn uống, món cần né hoặc vài dòng tâm sự ngắn. Tự nhiên như một cuộc trò chuyện ấm cúng.",
      feature3Title: "Nhận Phản Hồi Ngay Trong Tin Nhắn",
      feature3Desc:
        "Người ấy mở thiệp, chọn xong là có thể gửi ngay kết quả và tấm vé hẹn về Zalo hoặc iMessage của bạn chỉ với 1 chạm.",
      previewTitle: "Trải nghiệm Tinh Tế & Độc Bản",
      previewSubtitle: "Chỉ mất 2 phút để chuẩn bị một lời mời ghi điểm tuyệt đối trong mắt đối phương.",
      openSourceNote: "Dành cho những buổi hẹn đầu chân thành & tinh tế · Tạo bởi sự chu đáo",
    },
    onboarding: {
      badge: "CẨM NANG TOÀN DIỆN · INVITATION ONBOARDING",
      title: "Nghệ Thuật Mời Hẹn & Hướng Dẫn Sử Dụng",
      subtitle: "Khám phá cách sử dụng công cụ Studio và nghệ thuật chuẩn bị một lời mời tinh tế, chân thành nhất",
      tabSoftware: "Cách sử dụng Studio",
      tabContent: "Cẩm nang nội dung & Điểm chạm",
      appWorkflowTitle: "Quy trình 3 bước từ tạo thiệp đến nhận phản hồi",
      appWorkflowSubtitle: "Dễ dàng tạo nên bức thiệp độc bản chỉ trong 2 phút mà không cần tài khoản",
      appStep1Title: "Bước 1: Tùy biến thiệp trong Studio",
      appStep1Desc: "Sử dụng 4 thanh tab trực quan: chọn bộ màu vintage hoặc tự phối màu, tải ảnh nền từ máy lên, điền tên hai bạn và sắp xếp các câu hỏi hẹn hò.",
      appStep2Title: "Bước 2: Trải nghiệm thử trên mô phỏng iPhone",
      appStep2Desc: "Màn hình điện thoại bên phải phản ánh chính xác từng chỉnh sửa theo thời gian thực. Bạn có thể bấm thử, lật trang và nghe hiệu ứng âm thanh như người ấy.",
      appStep3Title: "Bước 3: Lấy link gửi & Nhận phản hồi",
      appStep3Desc: "Bấm 'Lấy link', sao chép tin nhắn kèm link hoặc mã QR để gửi qua Zalo / iMessage. Khi người ấy mở thiệp và chọn xong, cuống vé xác nhận sẽ gửi thẳng về tin nhắn cho bạn!",
      studioTabsTitle: "Khám phá 4 công cụ tùy biến trong Studio",
      studioTabsSubtitle: "Mỗi tab được thiết kế chuyên biệt để bạn kiểm soát trọn vẹn từng chi tiết của thiệp",
      tool1Title: "Tab 1 — Giao diện & Ảnh nền",
      tool1Desc: "Chọn 4 bộ màu phong cách báo chí cổ điển, tự do phối màu riêng hoặc tải ảnh chụp kỷ niệm từ thiết bị của bạn lên làm nền thiệp mờ lãng mạn.",
      tool2Title: "Tab 2 — Bìa & Lời ngỏ",
      tool2Desc: "Cá nhân hóa cách xưng hô (Bạn & Mình, Em & Anh...), tiêu đề thiệp và một lời ngỏ tâm tình không áp lực để mở đầu buổi hẹn.",
      tool3Title: "Tab 3 — Bộ câu hỏi hẹn hò",
      tool3Desc: "Thêm, xóa và đổi thứ tự các câu hỏi: chọn khung giờ (hoàng hôn hay đêm), không gian mong muốn (ban công hay quán yên tĩnh), gu đồ uống và lời nhắn bí mật.",
      tool4Title: "Tab 4 — Tấm vé & Lời kết",
      tool4Desc: "Thiết kế chiếc vé Boarding Pass lưu niệm kèm con dấu sáp và lời khẳng định ga-lăng: 'Lịch trình đã xác nhận. Mọi khâu sắp xếp còn lại, để mình lo'.",
      appTipsTitle: "Mẹo hay khi thao tác trên Studio",
      appTipsDesc: "Bạn có thể dùng con lăn chuột trên thanh tab để trượt qua lại nhanh chóng. Hệ thống tự động lưu bản nháp vào trình duyệt nên bạn hoàn toàn yên tâm không sợ mất dữ liệu!",
      intro:
        "Buổi hẹn đầu tiên (First Date) luôn đi kèm sự hồi hộp và ngập ngừng. Thay vì những câu hỏi nhắn tin vội vã ('Em rảnh hôm nào? Em muốn ăn gì?'), một tấm thiệp phong cách Editorial Vintage thể hiện bạn là một người chu đáo, có gu thẩm mỹ và biết lắng nghe.",
      step1Title: "Điểm chạm 01: Lời Ngỏ Ấm Áp",
      step1Desc:
        "Trang bìa mở ra nhẹ nhàng, cá nhân hóa tên đối phương kèm một lời tựa không áp lực: 'Chỉ có trà ấm, chuyện trò và những điều bạn yêu thích'.",
      step2Title: "Điểm chạm 02: Lựa Chọn Tự Nhiên",
      step2Desc:
        "Chia các lựa chọn thành Course Menu hoặc thẻ gợi ý (khung giờ hoàng hôn hay đêm, ban công hay quán yên tĩnh). Giúp đối phương dễ dàng đưa ra quyết định mà không phải vắt óc suy nghĩ.",
      step3Title: "Điểm chạm 03: Khẩu Vị & Sở Thích",
      step3Desc:
        "Hỏi về gu đồ uống, những món cần né hoặc dị ứng. Chi tiết này ghi điểm tuyệt đối vì thể hiện sự quan tâm đến sự thoải mái và an toàn của đối phương.",
      step4Title: "Điểm chạm 04: Niêm Phong & Để Mình Lo",
      step4Desc:
        "Chiếc vé hẹn Vintage Boarding Pass kèm con dấu sáp và thông điệp: 'Lịch trình đã xác nhận. Mọi khâu sắp xếp còn lại, để mình lo'. Bạn nam gánh vác phần tổ chức để nàng chỉ việc tận hưởng.",
      tipsTitle: "Lời khuyên vàng về Bộ câu hỏi",
      tipsDesc:
        "Khuyên dùng từ 2 đến 4 câu hỏi ngắn gọn. Tránh hỏi dồn dập khiến đối phương cảm thấy như đang làm khảo sát xin việc.",
      ctaReady: "Tôi đã hiểu, vào Studio tạo thiệp ngay",
      skip: "Bỏ qua hướng dẫn",
    },
    studio: {
      title: "Invitation Studio",
      subtitle: "Tùy biến thiệp hẹn hò độc bản",
      tabTheme: "Giao diện",
      tabCouple: "Bìa & Lời ngỏ",
      tabQuestions: "Bộ câu hỏi",
      tabTicket: "Tấm vé & Kết",
      btnGetLink: (name: string) => `Lấy link gửi ${name || "người ấy"} 💌`,
      recTip: "Khuyên dùng từ 2 đến 4 câu hỏi để giữ trải nghiệm buổi hẹn đầu nhẹ nhàng nhất.",
      addQuestion: "+ Thêm câu hỏi",
      modalTitle: "Tấm vé đã sẵn sàng gửi",
      modalDesc:
        "Mọi nội dung tùy chỉnh đã được lưu gọn trong đường link. Đối phương mở link trên điện thoại là thấy ngay thiệp mời độc bản!",
      qrHint: "Quét bằng camera điện thoại để xem thử trước",
      openTab: "Mở xem thử trong tab mới",
      messagePlaceholder:
        "Mình có một thứ nhỏ này chuẩn bị cho cuối tuần, gửi bạn xem thử nhé ✨",
      slideLeft: "Cuộn sang trái",
      slideRight: "Cuộn sang phải",
      themeTitle: "Màu sắc & Ảnh nền thiệp",
      themeSubtitle: "Lựa chọn phong cách thẩm mỹ hoặc tự do phối màu theo sở thích của hai bạn",
      modePresets: "Bộ màu tuyển chọn",
      modeCustom: "✦ Tự phối màu riêng",
      customPaletteTitle: "Bảng chọn màu sắc tự do",
      resetColors: "Dùng lại màu mặc định",
      colorCanvas: "1. Nền không gian ngoài",
      colorCardBg: "2. Màu giấy thiệp",
      colorCharcoal: "3. Màu chữ & nét mực",
      colorGold: "4. Màu điểm nhấn ánh kim",
      colorWax: "5. Màu con dấu sáp",
      bgImageTitle: "Ảnh nền thiệp mời (Tùy chọn)",
      bgImageSubtitle: "Thêm một bức ảnh mờ nhẹ phía sau để thiệp thêm phần lãng mạn và có chiều sâu",
      bgUploadBtn: "Tải ảnh từ máy lên 📁",
      bgUploading: "Đang tải ảnh lên...",
      bgUploadSuccess: "Đã tải và áp dụng ảnh nền thành công! ✨",
      bgUploadError: "Không thể tải ảnh. Vui lòng thử lại với ảnh dưới 10MB.",
      bgOrUrl: "Hoặc dán đường dẫn ảnh trực tiếp:",
      bgRemoveBtn: "Xóa ảnh nền",
      bgImageUrlLabel: "Đường dẫn ảnh nền (Link URL):",
      bgImagePlaceholder: "Dán link ảnh từ Unsplash, Pinterest... (hoặc để trống)",
      bgSamplesLabel: "Gợi ý mẫu ảnh đẹp:",
      bgNone: "Không dùng ảnh",
      bgPaper: "Giấy lụa ấm",
      bgCafe: "Quán cà phê",
      bgCandle: "Ánh nến đêm",
      bgOverlayLabel: "Độ đậm của lớp phủ làm rõ chữ:",
      bgOverlayHint: "Kéo thanh trượt sang phải nếu muốn chữ trên thiệp tương phản rõ nét và dễ đọc hơn",
      coupleTitle: "Người nhận & Lời ngỏ bìa thư",
      coupleSubtitle: "Tự do xưng hô và gửi gắm những lời mở đầu chân thành nhất",
      recipientLabel: "Tên người nhận (Người ấy, Nàng, Em, Bạn...):",
      recipientPlaceholder: "Ngọc Linh, Em, Nàng, Bạn...",
      senderLabel: "Tên người gửi (Mình, Anh, Tên bạn...):",
      senderPlaceholder: "Hoàng Minh, Mình, Anh...",
      dateTitle: "Ngày hẹn dự kiến",
      dateSubtitle: "Chọn một ngày cụ thể hoặc để trống cho một buổi hẹn ngẫu hứng thảnh thơi",
      dateInputLabel: "Chọn ngày trên lịch:",
      dateQuickThisSat: "Thứ 7 tuần này",
      dateQuickThisSun: "Chủ nhật tuần này",
      dateQuickNextSat: "Thứ 7 tuần sau",
      dateClear: "Để ngỏ (Thảnh thơi)",
      datePreviewLabel: "Hiển thị trên thiệp:",
      dateFallbackText: "Một ngày cuối tuần thảnh thơi",
      badgeLabel: "Dòng chữ nhỏ trên đỉnh thiệp (để trống nếu muốn ẩn):",
      badgePlaceholder: "THIỆP MỜI BUỔI HẸN",
      coverTitleLabel: "Tiêu đề lớn bìa thư:",
      introNoteLabel: "Lời ngỏ tâm tình mở đầu:",
      ctaBtnLabel: "Chữ trên nút mở thiệp:",
      footerNoteLabel: "Dòng chữ nhỏ dưới nút mở thiệp (Hỗ trợ {{sender}} để tự điền tên bạn):",
      watermarkLabel: "Dòng chữ ký mờ dưới chân thiệp:",
      questionsTitle: "Tùy biến Bộ câu hỏi",
      questionsSubtitle: "Cùng đối phương chọn vài chi tiết nhỏ để buổi hẹn đầu tiên diễn ra thoải mái và đúng gu nhất",
      typeCourse: "Thẻ lựa chọn lớn (Chọn 1)",
      typePills: "Thẻ tag sở thích (Chọn nhiều)",
      typeShort: "Trả lời ngắn (1 dòng)",
      typeLong: "Lời nhắn gửi riêng (Nhiều dòng)",
      moveUp: "Đưa lên trên",
      moveDown: "Đưa xuống dưới",
      deleteQuestion: "Xóa câu hỏi này",
      questionTitlePlaceholder: "Tiêu đề câu hỏi (ví dụ: Khung giờ hẹn, Gu đồ uống...)",
      questionSubPlaceholder: "Mô tả gợi ý nhẹ nhàng cho đối phương...",
      optionsLabel: "Các phương án lựa chọn:",
      optionTitlePlaceholder: "Tên phương án (ví dụ: Hoàng hôn buông, Quán yên tĩnh...)",
      optionSubPlaceholder: "Ghi chú thêm (ví dụ: 17:00 – Khi nắng vừa tắt...)",
      addOption: "Thêm phương án lựa chọn",
      textPlaceholderLabel: "Gợi ý mờ khi đối phương chưa nhập chữ:",
      textPlaceholderPrompt: "Ví dụ: Một bài hát bạn đang nghiện gần đây, món bạn cần né...",
      addQuestionHeader: "Thêm câu hỏi mới theo định dạng:",
      btnTypeCourse: "Thẻ lớn",
      btnTypeCourseDesc: "Chọn 1 phương án chi tiết",
      btnTypePills: "Thẻ tag",
      btnTypePillsDesc: "Chọn nhiều gu & sở thích",
      btnTypeShort: "Trả lời ngắn",
      btnTypeShortDesc: "Nhập 1 dòng lưu ý / né đồ",
      btnTypeLong: "Lời nhắn",
      btnTypeLongDesc: "Thư tay tâm sự nhiều dòng",
      ticketTitle: "Tấm vé hẹn & Lời kết",
      ticketSubtitle: "Tùy biến tấm vé lưu niệm và lời nhắn chốt lịch hẹn ga-lăng",
      ticketBadgeLabel: "Dòng chữ trên cùng tấm vé:",
      ticketTypeLabel: "Loại vé hẹn:",
      ticketQuoteLabel: "Trích dẫn lãng mạn trên vé:",
      ticketClosingLabel: "Câu chốt lịch hẹn ga-lăng:",
      ticketClosingSubLabel: "Lời hứa chu đáo bên dưới câu chốt:",
      ticketSendLabel: "Chữ trên nút gửi phản hồi:",
      ticketDownloadLabel: "Chữ trên nút lưu ảnh vé:",
      btnAddToCalendar: "✦ Thêm vào Lịch",
      calendarModalTitle: "Thêm Buổi Hẹn Vào Lịch",
      calendarModalSub: "Lưu lại cuộc hẹn vào ứng dụng lịch để không bỏ lỡ khoảnh khắc đặc biệt này",
      calendarOptionApple: "Apple Calendar / File Lịch (.ics)",
      calendarOptionAppleDesc: "Thích hợp cho iPhone, iPad, Mac và các ứng dụng Lịch máy chủ",
      calendarOptionGoogle: "Google Calendar (Mở trên web)",
      calendarOptionGoogleDesc: "Mở trực tiếp trên Google Calendar để lưu vào tài khoản Google",
      calendarDownloadedToast: "Đã tải file lịch (.ics) về máy ✨",
      modalMsgLabel: "Lời nhắn gửi kèm link (Tùy chỉnh):",
      modalCopyMsgBtn: "Sao chép lời nhắn kèm link 💌",
      modalCopyLinkBtn: "Chỉ sao chép đường link",
      themeNames: {
        alabaster: "Alabaster Cổ Điển",
        midnight: "Midnight Ánh Kim",
        "matcha-linen": "Xô Thơm & Linen",
        "rose-cashmere": "Rose & Cashmere",
        custom: "Tự Phối Màu Riêng",
      },
      themeSubtitles: {
        alabaster: "Giấy lụa ấm & mực than đá (Mặc định)",
        midnight: "Đêm huyền bí & ánh kim sang trọng",
        "matcha-linen": "Xanh xô thơm nhẹ nhàng & đồng cổ",
        "rose-cashmere": "Màu kem phớt hồng & vang bordeaux",
        custom: "Bảng màu phối cá nhân của bạn",
      },
      resetConfirm: "Chắc chắn đặt lại?",
      resetSuccessToast: "Đã đặt lại về mẫu mặc định ✨",
      minQuestionToast: "Cần giữ lại ít nhất 1 câu hỏi cho buổi hẹn nhé! 💌",
    },
  },
  en: {
    common: {
      appName: "Cuộc Hẹn Nhỏ",
      tagline: "A Quiet Gathering for Two · Editorial Vintage Date Studio",
      language: "Language",
      musicOn: "Music ON",
      musicOff: "Music OFF",
      soundOn: "Sound ON",
      soundOff: "Sound OFF",
      step: "Step",
      back: "Previous",
      next: "Continue",
      finish: "Confirm & Seal",
      copy: "Copy",
      copied: "Copied",
      close: "Close",
      edit: "Edit",
      preview: "Preview",
      reset: "Reset",
    },
    landing: {
      badge: "BESPOKE FIRST-DATE INVITATION",
      heroTitle1: "A Quiet Gathering",
      heroTitle2: "For Just Two.",
      heroDesc:
        "Craft a thoughtful, aesthetic first-date invitation. Skip the back-and-forth 'when are you free, anything is fine' and curate a memorable evening together with ease.",
      ctaStart: "Create Your Invitation",
      ctaGuide: "Read the Curation Guide",
      ctaDemo: "Explore Live Demo ↗",
      demoHint: "✦ Tap pass to experience live invitation ↗",
      navStudio: "Enter Studio",
      feature1Title: "100% Private & Discrete",
      feature1Desc:
        "No sign-up or accounts required. No personal data is stored on external servers. Your invitation stays strictly between the two of you.",
      feature2Title: "Warm & Effortless Inquiries",
      feature2Desc:
        "Suggest meeting times, beverage tastes, dietary preferences, or a secret note. Natural and completely unpressured.",
      feature3Title: "Direct Reply to Your Chat",
      feature3Desc:
        "Your date receives the pass, makes their choices, and shares their confirmation pass straight back to your iMessage, WhatsApp, or Zalo.",
      previewTitle: "Bespoke & Unforgettable",
      previewSubtitle: "Takes less than 2 minutes to create a memorable first impression.",
      openSourceNote: "Crafted with care for sincere first dates · Zero data tracking",
    },
    onboarding: {
      badge: "COMPREHENSIVE ONBOARDING GUIDE",
      title: "The Art of Invitations & Studio Guide",
      subtitle: "Master the Studio customizer tools and the etiquette of creating a sincere, memorable invitation",
      tabSoftware: "How to Use Studio",
      tabContent: "Content & Etiquette Guide",
      appWorkflowTitle: "3-Step Workflow: From Creation to Response",
      appWorkflowSubtitle: "Craft a bespoke invitation in 2 minutes with zero sign-up required",
      appStep1Title: "Step 1: Customize in Studio",
      appStep1Desc: "Use 4 intuitive tabs: select curated vintage palettes or custom colors, upload your own background photo, personalize names, and curate thoughtful questions.",
      appStep2Title: "Step 2: Interactive Live Preview",
      appStep2Desc: "The iPhone mockup frame on the right reflects every single edit in real-time. You can click, navigate, and hear sound effects exactly like your date will.",
      appStep3Title: "Step 3: Share Link & Receive Pass",
      appStep3Desc: "Tap 'Get Link', copy the message with your link or QR code to share via chat (Zalo, iMessage, WhatsApp). When your date completes their choices, their confirmation pass is sent straight back to you!",
      studioTabsTitle: "Explore the 4 Customizer Tabs in Studio",
      studioTabsSubtitle: "Each tab is dedicated to giving you effortless control over every detail of the invitation",
      tool1Title: "Tab 1 — Themes & Background",
      tool1Desc: "Choose from 4 editorial vintage presets, freely mix your own palette, or upload a memory photo from your device as a dreamy romantic background.",
      tool2Title: "Tab 2 — Cover & Names",
      tool2Desc: "Personalize names, set the cover title, and craft an unpressured, warm opening note to set the mood.",
      tool3Title: "Tab 3 — Curated Questions",
      tool3Desc: "Add, remove, or reorder questions: preferred time slots (sunset vs night), desired ambiance (balcony vs cozy cafe), beverage tastes, and secret notes.",
      tool4Title: "Tab 4 — Ticket Pass & Closure",
      tool4Desc: "Personalize the keepsake Boarding Pass with an authentic wax seal stamp and a reassuring closure: 'Itinerary confirmed. Leave the rest to me.'",
      appTipsTitle: "Pro Tips for Studio",
      appTipsDesc: "You can use your mouse wheel horizontally over the tab bar to slide between tabs. All drafts are automatically saved to your browser so you never lose progress!",
      intro:
        "First dates carry anticipation and hesitation. Instead of generic messaging back and forth ('When are you free? Where do you want to go?'), an editorial vintage micro-invitation demonstrates intentionality, refinement, and genuine care.",
      step1Title: "Touchpoint 01: A Warm Prelude",
      step1Desc:
        "The cover sets an unpressured, tranquil atmosphere: 'Warm tea, thoughtful conversations, and things you love.'",
      step2Title: "Touchpoint 02: Curated Courses",
      step2Desc:
        "Structure timing and ambiance as courses on a tasting menu (golden hour vs city lights, balcony breeze vs quiet hideaway).",
      step3Title: "Touchpoint 03: Taste & Consideration",
      step3Desc:
        "Inquire about beverage preferences and dietary dislikes. This small gesture demonstrates empathy for their comfort.",
      step4Title: "Touchpoint 04: Sealed & Handled",
      step4Desc:
        "A vintage boarding pass with a personalized wax seal: 'Itinerary confirmed. Leave the rest to me.' Taking full ownership of logistics allows your date to simply relax.",
      tipsTitle: "Golden Question Rule",
      tipsDesc:
        "We recommend 2 to 4 concise questions. Avoid making it feel like an employment questionnaire.",
      ctaReady: "Got it, Enter the Studio Now",
      skip: "Skip to Studio",
    },
    studio: {
      title: "Invitation Studio",
      subtitle: "Craft your bespoke vintage invitation",
      tabTheme: "Theme",
      tabCouple: "Cover & Names",
      tabQuestions: "Questions",
      tabTicket: "Ticket Pass",
      btnGetLink: (name: string) => `Get Link for ${name || "Date"} 💌`,
      recTip: "We recommend 2 to 4 questions to keep the first date experience lighthearted.",
      addQuestion: "+ Add Question",
      modalTitle: "Your Invitation Pass is Ready",
      modalDesc:
        "All customizations are securely saved in the URL link. Your date can open it on their mobile phone for an instant bespoke experience!",
      qrHint: "Scan with your phone camera to test preview",
      openTab: "Preview in new tab",
      messagePlaceholder:
        "Here is a little something I prepared for our upcoming evening, take a look ✨",
      slideLeft: "Slide left",
      slideRight: "Slide right",
      themeTitle: "Invitation Colors & Background",
      themeSubtitle: "Choose a curated aesthetic or freely customize your palette and background photo",
      modePresets: "Curated Palettes",
      modeCustom: "✦ Custom Colors",
      customPaletteTitle: "Custom Color Controls",
      resetColors: "Reset to default colors",
      colorCanvas: "1. Outer Canvas Background",
      colorCardBg: "2. Invitation Card Paper",
      colorCharcoal: "3. Text & Ink Color",
      colorGold: "4. Accent Gold / Brass",
      colorWax: "5. Wax Seal Stamp",
      bgImageTitle: "Background Image (Optional)",
      bgImageSubtitle: "Add an atmospheric background photo for depth and romantic charm",
      bgUploadBtn: "Upload photo from device 📁",
      bgUploading: "Uploading photo...",
      bgUploadSuccess: "Background photo uploaded successfully! ✨",
      bgUploadError: "Could not upload photo. Please try again with an image under 10MB.",
      bgOrUrl: "Or paste an image link directly:",
      bgRemoveBtn: "Remove background",
      bgImageUrlLabel: "Image URL:",
      bgImagePlaceholder: "Paste image link from Unsplash, Pinterest... (or leave blank)",
      bgSamplesLabel: "Sample Backgrounds:",
      bgNone: "No Image",
      bgPaper: "Vintage Paper",
      bgCafe: "Cozy Cafe",
      bgCandle: "Candlelit Night",
      bgOverlayLabel: "Overlay Softness / Opacity:",
      bgOverlayHint: "Slide right to enhance contrast and ensure text is easy to read",
      coupleTitle: "Names & Opening Envelope",
      coupleSubtitle: "Personalize names and your heartfelt opening invitation note",
      recipientLabel: "Recipient's Name (Your date):",
      recipientPlaceholder: "Alexander, Sophia, My date...",
      senderLabel: "Sender's Name (You):",
      senderPlaceholder: "Your name...",
      dateTitle: "Proposed Date",
      dateSubtitle: "Select a specific date or leave blank for a spontaneous, unhurried rendezvous",
      dateInputLabel: "Select date on calendar:",
      dateQuickThisSat: "This Sat",
      dateQuickThisSun: "This Sun",
      dateQuickNextSat: "Next Sat",
      dateClear: "Flexible Weekend",
      datePreviewLabel: "Preview on invitation:",
      dateFallbackText: "A gentle upcoming weekend",
      badgeLabel: "Top small badge text (leave blank to hide):",
      badgePlaceholder: "INVITATION TO AN EVENING",
      coverTitleLabel: "Main Cover Title:",
      introNoteLabel: "Opening Note / Invitation Message:",
      ctaBtnLabel: "Open Button Text:",
      footerNoteLabel: "Small footer note under button (Use {{sender}} to auto-fill your name):",
      watermarkLabel: "Subtle bottom watermark:",
      questionsTitle: "Curate Questionnaire",
      questionsSubtitle: "Invite your date to choose a few small details for a delightful first date",
      typeCourse: "Choice Card (Single-select)",
      typePills: "Preference Tags (Multi-select)",
      typeShort: "Short Answer (Single line)",
      typeLong: "Personal Note (Multi-line)",
      moveUp: "Move up",
      moveDown: "Move down",
      deleteQuestion: "Delete question",
      questionTitlePlaceholder: "Question title (e.g. Preferred time slot, Beverage taste...)",
      questionSubPlaceholder: "Gentle prompt or description for your date...",
      optionsLabel: "Available options:",
      optionTitlePlaceholder: "Option title (e.g. Sunset golden hour, Quiet hideaway...)",
      optionSubPlaceholder: "Sub-note (e.g. 5:00 PM – When the city lights glow...)",
      addOption: "Add New Option",
      textPlaceholderLabel: "Hint text when empty (Placeholder):",
      textPlaceholderPrompt: "e.g., Any dietary preferences, a favorite song lately...",
      addQuestionHeader: "Add a new question format:",
      btnTypeCourse: "Choice Card",
      btnTypeCourseDesc: "Pick 1 curated option",
      btnTypePills: "Tags",
      btnTypePillsDesc: "Multi-select preferences",
      btnTypeShort: "Short Answer",
      btnTypeShortDesc: "1-line quick response",
      btnTypeLong: "Personal Note",
      btnTypeLongDesc: "Multi-line letter note",
      ticketTitle: "Admission Ticket & Closure",
      ticketSubtitle: "Personalize the keepsake boarding pass and your closing statement",
      ticketBadgeLabel: "Ticket Top Badge:",
      ticketTypeLabel: "Ticket Type:",
      ticketQuoteLabel: "Romantic Quote on Pass:",
      ticketClosingLabel: "Closing Statement:",
      ticketClosingSubLabel: "Reassuring Subtext:",
      ticketSendLabel: "Send Button Text:",
      ticketDownloadLabel: "Save Button Text:",
      btnAddToCalendar: "✦ Add to Calendar",
      calendarModalTitle: "Add Date to Calendar",
      calendarModalSub: "Save our quiet rendezvous to your calendar so you won't miss this special moment",
      calendarOptionApple: "Apple Calendar / Calendar File (.ics)",
      calendarOptionAppleDesc: "Compatible with iPhone, iPad, Mac, and standard calendar apps",
      calendarOptionGoogle: "Google Calendar (Open in browser)",
      calendarOptionGoogleDesc: "Opens directly in Google Calendar to add to your Google account",
      calendarDownloadedToast: "Calendar event (.ics) downloaded ✨",
      modalMsgLabel: "Accompanying Message (Optional):",
      modalCopyMsgBtn: "Copy Message & Link 💌",
      modalCopyLinkBtn: "Copy Link Only",
      themeNames: {
        alabaster: "Alabaster Classic",
        midnight: "Midnight & Gold",
        "matcha-linen": "Sage & Warm Linen",
        "rose-cashmere": "Rose & Cashmere",
        custom: "Custom Palette",
      },
      themeSubtitles: {
        alabaster: "Warm Silk Paper & Charcoal Ink (Default)",
        midnight: "Mystic Night & Regal Gold",
        "matcha-linen": "Gentle Sage Green & Vintage Brass",
        "rose-cashmere": "Blush Cream & Bordeaux Wine",
        custom: "Your bespoke personalized palette",
      },
      resetConfirm: "Confirm reset?",
      resetSuccessToast: "Reset to default template ✨",
      minQuestionToast: "Please keep at least 1 question for your invitation! 💌",
    },
  },
};
