# 🍱 삼성전기 부산 식단 알리미 봇 (Welstory Mattermost Bot)

시놀로지 나스(Synology NAS) 도커 환경에서 동작하는 **웰스토리 식단 자동 알림 봇**입니다.  
매일 정해진 시간에 삼성전기 부산 사업장의 식사 메뉴를 가져와 매터모스트(Mattermost) 채널로 전송합니다.

![식단 봇 실행 화면](./screenshot.png)

## ✨ 주요 기능
- **자동 로그인:** 웰스토리(Welstory) 계정을 통한 자동 세션 관리 및 로그인
- **스마트 필터링:** 코인, 음료, 베이커리 등 부가 항목을 제외한 실제 식사 메뉴만 추출
- **시각화 알림:** 메뉴별 사진이 있을 경우 매터모스트 이미지 첨부 기능을 통해 전송
- **나스 최적화:** 시놀로지 Container Manager 및 작업 스케줄러를 통한 완전 자동화 운영

## 🛠 기술 스택
- **Language:** Node.js 20 (ES Modules)
- **Library:** `welstory-api-wrapper`, `axios`, `dotenv`
- **Infrastructure:** Docker, Synology NAS (Container Manager)

## 🚀 설치 및 설정 방법

### 1. 환경 변수 설정
`.env.sample` 파일을 복사하여 `.env` 파일을 생성하고 본인의 정보를 입력합니다. (이 파일은 절대 외부로 유출되지 않게 주의하세요.)

```text
WELSTORY_USERNAME=your_id
WELSTORY_PASSWORD=your_password
MATTERMOST_WEBHOOK_URL=your_mattermost_webhook_url
```


### 2. 도커 구성 파일 준비
프로젝트 폴더에 다음 파일들이 포함되어 있어야 합니다. 각 파일은 본인의 프로젝트 설정에 맞게 준비합니다.
- `test-bot.js`: 메인 로직 코드 (식단 추출 및 전송)
- `package.json`: 의존성 라이브러리 및 프로젝트 설정
- `Dockerfile`: Node.js 환경 빌드 설정
- `docker-compose.yml`: 컨테이너 실행 및 볼륨/네트워크 설정

### 3. 빌드 및 실행 (Synology NAS)
1. 시놀로지 **Container Manager**를 실행합니다.
2. **[프로젝트]** 메뉴에서 **[생성]**을 클릭합니다.
3. 위 파일들이 들어있는 폴더를 선택하고 프로젝트 이름을 입력한 뒤 생성을 완료합니다.
4. 최초 빌드가 완료되면 자동으로 컨테이너가 실행되며 매터모스트로 메시지가 전송됩니다.

### 4. 작업 스케줄러 등록 (자동화)
봇은 실행 후 종료되는 단발성 서비스이므로, 매일 아침 자동으로 실행하기 위해 시놀로지 **제어판 > 작업 스케줄러**에 아래 스크립트를 등록합니다.

```bash
# 컨테이너 이름을 확인 후 입력하세요 (기본값: 프로젝트명-서비스명-1)
docker start meal-bot-instance
```

## ⚠️ 주의사항
- **보안 주의:** 실제 계정 정보가 담긴 `.env` 파일은 절대 GitHub에 업로드하지 마세요. 반드시 `.gitignore`에 등록되어 있는지 확인해야 합니다.
- **네트워크:** 나스(NAS)가 외부 인터넷(웰스토리 서버 및 매터모스트 웹훅 서버)에 접속 가능한 상태여야 합니다.