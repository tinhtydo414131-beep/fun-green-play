import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        games: 'Games',
        wallet: 'Wallet',
        profile: 'Profile',
        friends: 'Friends',
        messages: 'Messages',
        leaderboard: 'Leaderboard',
        settings: 'Settings',
      },
      // Common
      common: {
        play: 'Play',
        back: 'Back',
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        welcome: 'Welcome',
        logout: 'Logout',
        login: 'Login',
        signup: 'Sign Up',
      },
      // Wallet
      wallet: {
        title: 'FUN Wallet',
        balance: 'Balance',
        send: 'Send',
        receive: 'Receive',
        history: 'History',
        connect: 'Connect Wallet',
        disconnect: 'Disconnect',
        charityTitle: 'Charity Counter',
        charityDesc: 'Total donated to children worldwide',
        charityHelp: 'Every game you play helps children in need!',
        totalDonated: 'Total Donated',
        kidsHelped: 'Kids Helped',
        transactions: 'Transactions',
      },
      // Games
      games: {
        title: 'Games',
        play: 'Play Now',
        featured: 'Featured Games',
        popular: 'Popular',
        new: 'New',
        categories: 'Categories',
        search: 'Search games...',
        uploadGame: 'Upload Game',
        myGames: 'My Games',
        recentlyPlayed: 'Recently Played',
        createdBy: 'Created by',
      },
      // Rewards
      rewards: {
        title: 'Rewards',
        earnedToday: 'Earned Today',
        totalEarned: 'Total Earned',
        claimReward: 'Claim Reward',
        dailyBonus: 'Daily Bonus',
        gameReward: 'Game Reward',
        referralReward: 'Referral Reward',
        uploadReward: 'Upload Reward',
      },
      // Role Selection
      roles: {
        selectRole: 'Select Your Role',
        player: "I'm a Player",
        playerDesc: 'Play games and earn CAMLY coins!',
        developer: "I'm a Developer",
        developerDesc: 'Create games and earn 500,000 CAMLY per game!',
        welcome: 'Role saved successfully!',
        welcomeDesc: 'Welcome to FUN Planet 5D!',
      },
      // Messages
      messages: {
        title: 'Messages',
        newMessage: 'New Message',
        typeMessage: 'Type a message...',
        send: 'Send',
        online: 'Online',
        offline: 'Offline',
        typing: 'typing...',
      },
      // Profile
      profile: {
        title: 'Profile',
        editProfile: 'Edit Profile',
        myAchievements: 'My Achievements',
        myNFTs: 'My NFTs',
        totalPlays: 'Total Plays',
        totalLikes: 'Total Likes',
        joinedDate: 'Joined',
      },
    },
  },
  vi: {
    translation: {
      // Navigation
      nav: {
        home: 'Trang chủ',
        games: 'Trò chơi',
        wallet: 'Ví',
        profile: 'Hồ sơ',
        friends: 'Bạn bè',
        messages: 'Tin nhắn',
        leaderboard: 'Bảng xếp hạng',
        settings: 'Cài đặt',
      },
      // Common
      common: {
        play: 'Chơi',
        back: 'Quay lại',
        save: 'Lưu',
        cancel: 'Hủy',
        confirm: 'Xác nhận',
        loading: 'Đang tải...',
        error: 'Lỗi',
        success: 'Thành công',
        welcome: 'Chào mừng',
        logout: 'Đăng xuất',
        login: 'Đăng nhập',
        signup: 'Đăng ký',
      },
      // Wallet
      wallet: {
        title: 'Ví FUN',
        balance: 'Số dư',
        send: 'Gửi',
        receive: 'Nhận',
        history: 'Lịch sử',
        connect: 'Kết nối ví',
        disconnect: 'Ngắt kết nối',
        charityTitle: 'Quỹ Từ Thiện',
        charityDesc: 'Tổng quyên góp cho trẻ em toàn cầu',
        charityHelp: 'Mỗi game bạn chơi đều giúp đỡ trẻ em!',
        totalDonated: 'Đã Quyên Góp',
        kidsHelped: 'Trẻ Em Được Giúp',
        transactions: 'Giao Dịch',
      },
      // Games
      games: {
        title: 'Trò Chơi',
        play: 'Chơi Ngay',
        featured: 'Game Nổi Bật',
        popular: 'Phổ Biến',
        new: 'Mới',
        categories: 'Thể Loại',
        search: 'Tìm kiếm game...',
        uploadGame: 'Tải Game Lên',
        myGames: 'Game Của Tôi',
        recentlyPlayed: 'Chơi Gần Đây',
        createdBy: 'Tạo bởi',
      },
      // Rewards
      rewards: {
        title: 'Phần Thưởng',
        earnedToday: 'Hôm Nay',
        totalEarned: 'Tổng Cộng',
        claimReward: 'Nhận Thưởng',
        dailyBonus: 'Thưởng Hàng Ngày',
        gameReward: 'Thưởng Game',
        referralReward: 'Thưởng Giới Thiệu',
        uploadReward: 'Thưởng Upload',
      },
      // Role Selection
      roles: {
        selectRole: 'Chọn Vai Trò',
        player: 'Tôi là Người Chơi',
        playerDesc: 'Chơi game và kiếm CAMLY coins!',
        developer: 'Tôi là Lập Trình Viên',
        developerDesc: 'Tạo game và kiếm 500.000 CAMLY mỗi game!',
        welcome: 'Role đã được lưu thành công!',
        welcomeDesc: 'Chào mừng đến FUN Planet 5D!',
      },
      // Messages
      messages: {
        title: 'Tin Nhắn',
        newMessage: 'Tin Nhắn Mới',
        typeMessage: 'Nhập tin nhắn...',
        send: 'Gửi',
        online: 'Trực tuyến',
        offline: 'Ngoại tuyến',
        typing: 'đang nhập...',
      },
      // Profile
      profile: {
        title: 'Hồ Sơ',
        editProfile: 'Chỉnh Sửa',
        myAchievements: 'Thành Tựu',
        myNFTs: 'NFT Của Tôi',
        totalPlays: 'Tổng Lượt Chơi',
        totalLikes: 'Tổng Lượt Thích',
        joinedDate: 'Ngày Tham Gia',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', // Default to Vietnamese
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
