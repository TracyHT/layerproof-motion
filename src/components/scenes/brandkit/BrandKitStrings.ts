// src/components/scenes/brandkit/BrandKitStrings.ts
// Language strings for the Brand Kit composition

export interface BrandKitStrings {
  // Hook
  hookLine1: string;
  hookLine1b?: string;  // optional second part of line 1 (split for portrait line breaks)
  hookLine2a: string;
  hookLine2b: string;
  hookBadge_colors: string;
  hookBadge_logos: string;
  hookBadge_typography: string;
  hookBadge_imageAssets: string;
  hookBadge_brandVoice: string;

  // Secret
  secretTitle: string;
  secretSubtitleBrand: string;
  secretSubtitleTagline: string;
  secretPasteUrl: string;
  secretOrDropPdf: string;
  secretPanelHeadline: string;
  secretPanelSubheadline: string;
  secretPanelDesc: string;
  secretImportBtn: string;
  secretUploadBtn: string;
  secretUrlPlaceholder: string;

  secretCheck1: string;
  secretCheck2: string;
  secretCheck3: string;
  secretCheck4: string;
  secretCheck5: string;
  secretCheck6: string;

  secretSection1: string;
  secretSection2: string;
  secretSection3: string;
  secretSection4: string;
  secretSection5: string;
  secretSection6: string;

  secretColorLabel_pink: string;
  secretColorLabel_yellow: string;
  secretColorLabel_dark: string;
  secretColorLabel_white: string;
  secretColorLabel_neutral: string;

  secretTypoRole_heading: string;
  secretTypoRole_body: string;
  secretTypoWeights_heading: string;
  secretTypoWeights_body: string;

  secretVoice_toneLabel: string;
  secretVoice_toneBody: string;
  secretVoice_audienceLabel: string;
  secretVoice_audienceBody: string;
  secretVoice_personalityLabel: string;
  secretVoice_trait1: string;
  secretVoice_trait2: string;
  secretVoice_trait3: string;

  secretThemeName: string;
  secretThemeDesc: string;

  // Suite
  suiteHeadline1: string;
  suiteHeadlineAccent: string;
  suiteCard1Title: string;
  suiteCard1Desc: string;
  suiteCard2Title: string;
  suiteCard2Desc: string;

  // Execution
  execPromptText: string;
  execPillLabel: string;
  execHeadlinePrefix: string;
  execHeadlineAccent: string;
  execHeadlineSuffix: string;
  execSubtitle: string;
  execChooseTheme: string;
  execViewMore: string;
  execThemeLibrary: string;
  execEditorTitle: string;
  execBriefText: string;
  execAgentIntro: string;
  execAgentBullet1: string;
  execAgentBullet2: string;
  execAgentBullet3: string;

  // Output
  outputColLabel_social: string;
  outputColLabel_presentation: string;
  outputHeadlineAccent: string;
  outputHeadlineBody: string;
  outputCaption: string[];
  outputLikes: string;
  outputComments: string;
  outputCommentsAgo: string;
  outputAddComment: string;

  // CTA
  ctaBrand: string;
  ctaAccent: string;
}

