/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    card: '#FFFFFF',
    cardBorder: '#E6ECF1',
    cardSecondary: '#F7FBFF',
    cardTertiary: '#F8FBF9',
    accent: '#0FA958',
    accentSecondary: '#6CF2AA',
    muted: '#52606A',
    mutedSecondary: '#687076',
    badge: '#E6FFF2',
    badgeBorder: '#B8F2CF',
    progressTrack: '#ECF4FF',
    progressFill: '#18B26B',
    warning: '#FFEDEC',
    warningBorder: '#F5C2BF',
    warningText: '#B02A2A',
    info: '#FFF8E6',
    infoBorder: '#F6DC9F',
    infoText: '#B8860B',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F4F6F8',
    background: '#101214',
    card: '#181C1F',
    cardBorder: '#23272B',
    cardSecondary: '#151A1E',
    cardTertiary: '#1A1F23',
    accent: '#6CF2AA',
    accentSecondary: '#0FA958',
    muted: '#A3B0BB',
    mutedSecondary: '#6C7A89',
    badge: '#183824',
    badgeBorder: '#0FA958',
    progressTrack: '#23272B',
    progressFill: '#6CF2AA',
    warning: '#3A2322',
    warningBorder: '#B02A2A',
    warningText: '#F5C2BF',
    info: '#2D2617',
    infoBorder: '#B8860B',
    infoText: '#F6DC9F',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
