import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
// 사용자님의 쿼터 리스트에 있는 최신 모델명을 사용합니다.
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

export interface RecipeResult {
  name: string;
  description: string;
  usedIngredients: string[];
  cookingTime: string;
  difficulty: string;
  reason: string;
  instructions: string[];
}

/**
 * 냉장고 재료를 바탕으로 식단을 추천받는 함수
 */
export async function getMealRecommendations(ingredients: any[]): Promise<RecipeResult[]> {
  if (!ingredients || ingredients.length === 0) {
    throw new Error("냉장고에 재료가 없습니다.");
  }

  const ingredientText = ingredients
    .map((ing) => {
      const diff = ing.expiryDate?.toDate()
        ? Math.ceil((ing.expiryDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
      return `- ${ing.name} (카테고리: ${ing.category}${diff !== null ? `, 유효기간 D-${diff}` : ""})`;
    })
    .join("\n");

  const prompt = `
    다음은 우리 가족 냉장고에 있는 식재료 목록입니다:
    ${ingredientText}

    위 재료들을 활용해서 오늘 저녁 메뉴 3가지를 추천해주세요. 
    다음 조건을 반드시 지켜주세요:
    1. 유효기간(D-Day)이 짧은 재료를 우선적으로 활용할 것.
    2. 집에서 흔히 할 수 있는 한국 가정식 위주로 추천할 것.
    3. 아이들이 먹기 좋은 메뉴를 하나 이상 포함할 것.
    4. 각 메뉴에 대해 이름, 설명, 사용된 재료 목록, 예상 조리 시간, 난이도, 추천 이유, 그리고 자세한 단계별 조리법(instructions)을 작성할 것.

    결과는 반드시 다음 JSON 형식의 배열로만 반환해주세요:
    [
      {
        "name": "메뉴이름",
        "description": "설명",
        "usedIngredients": ["재료1"],
        "cookingTime": "20분",
        "difficulty": "중",
        "reason": "추천 이유",
        "instructions": ["1. ..."]
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI 응답 형식이 올바르지 않습니다.");

    return JSON.parse(jsonMatch[0]) as RecipeResult[];
  } catch (error) {
    console.error("식단 추천 오류:", error);
    throw error;
  }
}

/**
 * 영수증 이미지를 분석하여 식재료 리스트를 추출하는 함수
 */
export const analyzeReceipt = async (imageFile: File) => {
  try {
    // 비전 기능은 1.5 Flash 계열 모델이 가장 안정적이므로 해당 모델을 사용합니다.
    const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imageBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(imageFile);
    });

    const prompt = `
      이 영수증 이미지를 분석하여 식재료 리스트를 JSON 형식으로 추출해줘.
      
      [주의사항]:
      1. 주류, 담배, 생활용품 제외하고 '식재료'만 추출할 것.
      2. 수량과 단위를 정확히 파악할 것 (예: 수량 1, 단위 "개").
      3. 카테고리는 다음 중 하나로 지정: vegetable, fruit, meat, seafood, dairy, grain, condiment, etc.
      
      [응답 형식]:
      JSON 배열 형식으로만 응답해줘. 예:
      [
        {"name": "품목명", "category": "dairy", "quantity": 1, "unit": "개"}
      ]
    `;

    const result = await visionModel.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageFile.type
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.error("영수증 분석 오류:", error);
    throw error;
  }
};
