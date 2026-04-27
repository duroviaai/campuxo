import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUsers,
  faBook,
  faChalkboardUser,
  faClipboardList,
  faGraduationCap,
  faCalendarDays,
  faCog,
  faSignOut,
  faPlus,
  faPencil,
  faTrash,
  faSearch,
  faFilter,
  faDownload,
  faUpload,
  faEye,
  faEyeSlash,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faArrowRight,
  faArrowLeft,
  faChevronDown,
  faChevronUp,
  faBars,
  faTh,
  faList,
  faBell,
  faUser,
  faLock,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCalendar,
  faClock,
  faFileAlt,
  faChartBar,
  faAward,
  faUserCheck,
  faUserTimes,
  faUserPlus,
  faDashboard,
  faSchool,
  faBriefcase,
  faClipboard,
  faCheckDouble,
  faEllipsisV,
  faEllipsisH,
  faSort,
  faSortUp,
  faSortDown,
  faExternalLinkAlt,
  faRefresh,
  faSync,
  faCircleNotch,
  faExclamationCircle,
  faQuestionCircle,
  faHeart,
  faStar,
  faFlag,
  faLink,
  faCopy,
  faShare,
  faPrint,
  faArchive,
  faUndo,
  faRedo,
  faHistory,
  faFolderOpen,
  faFolder,
  faFile,
  faFileExcel,
  faFilePdf,
  faFileWord,
  faImage,
  faVideo,
  faMusic,
  faCode,
  faDatabase,
  faServer,
  faCloud,
  faNetworkWired,
  faShieldAlt,
  faLockOpen,
  faKey,
  faFingerprint,
} from '@fortawesome/free-solid-svg-icons';

// Icon size presets
export const ICON_SIZES = {
  xs: 'xs',
  sm: 'sm',
  md: 'lg',
  lg: '2x',
  xl: '3x',
};

// Icon component wrapper
export const Icon = ({ icon, size = 'md', className = '', ...props }) => (
  <FontAwesomeIcon
    icon={icon}
    size={ICON_SIZES[size]}
    className={`transition-colors ${className}`}
    {...props}
  />
);

// Navigation Icons
export const NavIcons = {
  dashboard: faHome,
  users: faUsers,
  courses: faBook,
  faculty: faChalkboardUser,
  attendance: faClipboardList,
  students: faGraduationCap,
  schedule: faCalendarDays,
  settings: faCog,
  logout: faSignOut,
};

// Action Icons
export const ActionIcons = {
  add: faPlus,
  edit: faPencil,
  delete: faTrash,
  search: faSearch,
  filter: faFilter,
  download: faDownload,
  upload: faUpload,
  view: faEye,
  hide: faEyeSlash,
  refresh: faRefresh,
  sync: faSync,
  undo: faUndo,
  redo: faRedo,
  copy: faCopy,
  share: faShare,
  print: faPrint,
  archive: faArchive,
};

// Status Icons
export const StatusIcons = {
  success: faCheckCircle,
  error: faTimesCircle,
  warning: faExclamationTriangle,
  info: faInfoCircle,
  check: faCheck,
  close: faTimes,
  pending: faSpinner,
};

// User Icons
export const UserIcons = {
  profile: faUser,
  logout: faSignOut,
  lock: faLock,
  email: faEnvelope,
  phone: faPhone,
  location: faMapMarkerAlt,
  userCheck: faUserCheck,
  userTimes: faUserTimes,
  userPlus: faUserPlus,
};

// Academic Icons
export const AcademicIcons = {
  graduation: faGraduationCap,
  school: faSchool,
  book: faBook,
  clipboard: faClipboard,
  assignment: faFileAlt,
  exam: faClipboardList,
  marks: faChartBar,
  award: faAward,
  briefcase: faBriefcase,
};

// Navigation Icons
export const NavigationIcons = {
  arrowRight: faArrowRight,
  arrowLeft: faArrowLeft,
  chevronDown: faChevronDown,
  chevronUp: faChevronUp,
  menu: faBars,
  grid: faTh,
  list: faList,
  externalLink: faExternalLinkAlt,
};

// Time Icons
export const TimeIcons = {
  calendar: faCalendar,
  clock: faClock,
  history: faHistory,
};

// File Icons
export const FileIcons = {
  file: faFile,
  fileAlt: faFileAlt,
  fileExcel: faFileExcel,
  filePdf: faFilePdf,
  fileWord: faFileWord,
  image: faImage,
  video: faVideo,
  music: faMusic,
  folder: faFolder,
  folderOpen: faFolderOpen,
};

// Notification Icons
export const NotificationIcons = {
  bell: faBell,
  exclamation: faExclamationCircle,
  question: faQuestionCircle,
  info: faInfoCircle,
};

// Utility Icons
export const UtilityIcons = {
  ellipsisV: faEllipsisV,
  ellipsisH: faEllipsisH,
  sort: faSort,
  sortUp: faSortUp,
  sortDown: faSortDown,
  moreOptions: faEllipsisV,
  loading: faCircleNotch,
  heart: faHeart,
  star: faStar,
  flag: faFlag,
  link: faLink,
};

// Security Icons
export const SecurityIcons = {
  lock: faLock,
  lockOpen: faLockOpen,
  key: faKey,
  fingerprint: faFingerprint,
  shield: faShieldAlt,
};

// System Icons
export const SystemIcons = {
  database: faDatabase,
  server: faServer,
  cloud: faCloud,
  network: faNetworkWired,
  code: faCode,
};

export default Icon;
