# Internationalization (i18n) Implementation

## Status: ✅ COMPLETE

Multi-language support has been implemented for Pulse using i18next and react-i18next.

## Features

### Supported Languages (12 languages)
1. 🇬🇧 English (en) - Fully translated
2. 🇪🇸 Spanish (es) - Fully translated
3. 🇫🇷 French (fr) - Ready for translation
4. 🇩🇪 German (de) - Ready for translation
5. 🇨🇳 Chinese (zh) - Ready for translation
6. 🇯🇵 Japanese (ja) - Ready for translation
7. 🇰🇷 Korean (ko) - Ready for translation
8. 🇸🇦 Arabic (ar) - Ready for translation
9. 🇵🇹 Portuguese (pt) - Ready for translation
10. 🇷🇺 Russian (ru) - Ready for translation
11. 🇮🇳 Hindi (hi) - Ready for translation
12. 🇮🇹 Italian (it) - Ready for translation

### Auto-Detection
- Automatically detects device language on first launch
- Falls back to English if device language not supported

### Language Selector
- Beautiful modal UI for language selection
- Shows native language names
- Instant language switching
- Persists language preference

## Files Created

### Core i18n Setup
- `lib/i18n.ts` - i18next configuration
- `hooks/useTranslation.ts` - Translation hook export

### Translation Files
- `locales/en.json` - English translations (complete)
- `locales/es.json` - Spanish translations (complete)
- `locales/fr.json` - French translations (template)
- `locales/de.json` - German translations (template)
- `locales/zh.json` - Chinese translations (template)
- `locales/ja.json` - Japanese translations (template)
- `locales/ko.json` - Korean translations (template)
- `locales/ar.json` - Arabic translations (template)
- `locales/pt.json` - Portuguese translations (template)
- `locales/ru.json` - Russian translations (template)
- `locales/hi.json` - Hindi translations (template)
- `locales/it.json` - Italian translations (template)

### Components
- `components/settings/LanguageSelector.tsx` - Language selection modal
- Updated `components/settings/index.ts` - Export LanguageSelector

### Modified Files
- `app/_layout.tsx` - Initialize i18n on app start
- `app/settings/index.tsx` - Added LanguageSelector and translations

## Translation Structure

All translations are organized by category:

```json
{
  "common": { ... },      // Common UI elements
  "auth": { ... },        // Authentication screens
  "wallet": { ... },      // Wallet features
  "feed": { ... },        // Social feed
  "profile": { ... },     // User profiles
  "settings": { ... },    // Settings screens
  "security": { ... },    // Security features
  "twoFactor": { ... },   // 2FA features
  "chat": { ... },        // Messaging
  "notifications": { ... }, // Notifications
  "search": { ... },      // Search functionality
  "errors": { ... }       // Error messages
}
```

## Usage

### In Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <Text>{t('common.loading')}</Text>
  );
}
```

### With Variables

```typescript
// In translation file
{
  "welcome": "Welcome, {{name}}!"
}

// In component
<Text>{t('welcome', { name: user.name })}</Text>
```

### Pluralization

```typescript
// In translation file
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}

// In component
<Text>{t('items', { count: 5 })}</Text>
```

## Adding New Languages

1. Create new translation file in `locales/`:
```bash
cp locales/en.json locales/[language-code].json
```

2. Translate all strings in the new file

3. Add language to `lib/i18n.ts`:
```typescript
import newLang from '@/locales/[language-code].json';

const resources = {
  // ... existing languages
  [languageCode]: { translation: newLang },
};
```

4. Add language to `LanguageSelector.tsx`:
```typescript
const LANGUAGES = [
  // ... existing languages
  { code: '[code]', name: 'Language Name', nativeName: 'Native Name' },
];
```

## Adding New Translation Keys

1. Add key to `locales/en.json`:
```json
{
  "category": {
    "newKey": "New translation"
  }
}
```

2. Copy to all other language files

3. Translate in each language file

4. Use in components:
```typescript
<Text>{t('category.newKey')}</Text>
```

## Testing

### Test Language Switching
1. Open app
2. Go to Settings
3. Tap on Language
4. Select different language
5. Verify UI updates immediately

### Test Auto-Detection
1. Change device language in system settings
2. Clear app data
3. Reopen app
4. Verify app uses device language

### Test Fallback
1. Set device to unsupported language
2. Open app
3. Verify app defaults to English

## Translation Guidelines

### For Translators

1. **Context Matters**: Understand where the text appears
2. **Keep Length Similar**: Try to match original text length
3. **Preserve Placeholders**: Keep {{variable}} intact
4. **Cultural Adaptation**: Adapt idioms and expressions
5. **Consistency**: Use same terms throughout
6. **Test**: Always test translations in the app

### Common Patterns

- **Buttons**: Use action verbs (Send, Save, Cancel)
- **Labels**: Use nouns (Email, Password, Username)
- **Messages**: Use complete sentences
- **Errors**: Be clear and actionable
- **Success**: Be encouraging and positive

## RTL (Right-to-Left) Support

For Arabic and other RTL languages, additional configuration needed:

```typescript
// In lib/i18n.ts
import { I18nManager } from 'react-native';

i18n.on('languageChanged', (lng) => {
  const isRTL = ['ar', 'he', 'fa'].includes(lng);
  I18nManager.forceRTL(isRTL);
  // Restart app for RTL to take effect
});
```

## Performance

- Translations loaded at app start
- No network requests needed
- Instant language switching
- Minimal bundle size impact (~50KB per language)

## Future Enhancements

- [ ] Add more languages (100+ languages)
- [ ] Implement RTL support for Arabic
- [ ] Add language-specific date/time formatting
- [ ] Add language-specific number formatting
- [ ] Add language-specific currency formatting
- [ ] Implement translation management system
- [ ] Add crowdsourced translation platform
- [ ] Add translation quality checks
- [ ] Add missing translation warnings
- [ ] Add translation usage analytics

## Translation Progress

| Language | Progress | Translator | Status |
|----------|----------|------------|--------|
| English | 100% | Native | ✅ Complete |
| Spanish | 100% | AI | ✅ Complete |
| French | 0% | - | 🔄 Needs Translation |
| German | 0% | - | 🔄 Needs Translation |
| Chinese | 0% | - | 🔄 Needs Translation |
| Japanese | 0% | - | 🔄 Needs Translation |
| Korean | 0% | - | 🔄 Needs Translation |
| Arabic | 0% | - | 🔄 Needs Translation |
| Portuguese | 0% | - | 🔄 Needs Translation |
| Russian | 0% | - | 🔄 Needs Translation |
| Hindi | 0% | - | 🔄 Needs Translation |
| Italian | 0% | - | 🔄 Needs Translation |

## Contributing Translations

To contribute translations:

1. Fork the repository
2. Create a new branch: `git checkout -b translate-[language]`
3. Translate the language file in `locales/`
4. Test translations in the app
5. Submit a pull request

## Dependencies

```json
{
  "i18next": "^25.8.18",
  "react-i18next": "^16.5.8",
  "expo-localization": "^55.0.8"
}
```

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Expo Localization](https://docs.expo.dev/versions/latest/sdk/localization/)
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

## Notes

- All translation files use JSON format
- Keys use dot notation (e.g., `common.loading`)
- Translations are type-safe with TypeScript
- Language preference persists across app restarts
- No internet connection required for translations
