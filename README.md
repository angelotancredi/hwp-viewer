# HWP Viewer (Galaxy Optimized)

삼성 갤럭시 기기(갤럭시 폰, 갤럭시 탭)의 스타일인 **One UI** 디자인을 반영한 웹 기반 HWP 문서 뷰어입니다. 
Vercel에 배포하여 '홈 화면에 추가(PWA)' 기능을 통해 앱처럼 사용할 수 있도록 최적화되어 있습니다.

## 주요 기능
- **반응형 레이아웃**: 820px 기준점을 사용하여 폰(1단)과 탭(2분할) 레이아웃 자동 전환
- **One UI 에스테틱**: 프리미엄 곡률(28px), One UI 블루 테마, 다크 모드 지원
- **탭 특화 기능**: 전체 화면 확대/축소 토글 버튼
- **PWA 지원**: Vercel 배포 시 앱처럼 작동 (Offline 지원 예정)
- **HWP 연동**: `hwp.js`를 사용한 클라이언트 사이드 파싱 예시 포함

## 기술 스택
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Parsing**: hwp.js

## 시작하기

```bash
# 의존성 설치
npm install

# 로컬 실행
npm run dev
```

## 배포 방법 (GitHub + Vercel)
1. GitHub 리포지토리를 생성합니다.
2. 로컬 프로젝트를 push합니다.
3. Vercel에서 리포지토리를 Import하여 배포합니다.
