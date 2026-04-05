import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

export interface RecipeResult {
  name: string;
  description: string;
  usedIngredients: string[];
  cookingTime: string;
  difficulty: string;
  reason: string; // 왜 이 요리를 추천했는지
  instructions: string[]; // 추가된 필드: 단계별 조리법
}

export async function getMealRecommendations(ingredients: any[]): Promise<RecipeResult[]> {
  if (!ingredients || ingredients.length === 0) {
    throw new Error("냉장고에 재료가 없습니다.");
  }

  // 1. 재료 정보 텍스트화 (유효기간 임박 표시 추가)
  const ingredientText = ingredients
    .map((ing) => {
      const diff = ing.expiryDate?.toDate()
        ? Math.ceil((ing.expiryDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
      return `- ${ing.name} (카테고리: ${ing.category}${diff !== null ? `, 유효기간 D-${diff}` : ""})`;
    })
    .join("\n");

  // 2. 프롬프트 구성
  const prompt = `
    다음은 우리 가족 냉장고에 있는 식재료 목록입니다:
    ${ingredientText}

    위 재료들을 활용해서 오늘 저녁 메뉴 3가지를 추천해주세요. 
    다음 조건을 반드시 지켜주세요:
    1. 유효기간(D-Day)이 짧은 재료를 우선적으로 활용할 것.
    2. 집에서 흔히 할 수 있는 한국 가정식 위주로 추천할 것.
    3. 아이들이 먹기 좋은 메뉴를 하나 이상 포함할 것.
    4. 각 메뉴에 대해 이름, 설명, 사용된 재료 목록, 예상 조리 시간, 난이도, 추천 이유, **그리고 자세한 단계별 조리법(instructions)**을 작성할 것.

    결과는 반드시 다음 JSON 형식의 배열로만 반환해주세요 (주석이나 다른 텍스트 금지):
    [
      {
        "name": "메뉴이름",
        "description": "메뉴에 대한 짧은 설명",
        "usedIngredients": ["재료1", "재료2"],
        "cookingTime": "20분",
        "difficulty": "중",
        "reason": "추천 이유",
        "instructions": ["1. ...", "2. ..."]
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON 파싱 (가끔 Markdown 코드 블록이 섞일 수 있으므로 정규식 처리)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI 응답 형식이 올바르지 않습니다.");

    return JSON.parse(jsonMatch[0]) as RecipeResult[];
  } catch (error) {
    console.error("Gemini API 호출 오류:", error);
    throw error;
  }
}
