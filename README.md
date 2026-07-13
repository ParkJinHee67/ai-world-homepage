# ⚙️ 톱니바꿈월드 (GearShift World) 홈페이지

톱니바꿈월드 공식 웹사이트 프로젝트 레포지토리입니다.

> [!TIP]
> * 웹사이트 시스템 구조, 관리자 가이드, 그리고 AI 뉴스 자동 수집 파이프라인 정보는 **[운영자 매뉴얼 (ADMIN_MANUAL.md)](file:///d:/홈페이지/톱니바꿈월드/ADMIN_MANUAL.md)** 문서를 참고해 주세요.
> * 마이그레이션 후 변경된 폴더 구조 및 새 페이지 개발 지침은 **[마이그레이션 가이드 (MIGRATION_GUIDE.md)](file:///d:/홈페이지/톱니바꿈월드/MIGRATION_GUIDE.md)** 문서를 참고해 주세요.

## 🛠️ 개발 스택 및 구성
본 웹사이트는 성능 및 검색엔진 최적화(SEO)를 극대화하기 위해 **React + Vite** 환경에서 **Next.js 15+ (App Router)** 환경으로 마이그레이션되었습니다.

* **메인 웹 애플리케이션**: [ai-world-nextjs](file:///d:/홈페이지/톱니바꿈월드/ai-world-nextjs) 폴더
* **기존 Vite 소스 (참고용)**: 루트 [src](file:///d:/홈페이지/톱니바꿈월드/src) 폴더

## 🚀 빠른 시작 (Next.js)
새로운 웹 사이트 환경에서 로컬 개발 서버를 실행하려면 아래 단계를 따르세요.

1. **프로젝트 폴더로 이동**:
   ```bash
   cd ai-world-nextjs
   ```
2. **패키지 설치** (최초 실행 시):
   ```bash
   npm install
   ```
3. **개발 서버 구동**:
   ```bash
   npm run dev
   ```
4. **브라우저 확인**: [http://localhost:3000](http://localhost:3000)

---
*기존 Vite 프로젝트 빌드/구동 설정은 더 이상 실제 프로덕션 서비스에 직접 사용되지 않으며, 모든 최신 변경 사항과 기능 추가는 `ai-world-nextjs` 폴더 내에서 이루어져야 합니다.*
