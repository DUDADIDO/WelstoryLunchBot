import { WelstoryClient, WelstoryRestaurant } from "welstory-api-wrapper";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
  const client = new WelstoryClient();
  const restaurantCode = "REST000595"; // 삼성전기 부산

  try {
    console.log("🔐 로그인을 시도합니다...");
    await client.login({
      username: process.env.WELSTORY_USERNAME,
      password: process.env.WELSTORY_PASSWORD,
    });
    console.log("✅ 로그인 성공!");

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    console.log(`📅 조회 날짜: ${today}`);

    const restaurant = new WelstoryRestaurant(
      client,
      restaurantCode,
      "삼성전기 부산",
    );

    console.log("🍱 식단 데이터를 가져오는 중...");
    const rawMeals = await restaurant.listMeal(parseInt(today), "2");

    if (!rawMeals || rawMeals.length === 0) {
      console.log("❌ 오늘 등록된 식단이 없습니다.");
      process.exit(0);
      return;
    }

    // [필터링] 제외 키워드 목록
    const excludeKeywords = ["코인", "품목", "음료", "베이커리"];

    const meals = rawMeals.filter((meal) => {
      const name = meal.name || "";
      const course = meal.menuCourseName || "";

      // 이름이나 코너명에 제외 키워드가 하나라도 있으면 걸러냄
      return !excludeKeywords.some(
        (key) => name.includes(key) || course.includes(key),
      );
    });

    console.log("\n=== [필터링된 최종 메뉴 리스트] ===");
    const attachments = meals.map((meal) => {
      const imageUrl = (meal.photoUrl || "") + (meal.photoCd || "");

      console.log(`▶ [${meal.menuCourseName}] ${meal.name}`);

      return {
        title: `[${meal.menuCourseName}] ${meal.name}`,
        text: `📝 메뉴: ${meal.subMenuTxt}`,
        image_url: imageUrl,
        color: "#00aaff",
      };
    });

    // 웹훅 전송
    const webhookUrl = process.env.MATTERMOST_WEBHOOK_URL;
    if (webhookUrl && webhookUrl.startsWith("http")) {
      console.log("\n🚀 매터모스트로 전송합니다...");
      await axios.post(webhookUrl, {
        text: `### 🍴 삼성전기 부산 오늘의 점심 (${today})`,
        attachments: attachments,
      });
      console.log("✅ 전송 완료!");
      // [중요] 모든 작업이 성공적으로 끝난 후 여기서 종료
      console.log("프로그램을 정상 종료합니다.");
      process.exit(0);
    } else {
      console.log(
        "\n⚠️ 알림: .env 파일의 MATTERMOST_WEBHOOK_URL 설정을 확인해주세요.",
      );
      process.exit(1); // ⚠️ 설정 오류 시 종료 (추가 권장)
    }
  } catch (error) {
    console.error("📂 에러 발생:", error.message);
    process.exit(1);
  }
}

// 반드시 딱 한 번만 호출
runTest();