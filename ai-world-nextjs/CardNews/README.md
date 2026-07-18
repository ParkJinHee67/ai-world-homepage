# 카드뉴스 자동화 도구

글(기사·대본·메모)을 붙여넣으면 AI가 인스타그램 카드뉴스(1080×1350 PNG 세트)로 만들어주는 로컬 브라우저 에디터입니다.

## 시작하기 (Windows)

1. [Node.js](https://nodejs.org)가 설치되어 있어야 합니다.
2. AI 변환 기능을 쓰려면 [Claude Code CLI](https://docs.claude.com/en/docs/claude-code)가 설치되어 있고 로그인되어 있어야 합니다 (`claude` 명령어가 PATH에 있어야 함).
3. `start.bat`을 더블클릭하면 서버가 켜지고 브라우저가 자동으로 열립니다.
4. 팀원은 설치 없이 `http://<호스트 IP>:8787/`로 접속하면 됩니다.

AI 변환 없이도 편집·빠른변환·스타일 전환·저장·ZIP 내보내기는 서버 없이(파일을 직접 열어도) 대부분 동작합니다. 단, ZIP/PNG 내보내기는 `file://`로 열면 브라우저 보안 정책 때문에 실패할 수 있으니 `start.bat`으로 여는 걸 권장합니다.

## 현재까지 구현된 마일스톤

- **M1** 카드 렌더러: 5타입 · fit() 자동축소 · PNG 내보내기
- **M2** 에디터: 필름스트립 · 필드 편집 · localStorage 자동저장 · JSON/ZIP
- **M3** 스타일 시스템: 6종 정체성(cine/mag/manga/pixel/doodle/blue) · 스타일별 배경 저장 · 11색 팔레트
- **M4** AI 변환: 로컬 서버(`server.js`) · `claude -p` 브리지 · 변환 프롬프트(`tools/deck-prompt.md`) · 빠른변환(오프라인 규칙 기반 폴백)
- **M5** 배경 파이프라인: 가독성 스크림 슬라이더 · 로컬 풀 🎲 셔플(현재/전체) · 무료 사진 검색(Pexels 키 있으면 사용, 없으면 Openverse 무키 폴백) · AI 배경 생성(Codex OAuth → Gemini 키 → OpenAI 키 순서) · AI 변환 직후 자동 배경(①즉시 셔플 → ②생성 가능하면 표지/인용/마무리 순차 교체)
- **M6** 팀 공유: `server.js`가 `0.0.0.0`으로 LAN에 열림 · 필름스트립 하단 "⚙ 서버 설정"에서 팀원이 호스트 IP 수동 입력(`localStorage['cn-server']`) 가능, 기본은 접속 주소 자동 인식 · `/ping` 기반 기능 감지 배지(Codex/Gemini/OpenAI/Pexels)를 상시 표시

모든 마일스톤(M1~M6)이 1차 구현되었습니다. 다음은 실제 API 키/Codex 로그인을 넣고 라이브 환경에서 검증하는 단계입니다.

## 폴더 구조

```
cardnews/
├── start.bat              # 더블클릭 실행 (Windows)
├── server.js               # 로컬 AI 브리지 서버 (의존성 0, Node 내장 모듈만 사용)
├── editor/
│   └── index.html           # 단일 파일 에디터 (빌드 없음)
├── tools/
│   ├── deck-prompt.md        # AI 변환 프롬프트
│   ├── gemini-key.txt.example
│   ├── openai-key.txt.example
│   └── pexels-key.txt.example
└── README.md
```

API 키가 필요하면 `tools/*.example` 파일을 복사해 확장자를 지우고(`gemini-key.txt` 등) 실제 키를 채워 넣으세요. 이 파일들은 `.gitignore`에 등록되어 있어 실수로 커밋되지 않습니다.
