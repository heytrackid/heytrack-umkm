import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import React from 'react';

export type LucideIcon = React.FC<{
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number | string;
  [key: string]: any;
}>;

interface IconProps extends React.ComponentProps<typeof Icon> {
  size?: number | string;
  className?: string;
}

const createIcon = (iconName: string): LucideIcon => {
  const IconWrapper = ({ size = 24, className, ...props }: any) => (
    <Icon
      icon={iconName}
      width={size}
      height={size}
      className={cn("", className)}
      {...props}
    />
  );
  IconWrapper.displayName = `Icon(${iconName})`;
  return IconWrapper;
};

export const Activity = createIcon("ph:activity");
export const AlertCircle = createIcon("ph:warning-circle");
export const AlertTriangle = createIcon("ph:warning");
export const ArrowDownIcon = createIcon("ph:arrow-down");
export const ArrowDownRight = createIcon("ph:arrow-down-right");
export const ArrowLeft = createIcon("ph:arrow-left");
export const ArrowRight = createIcon("ph:arrow-right");
export const ArrowUpIcon = createIcon("ph:arrow-up");
export const ArrowUpRight = createIcon("ph:arrow-up-right");
export const BarChart3 = createIcon("ph:chart-bar");
export const Bell = createIcon("ph:bell");
export const BookOpen = createIcon("ph:book-open");
export const Bot = createIcon("ph:robot");
export const Building = createIcon("ph:buildings");
export const Calculator = createIcon("ph:calculator");
export const Calendar = createIcon("ph:calendar");
export const Check = createIcon("ph:check");
export const CheckCheck = createIcon("ph:checks");
export const CheckCircle = createIcon("ph:check-circle");
export const CheckCircle2 = createIcon("ph:check-circle");
export const CheckIcon = createIcon("ph:check");
export const CheckSquare = createIcon("ph:check-square");
export const ChefHat = createIcon("ph:cooking-pot");
export const ChevronDown = createIcon("ph:caret-down");
export const ChevronDownIcon = createIcon("ph:caret-down");
export const ChevronLeft = createIcon("ph:caret-left");
export const ChevronRight = createIcon("ph:caret-right");
export const ChevronRightIcon = createIcon("ph:caret-right");
export const ChevronsLeft = createIcon("ph:caret-double-left");
export const ChevronsRight = createIcon("ph:caret-double-right");
export const ChevronUp = createIcon("ph:caret-up");
export const ChevronUpIcon = createIcon("ph:caret-up");
export const CircleIcon = createIcon("ph:circle");
export const Clock = createIcon("ph:clock");
export const Copy = createIcon("ph:copy");
export const CreditCard = createIcon("ph:credit-card");
export const DollarSign = createIcon("ph:currency-dollar");
export const Download = createIcon("ph:download-simple");
export const Edit = createIcon("ph:pencil-simple");
export const Edit2 = createIcon("ph:pencil-simple");
export const ExternalLink = createIcon("ph:arrow-square-out");
export const Eye = createIcon("ph:eye");
export const EyeOff = createIcon("ph:eye-slash");
export const Factory = createIcon("ph:factory");
export const FileImage = createIcon("ph:file-image");
export const FileSpreadsheet = createIcon("ph:file-xls");
export const FileText = createIcon("ph:file-text");
export const FileX = createIcon("ph:file-x");
export const Filter = createIcon("ph:funnel");
export const Flame = createIcon("ph:fire");
export const GripVertical = createIcon("ph:dots-six-vertical");
export const GripVerticalIcon = createIcon("ph:dots-six-vertical");
export const HelpCircle = createIcon("ph:question");
export const History = createIcon("ph:clock-counter-clockwise");
export const Home = createIcon("ph:house");
export const Info = createIcon("ph:info");
export const LayoutDashboard = createIcon("ph:squares-four");
export const Lightbulb = createIcon("ph:lightbulb");
export const LineChart = createIcon("ph:chart-line-up");
export const Loader2 = createIcon("ph:spinner-gap");
export const Lock = createIcon("ph:lock");
export const Mail = createIcon("ph:envelope");
export const MapPin = createIcon("ph:map-pin");
export const Maximize2 = createIcon("ph:arrows-out-simple");
export const MessageCircle = createIcon("ph:chat-circle");
export const MessageSquare = createIcon("ph:chat");
export const Minimize2 = createIcon("ph:arrows-in-simple");
export const Minus = createIcon("ph:minus");
export const MinusIcon = createIcon("ph:minus");
export const Moon = createIcon("ph:moon");
export const MoreHorizontal = createIcon("ph:dots-three");
export const MoreVertical = createIcon("ph:dots-three-vertical");
export const Package = createIcon("ph:package");
export const PackageCheck = createIcon("ph:package");
export const Palette = createIcon("ph:palette");
export const Pause = createIcon("ph:pause");
export const Pencil = createIcon("ph:pencil");
export const Percent = createIcon("ph:percent");
export const Phone = createIcon("ph:phone");
export const PiggyBank = createIcon("ph:piggy-bank");
export const Play = createIcon("ph:play");
export const Plus = createIcon("ph:plus");
export const Printer = createIcon("ph:printer");
export const Receipt = createIcon("ph:receipt");
export const RefreshCw = createIcon("ph:arrows-clockwise");
export const RotateCcw = createIcon("ph:arrow-counter-clockwise");
export const Save = createIcon("ph:floppy-disk");
export const Scale = createIcon("ph:scales");
export const Search = createIcon("ph:magnifying-glass");
export const Send = createIcon("ph:paper-plane-right");
export const Settings = createIcon("ph:gear");
export const Share = createIcon("ph:share-network");
export const Shield = createIcon("ph:shield");
export const ShoppingBag = createIcon("ph:bag");
export const ShoppingCart = createIcon("ph:shopping-cart");
export const SortAsc = createIcon("ph:sort-ascending");
export const SortDesc = createIcon("ph:sort-descending");
export const Sparkles = createIcon("ph:sparkle");
export const Star = createIcon("ph:star");
export const StarOff = createIcon("ph:star");
export const Sun = createIcon("ph:sun");
export const Table = createIcon("ph:table");
export const Tag = createIcon("ph:tag");
export const Target = createIcon("ph:target");
export const ThumbsDown = createIcon("ph:thumbs-down");
export const ThumbsUp = createIcon("ph:thumbs-up");
export const Timer = createIcon("ph:timer");
export const Trash2 = createIcon("ph:trash");
export const TrendingDown = createIcon("ph:trend-down");
export const TrendingUp = createIcon("ph:trend-up");
export const Truck = createIcon("ph:truck");
export const Undo2 = createIcon("ph:arrow-u-up-left");
export const Upload = createIcon("ph:upload-simple");
export const User = createIcon("ph:user");
export const UserPlus = createIcon("ph:user-plus");
export const Users = createIcon("ph:users");
export const Utensils = createIcon("ph:fork-knife");
export const Video = createIcon("ph:video-camera");
export const Volume2 = createIcon("ph:speaker-high");
export const Wifi = createIcon("ph:wifi-high");
export const WifiOff = createIcon("ph:wifi-slash");
export const X = createIcon("ph:x");
export const XCircle = createIcon("ph:x-circle");
export const XIcon = createIcon("ph:x");
export const Zap = createIcon("ph:lightning");

// Missing Icons Fixes
export const Menu = createIcon("ph:list");
export const Box = createIcon("ph:box");
export const Store = createIcon("ph:storefront");
export const Wallet = createIcon("ph:wallet");
export const Share2 = createIcon("ph:share-network");
export const Archive = createIcon("ph:archive");
export const Grid = createIcon("ph:squares-four");
export const List = createIcon("ph:list-bullets");
export const ServerCrash = createIcon("ph:hard-drives");
export const ShieldAlert = createIcon("ph:shield-warning");
export const CircleCheckIcon = createIcon("ph:check-circle");
export const InfoIcon = createIcon("ph:info");
export const Loader2Icon = createIcon("ph:spinner-gap");
export const OctagonXIcon = createIcon("ph:warning-octagon");
export const TriangleAlertIcon = createIcon("ph:warning");