export const en: BrandKitStrings = {
  // Hook
  hookLine1: "Visual Assets",
  hookLine1b: "That Match",
  hookLine2a: "Your",
  hookLine2b: "Brand Identity",
  hookBadge_colors: "Colors",
  hookBadge_logos: "Logos",
  hookBadge_typography: "Typography",
  hookBadge_imageAssets: "Image assets",
  hookBadge_brandVoice: "Brand voice",

  // Secret
  secretTitle: "The secret?",
  secretSubtitleBrand: "Brand Kit",
  secretSubtitleTagline: "A Brand DNA Layer",
  secretPasteUrl: "Paste a URL",
  secretOrDropPdf: "or Drop a PDF",
  secretPanelHeadline: "Create your Brand Kit",
  secretPanelSubheadline: "in seconds",
  secretPanelDesc: "Paste your brand guideline URL or upload a PDF",
  secretImportBtn: "Import",
  secretUploadBtn: "Upload Guideline PDF",
  secretUrlPlaceholder: "https://your-brand-guidelines.com",

  secretCheck1: "Detecting your logo",
  secretCheck2: "Locking in your colours",
  secretCheck3: "Pairing your fonts",
  secretCheck4: "Setting your brand tone",
  secretCheck5: "Sourcing your image assets",
  secretCheck6: "Assembling your brand theme",

  secretSection1: "Logo",
  secretSection2: "Brand Colors",
  secretSection3: "Typography",
  secretSection4: "Brand Voice",
  secretSection5: "Image Assets",
  secretSection6: "Brand Theme",

  secretColorLabel_pink: "Pink",
  secretColorLabel_yellow: "Yellow",
  secretColorLabel_dark: "Dark",
  secretColorLabel_white: "White",
  secretColorLabel_neutral: "Neutral",

  secretTypoRole_heading: "Heading",
  secretTypoRole_body: "Body",
  secretTypoWeights_heading: "Bold · Display",
  secretTypoWeights_body: "Regular · Light",

  secretVoice_toneLabel: "Tone",
  secretVoice_toneBody: '"Confident, minimal, innovative"',
  secretVoice_audienceLabel: "Target Audience",
  secretVoice_audienceBody: "Marketers & content teams",
  secretVoice_personalityLabel: "Personality",
  secretVoice_trait1: "Bold",
  secretVoice_trait2: "Witty",
  secretVoice_trait3: "Precise",

  secretThemeName: "LayerProof Brand Theme",
  secretThemeDesc: "Bold · Vibrant · Dark Mode",

  // Suite
  suiteHeadline1: "Unlock the",
  suiteHeadlineAccent: "Creative Suite",
  suiteCard1Title: "Social Post",
  suiteCard1Desc: "Create single posts and carousels.",
  suiteCard2Title: "Presentation",
  suiteCard2Desc: "Build slide decks from templates.",

  // Execution
  execPromptText: "Launch LayerProof Brand Kit feature",
  execPillLabel: "Social Post",
  execHeadlinePrefix: "WHAT ",
  execHeadlineAccent: "POST",
  execHeadlineSuffix: " WILL YOUR AUDIENCE LOVE?",
  execSubtitle:
    "Tell us what to say — we'll craft posts that stop the scroll and build your brand.",
  execChooseTheme: "Choose a theme",
  execViewMore: "View more",
  execThemeLibrary: "Theme Library",
  execEditorTitle: "Social Campaign – Present intellectual property",
  execBriefText:
    "A clean social campaign poster about safeguarding intellectual property on Apple platforms, featuring a lock icon, bold headline, and CTA button on a warm off-white background. Minimal, editorial design.",
  execAgentIntro: "Here's what I created based on your brief:",
  execAgentBullet1:
    '3-page social campaign on "Safeguarding Your Innovation on Apple Platforms"',
  execAgentBullet2:
    'Each page features a headline, supporting copy, a visual lock icon, and a clear CTA — "Explore IP Best Practices"',
  execAgentBullet3:
    "Consistent 1:1 square format, optimised for Instagram and LinkedIn feeds",

  // Output
  outputColLabel_social: "Social Post",
  outputColLabel_presentation: "Presentation Slide",
  outputHeadlineAccent: "100%",
  outputHeadlineBody: "Brand Consistency",
  outputCaption: [
    "🚀 Big news! Our AI feature is live.",
    "",
    "No more starting from scratch. Describe what you need,",
    "and let AI handle the rest across every platform.",
    "",
    "#AI #ProductLaunch #ContentCreation #SaaS",
  ],
  outputLikes: "likes",
  outputComments: "View all 24 comments",
  outputCommentsAgo: "2 HOURS AGO",
  outputAddComment: "Add a comment…",

  // CTA
  ctaBrand: "LayerProof",
  ctaAccent: " Brand Kit",
};

