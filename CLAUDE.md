# Claude Code Guidelines

## Design System Compliance

컴포넌트를 생성하거나 수정할 때 반드시 `src/guidelines/DesignSystem.md` 파일을 먼저 읽고 디자인 시스템을 준수해야 합니다.

### 핵심 원칙

1. **iPad 최적화**: 모든 UI는 iPad Pro 11" (1194 × 834 pt landscape)를 기준으로 설계
2. **터치 친화적**: 모든 인터랙티브 요소는 최소 44pt × 44pt 크기
3. **자연수만 사용**: 모든 spacing, sizing 값은 소수점 없이 자연수만 사용 (1px = 1pt)

### 필수 참조 값

#### Spacing (4pt 기반)
- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

#### Typography
- Display: 32pt, 28pt, 24pt
- Headings: 20pt, 18pt, 16pt
- Body: 16pt, 14pt, 12pt

#### Border Radius
- Small: 6px
- Default: 8px
- Large: 12px
- XL: 16px

#### Component Heights
- Input: 44px
- Button (default): 36px
- Button (touch): 44px
- Table row: 56px

### Color System
```css
--background: #ffffff
--foreground: oklch(0.145 0 0)
--primary: #030213
--primary-foreground: #ffffff
--secondary: oklch(0.95 0.0058 264.53)
--border: rgba(0, 0, 0, 0.1)
--destructive: #d4183d
--success: #16a34a
--warning: #ea580c
```

### 컴포넌트 작성 시 체크리스트

- [ ] 터치 타겟 최소 44px × 44px 준수
- [ ] Spacing은 4의 배수만 사용
- [ ] 소수점 값 사용 금지
- [ ] 올바른 border-radius 적용
- [ ] 색상은 디자인 시스템 변수 사용
- [ ] 폰트 사이즈는 정의된 스케일 사용

## Project Structure

- `src/guidelines/` - 디자인 가이드라인 문서
- `src/components/` - React 컴포넌트
