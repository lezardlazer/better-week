import {
  Activity,
  Apple,
  Bike,
  BookOpen,
  Brain,
  Briefcase,
  Camera,
  Check,
  ChevronRight,
  Clock,
  LogOut,
  Menu,
  Coffee,
  Dumbbell,
  Feather,
  Flame,
  Footprints,
  Gift,
  Heart,
  HeartPulse,
  Home,
  Leaf,
  type LucideIcon,
  Moon,
  Music,
  Palette,
  Pencil,
  Plane,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Users,
  Wallet,
  Waves,
  X,
} from 'lucide-react-native';
import { colors } from '../theme/tokens';

export const ICONS = {
  leaf: Leaf,
  feather: Feather,
  'book-open': BookOpen,
  dumbbell: Dumbbell,
  footprints: Footprints,
  waves: Waves,
  brain: Brain,
  heart: Heart,
  moon: Moon,
  sun: Sun,
  coffee: Coffee,
  music: Music,
  pencil: Pencil,
  flame: Flame,
  activity: Activity,
  sparkles: Sparkles,
  palette: Palette,
  wallet: Wallet,
  users: Users,
  home: Home,
  apple: Apple,
  briefcase: Briefcase,
  sprout: Sprout,
  'heart-pulse': HeartPulse,
  bike: Bike,
  camera: Camera,
  gift: Gift,
  plane: Plane,
  star: Star,
  check: Check,
  'chevron-right': ChevronRight,
  clock: Clock,
  'log-out': LogOut,
  menu: Menu,
  x: X,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

// 16 options offered when picking a habit's own icon, matching the reference design.
export const HABIT_ICON_CHOICES: IconName[] = [
  'leaf',
  'feather',
  'book-open',
  'dumbbell',
  'footprints',
  'waves',
  'brain',
  'heart',
  'moon',
  'sun',
  'coffee',
  'music',
  'pencil',
  'flame',
  'activity',
  'sparkles',
];

// Broader set offered when picking a custom category's icon.
export const CATEGORY_ICON_CHOICES: IconName[] = [
  ...HABIT_ICON_CHOICES,
  'palette',
  'wallet',
  'users',
  'home',
  'apple',
  'briefcase',
  'sprout',
  'heart-pulse',
  'bike',
  'camera',
  'gift',
  'plane',
  'star',
];

export function AppIcon({
  name,
  size = 20,
  color = colors.ink,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const Icon = ICONS[name as IconName] ?? Sparkles;
  return <Icon size={size} color={color} />;
}