export const vi: BrandKitStrings = {
  // Hook
  hookLine1: "Tạo thiết kế",
  hookLine2a: "chuẩn",
  hookLine2b: "brand identity",
  hookBadge_colors: "Màu sắc",
  hookBadge_logos: "Logo",
  hookBadge_typography: "Kiểu chữ",
  hookBadge_imageAssets: "Hình ảnh",
  hookBadge_brandVoice: "Brand voice",

  // Secret
  secretTitle: "Giới thiệu",
  secretSubtitleBrand: "Brand Kit",
  secretSubtitleTagline: "Tạo bộ nhận diện thương hiệu",
  secretPasteUrl: "Dán URL",
  secretOrDropPdf: "hoặc Thả PDF",
  secretPanelHeadline: "Tạo Brand Kit",
  secretPanelSubheadline: "trong vài giây",
  secretPanelDesc: "Dán URL hoặc Thả PDF brand guideline",
  secretImportBtn: "Nhập",
  secretUploadBtn: "Tải lên PDF Hướng dẫn",
  secretUrlPlaceholder: "https://huong-dan-thuong-hieu.com",
  secretCheck1: "Nhận diện logo",
  secretCheck2: "Xác định màu sắc",
  secretCheck3: "Chọn phông chữ",
  secretCheck4: "Thiết lập brand voice",
  secretCheck5: "Thu thập hình ảnh",
  secretCheck6: "Tạo brand theme",
  secretSection1: "Logo",
  secretSection2: "Màu thương hiệu",
  secretSection3: "Kiểu chữ",
  secretSection4: "Brand Voice",
  secretSection5: "Hình ảnh",
  secretSection6: "Brand Theme",
  secretColorLabel_pink: "Hồng",
  secretColorLabel_yellow: "Vàng",
  secretColorLabel_dark: "Tối",
  secretColorLabel_white: "Trắng",
  secretColorLabel_neutral: "Trung tính",
  secretTypoRole_heading: "Tiêu đề",
  secretTypoRole_body: "Nội dung",
  secretTypoWeights_heading: "Bold · Display",
  secretTypoWeights_body: "Regular · Light",
  secretVoice_toneLabel: "Tone",
  secretVoice_toneBody: '"Tự tin, tối giản, sáng tạo"',
  secretVoice_audienceLabel: "Target Audience",
  secretVoice_audienceBody: "Marketers & content teams",
  secretVoice_personalityLabel: "Personality",
  secretVoice_trait1: "Bold",
  secretVoice_trait2: "Hài hước",
  secretVoice_trait3: "Chính xác",
  secretThemeName: "LayerProof Brand Theme",
  secretThemeDesc: "Táo bạo · Sống động · Chế độ tối",

  // Suite
  suiteHeadline1: "Mở khóa",
  suiteHeadlineAccent: "công cụ sáng tạo",
  suiteCard1Title: "Social Post",
  suiteCard1Desc: "Tạo bài single post và carousel",
  suiteCard2Title: "Thuyết trình",
  suiteCard2Desc: "Xây dựng bộ slide từ mẫu có sẵn.",

  // Execution
  execPromptText: "Ra mắt tính năng Brand Kit của LayerProof",
  execPillLabel: "Social Post",
  execHeadlinePrefix: "BÀI ĐĂNG NÀO ",
  execHeadlineAccent: "KHÁN GIẢ",
  execHeadlineSuffix: " SẼ YÊU THÍCH?",
  execSubtitle:
    "Cho chúng tôi biết bạn muốn nói gì — chúng tôi sẽ tạo nội dung thu hút và xây dựng thương hiệu.",
  execChooseTheme: "Chọn chủ đề",
  execViewMore: "Xem thêm",
  execThemeLibrary: "Thư viện chủ đề",
  execEditorTitle: "Chiến dịch MXH – Bảo vệ sở hữu trí tuệ",
  execBriefText:
    "Poster chiến dịch mạng xã hội gọn gàng về bảo vệ sở hữu trí tuệ trên nền tảng Apple, có biểu tượng khóa, tiêu đề nổi bật và nút CTA trên nền trắng kem. Thiết kế tối giản, editorial.",
  execAgentIntro: "Đây là những gì tôi đã tạo dựa trên brief:",
  execAgentBullet1:
    'Chiến dịch MXH 3 trang về "Bảo vệ sáng tạo trên nền tảng Apple"',
  execAgentBullet2:
    'Mỗi trang có tiêu đề, nội dung hỗ trợ, biểu tượng khóa và CTA rõ ràng — "Khám phá các phương pháp IP tốt nhất"',
  execAgentBullet3:
    "Định dạng vuông 1:1 nhất quán, tối ưu cho Instagram và LinkedIn",

  // Output
  outputColLabel_social: "Social Post",
  outputColLabel_presentation: "Slide thuyết trình",
  outputHeadlineAccent: "100%",
  outputHeadlineBody: "Nhất quán thương hiệu",
  outputCaption: [
    ":rocket: Tính năng AI của chúng tôi đã ra mắt.",
    "",
    "Không cần bắt đầu từ đầu. Mô tả những gì bạn cần,",
    "và để AI xử lý phần còn lại trên mọi nền tảng.",
    "",
    "#AI #RaMắtSảnPhẩm #TạoNộiDung #SaaS",
  ],
  outputLikes: "lượt thích",
  outputComments: "Xem tất cả 24 bình luận",
  outputCommentsAgo: "2 GIỜ TRƯỚC",
  outputAddComment: "Thêm bình luận…",

  // CTA
  ctaBrand: "LayerProof",
  ctaAccent: " Brand Kit",
};
