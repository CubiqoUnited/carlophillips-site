import theme from '@/theme.json';
import { buildThemeCss } from '@/lib/theme/theme-css';

export function ThemeStyle() {
  return (
    <style
      data-cp-theme-tokens="theme.json"
      dangerouslySetInnerHTML={{ __html: buildThemeCss(theme) }}
    />
  );
}
