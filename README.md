# 톱니바꿈월드 (GearShift World) 홈페이지

톱니바꿈월드 공식 웹사이트 프로젝트 레포지토리입니다.

> [!TIP]
> 웹사이트 시스템 구조, 관리자 가이드, 그리고 AI 뉴스 자동 수집 파이프라인 정보는 **[운영자 매뉴얼 (ADMIN_MANUAL.md)](file:///d:/홈페이지/톱니바꿈월드/ADMIN_MANUAL.md)** 문서를 참고해 주세요.

## 개발 스택 및 실행
- **React + Vite**


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
