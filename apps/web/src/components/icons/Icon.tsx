import React from 'react';

import ShriYantra from './ShriYantra';
import NamasteHands from './NamasteHands';
import VenusGlyph from './VenusGlyph';
import MercuryGlyph from './MercuryGlyph';
import KundliChart from './KundliChart';
import ScrollRemedy from './ScrollRemedy';
import TempleSilhouette from './TempleSilhouette';
import PlayVideo from './PlayVideo';
import PrasadBox from './PrasadBox';
import ShieldLock from './ShieldLock';
import StarRating from './StarRating';
import LotusSymbol from './LotusSymbol';
import GlobeIcon from './GlobeIcon';
import HourglassClock from './HourglassClock';
import SunRise from './SunRise';
import SunFull from './SunFull';
import Diya from './Diya';
import MoonCrescent from './MoonCrescent';
import ArrowRight from './ArrowRight';
import MarriageIcon from './MarriageIcon';
import BriefcaseIcon from './BriefcaseIcon';
import CoinStackIcon from './CoinStackIcon';
import HeartPulseIcon from './HeartPulseIcon';
import ScalesIcon from './ScalesIcon';
import FamilyIcon from './FamilyIcon';
import BookOpenIcon from './BookOpenIcon';
import BellIcon from './BellIcon';
import MicrophoneIcon from './MicrophoneIcon';
import HomeTabIcon from './HomeTabIcon';
import MalaIcon from './MalaIcon';
import UserProfileIcon from './UserProfileIcon';
import SendIcon from './SendIcon';
import ClipboardIcon from './ClipboardIcon';
import CalendarIcon from './CalendarIcon';
import ClockIcon from './ClockIcon';
import LocationPinIcon from './LocationPinIcon';
import SparklesIcon from './SparklesIcon';
import SearchIcon from './SearchIcon';
import TargetIcon from './TargetIcon';
import RefreshIcon from './RefreshIcon';
import LockIcon from './LockIcon';
import UsersIcon from './UsersIcon';
import ChatBubbleIcon from './ChatBubbleIcon';
import MeditationIcon from './MeditationIcon';
import GemstoneIcon from './GemstoneIcon';
import TridentIcon from './TridentIcon';
import TruckIcon from './TruckIcon';
import CartIcon from './CartIcon';
import VideoIcon from './VideoIcon';
import GiftIcon from './GiftIcon';
import FireIcon from './FireIcon';
import ShareIcon from './ShareIcon';
import BarChartIcon from './BarChartIcon';
import HouseIcon from './HouseIcon';
import AirplaneIcon from './AirplaneIcon';
import ShieldIcon from './ShieldIcon';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

const iconMap: Record<string, React.FC<{ size?: number; color?: string }>> = {
  // kebab-case keys
  'shri-yantra': ShriYantra,
  'namaste-hands': NamasteHands,
  'venus-glyph': VenusGlyph,
  'mercury-glyph': MercuryGlyph,
  'kundli-chart': KundliChart,
  'scroll-remedy': ScrollRemedy,
  'temple-silhouette': TempleSilhouette,
  'play-video': PlayVideo,
  'prasad-box': PrasadBox,
  'shield-lock': ShieldLock,
  'star-rating': StarRating,
  'lotus-symbol': LotusSymbol,
  'globe': GlobeIcon,
  'hourglass-clock': HourglassClock,
  'sun-rise': SunRise,
  'sun-full': SunFull,
  'diya': Diya,
  'moon-crescent': MoonCrescent,
  'arrow-right': ArrowRight,
  'marriage': MarriageIcon,
  'briefcase': BriefcaseIcon,
  'coin-stack': CoinStackIcon,
  'heart-pulse': HeartPulseIcon,
  'scales': ScalesIcon,
  'family': FamilyIcon,
  'book-open': BookOpenIcon,
  'bell': BellIcon,
  'microphone': MicrophoneIcon,
  'home-tab': HomeTabIcon,
  'mala': MalaIcon,
  'user-profile': UserProfileIcon,
  'send': SendIcon,
  // camelCase aliases (used by PROBLEM_TYPES.iconName)
  'coinStack': CoinStackIcon,
  'heartPulse': HeartPulseIcon,
  'bookOpen': BookOpenIcon,
  'kundliChart': KundliChart,
  // New icons
  'clipboard': ClipboardIcon,
  'calendar': CalendarIcon,
  'clock': ClockIcon,
  'location-pin': LocationPinIcon,
  'sparkles': SparklesIcon,
  'search': SearchIcon,
  'target': TargetIcon,
  'refresh': RefreshIcon,
  'lock': LockIcon,
  'users': UsersIcon,
  'chat-bubble': ChatBubbleIcon,
  'meditation': MeditationIcon,
  'gemstone': GemstoneIcon,
  'trident': TridentIcon,
  'truck': TruckIcon,
  'cart': CartIcon,
  'video': VideoIcon,
  'gift': GiftIcon,
  'fire': FireIcon,
  'share': ShareIcon,
  'bar-chart': BarChartIcon,
  'house': HouseIcon,
  'airplane': AirplaneIcon,
  'shield': ShieldIcon,
};

const Icon: React.FC<IconProps> = ({ name, size = 24, color = 'currentColor' }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Icon "${name}" not found. Available icons: ${Object.keys(iconMap).join(', ')}`);
    }
    return null;
  }

  return <IconComponent size={size} color={color} />;
};

export default Icon;
