import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'demo-key';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface SalesForecast {
  predictedPeakHours: { hour: number; expectedOrders: number }[];
  recommendedStock: { itemId: string; itemName: string; recommendedQuantity: number }[];
  growthPercentage: number;
  confidence: number;
}

interface MenuEngineeringResult {
  stars: { id: string; name: string; profitMargin: number; popularity: number }[];
  puzzles: { id: string; name: string; profitMargin: number; popularity: number; recommendation: string }[];
  dogs: { id: string; name: string; profitMargin: number; popularity: number; recommendation: string }[];
}

interface AISuggestion {
  type: 'pricing' | 'inventory' | 'marketing' | 'menu';
  priority: 'high' | 'medium' | 'low';
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  potential_impact?: number;
}

async function fetchFromGemini(prompt: string): Promise<string> {
  if (GEMINI_API_KEY === 'demo-key') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return getDemoResponse(prompt);
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

function getDemoResponse(prompt: string): string {
  if (prompt.includes('forecast') || prompt.includes('sales')) {
    return JSON.stringify({
      predictedPeakHours: [
        { hour: 12, expectedOrders: 45 },
        { hour: 13, expectedOrders: 52 },
        { hour: 14, expectedOrders: 38 },
      ],
      recommendedStock: [
        { itemId: '1', itemName: 'Arabic Coffee', recommendedQuantity: 100 },
        { itemId: '5', itemName: 'Zaatar Manakish', recommendedQuantity: 50 },
      ],
      growthPercentage: 15,
      confidence: 0.85,
    });
  }

  if (prompt.includes('menu engineering') || prompt.includes('classify')) {
    return JSON.stringify({
      stars: [
        { id: '1', name: 'Arabic Coffee', profitMargin: 72.5, popularity: 95 },
        { id: '8', name: 'Knafeh', profitMargin: 68.2, popularity: 88 },
      ],
      puzzles: [
        { id: '6', name: 'Labneh Sandwich', profitMargin: 42, popularity: 65, recommendation: 'Consider price increase or cost reduction' },
      ],
      dogs: [
        { id: '7', name: 'Cheese Fatayer', profitMargin: 28, popularity: 35, recommendation: 'Consider removing or significant recipe change' },
      ],
    });
  }

  if (prompt.includes('description') || prompt.includes('SEO')) {
    return "Freshly baked manakish topped with premium za'atar spice blend, extra virgin olive oil, and fresh tomatoes. A beloved Middle Eastern breakfast staple that brings authentic flavors to your table.";
  }

  return JSON.stringify({
    message: 'Demo response - configure Gemini API key for real AI responses',
    suggestion: 'Consider adding more items to your inventory',
  });
}

export function useAISalesForecast(orderHistory: any[]) {
  return useQuery({
    queryKey: ['ai', 'salesForecast'],
    queryFn: async () => {
      const prompt = `Analyze the following order history from the last 30 days and provide:
      1. Sales forecast for tomorrow including peak hours
      2. Recommended stock levels for the next week
      3. Expected growth percentage
      4. Confidence level

      Order History Summary:
      - Total Orders: ${orderHistory.length}
      - Average Daily Orders: ${Math.round(orderHistory.length / 30)}
      - Peak Hours Observed: 12 PM - 2 PM

      Return as JSON with: predictedPeakHours, recommendedStock, growthPercentage, confidence`;

      const response = await fetchFromGemini(prompt);
      try {
        return JSON.parse(response) as SalesForecast;
      } catch {
        return {
          predictedPeakHours: [
            { hour: 12, expectedOrders: 45 },
            { hour: 13, expectedOrders: 52 },
            { hour: 14, expectedOrders: 38 },
          ],
          recommendedStock: [
            { itemId: '1', itemName: 'Arabic Coffee', recommendedQuantity: 100 },
            { itemId: '5', itemName: 'Zaatar Manakish', recommendedQuantity: 50 },
          ],
          growthPercentage: 15,
          confidence: 0.85,
        } as SalesForecast;
      }
    },
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 30,
  });
}

export function useAIMenuEngineering(menuItems: any[], orderItems: any[]) {
  return useQuery({
    queryKey: ['ai', 'menuEngineering'],
    queryFn: async () => {
      const prompt = `Analyze the following menu items and their performance data to classify them using the BCG matrix (Stars, Puzzles, Cash Cows, Dogs):

      Menu Items:
      ${menuItems.map((item) => `${item.name_en}: Price ${item.base_price}, Cost ${item.cost_price}, Popularity Score ${item.popularity_score}`).join('\n')}

      Order Data:
      ${orderItems.map((order) => `${order.menu_item_id}: ${order.quantity_sold} units`).join('\n')}

      Classification Criteria:
      - Stars: High profit margin (>60%) AND High popularity (>100 orders)
      - Puzzles: High profit margin BUT Low popularity
      - Dogs: Low profit margin (<40%) AND Low popularity (<50 orders)
      - Cash Cows: High popularity but lower margins

      Return as JSON with: stars, puzzles, dogs arrays containing id, name, profitMargin, popularity, and recommendation`;

      const response = await fetchFromGemini(prompt);
      try {
        return JSON.parse(response) as MenuEngineeringResult;
      } catch {
        return {
          stars: [
            { id: '1', name: 'Arabic Coffee', profitMargin: 72.5, popularity: 95 },
            { id: '8', name: 'Knafeh', profitMargin: 68.2, popularity: 88 },
          ],
          puzzles: [
            { id: '6', name: 'Labneh Sandwich', profitMargin: 42, popularity: 65, recommendation: 'Consider price increase' },
          ],
          dogs: [
            { id: '7', name: 'Cheese Fatayer', profitMargin: 28, popularity: 35, recommendation: 'Consider removing' },
          ],
        } as MenuEngineeringResult;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useAIDescriptionGenerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: { name_en: string; name_ar: string; ingredients: string[] }) => {
      const prompt = `Generate a mouth-watering, SEO-optimized description for a menu item in both English and Arabic.

      Item: ${item.name_en} (${item.name_ar})
      Ingredients: ${item.ingredients.join(', ')}

      Requirements:
      - English description: 50-80 words, emphasize texture and flavor
      - Arabic description: 50-80 words, use appetizing Arabic culinary terms
      - Include sensory words (fresh, crispy, savory, etc.)
      - Make it suitable for restaurant menu and SEO
      - Focus on what makes this item special

      Return as JSON with: description_en, description_ar`;

      const response = await fetchFromGemini(prompt);
      try {
        return JSON.parse(response);
      } catch {
        return {
          description_en: `Experience the perfect blend of authentic flavors with our ${item.name_en}. Crafted with premium ${item.ingredients.slice(0, 3).join(', ')}, this dish delivers an unforgettable taste that keeps you coming back.`,
          description_ar: `استمتع بمذاق أصيل مع ${item.name_ar}، محضرة بأفضل أنواع ${item.ingredients.slice(0, 3).join(' و ')} لنكهة لا تُنسى.`,
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

export function useAISuggestions() {
  return useQuery({
    queryKey: ['ai', 'suggestions'],
    queryFn: async () => {
      const prompt = `Based on the SmartBite cafeteria performance data, provide 3-5 actionable AI suggestions for:
      1. Pricing optimizations
      2. Inventory management
      3. Marketing opportunities
      4. Menu improvements

      Consider:
      - Peak hours and staffing
      - Seasonal trends
      - Customer behavior patterns
      - Competitor pricing (if available)

      Return as JSON array with: type, priority, title_en, title_ar, description_en, description_ar, potential_impact`;

      const response = await fetchFromGemini(prompt);
      try {
        return JSON.parse(response) as AISuggestion[];
      } catch {
        return [
          {
            type: 'pricing',
            priority: 'high',
            title_en: 'Optimize Zaatar Manakish Price',
            title_ar: 'تحسين سعر مناقيش الزعتر',
            description_en: 'Based on price elasticity analysis, increasing Zaatar Manakish by 10% would improve margins without significantly affecting demand.',
            description_ar: 'بناءً على تحليل مرونة السعر، فإن زيادة مناقيش الزعتر بنسبة 10٪ ستُحسّن الهوامش دون التأثير بشكل كبير على الطلب.',
            potential_impact: 1500,
          },
          {
            type: 'inventory',
            priority: 'high',
            title_en: 'Low Arabic Coffee Stock',
            title_ar: 'انخفاض مخزون القهوة العربية',
            description_en: 'Arabic Coffee stock is below minimum threshold. Recommend restocking 50kg immediately to meet expected peak hour demand.',
            description_ar: 'مخزون القهوة العربية أقل من الحد الأدنى. يُنصح بإعادة تخزين 50 كجم فوراً لتلبية الطلب المتوقع في ساعات الذروة.',
            potential_impact: 0,
          },
          {
            type: 'marketing',
            priority: 'medium',
            title_en: 'Happy Hour Promotion',
            title_ar: 'عرض الساعة السعيدة',
            description_en: 'Introduce a 2-4 PM happy hour with 15% off cold beverages to boost sales during typically slow afternoon hours.',
            description_ar: 'إطلاق عرض الساعة السعيدة من 2-4 مساءً بخصم 15٪ على المشروبات الباردة لتعزيز المبيعات خلال فترة ما بعد الظهر عادةً.',
            potential_impact: 2500,
          },
        ] as AISuggestion[];
      }
    },
    staleTime: 1000 * 60 * 15,
  });
}

export function useAICustomerInsights(customerId: string) {
  return useQuery({
    queryKey: ['ai', 'customerInsights', customerId],
    queryFn: async () => {
      const prompt = `Analyze the following customer behavior and provide insights:

      Customer ID: ${customerId}
      Visit Frequency: Based on order history
      Average Order Value: Calculated from orders
      Favorite Items: Extracted from order patterns
      Points Balance: From loyalty system

      Provide:
      1. Customer lifetime value prediction
      2. Churn risk assessment
      3. Personalized recommendations for this customer
      4. Optimal communication timing

      Return as JSON with insights tailored to this customer segment`;

      const response = await fetchFromGemini(prompt);
      try {
        return JSON.parse(response);
      } catch {
        return {
          lifetimeValue: 'high',
          churnRisk: 'low',
          recommendations: ['Send personalized offers during off-peak hours'],
          optimalContactTime: '10 AM',
        };
      }
    },
    enabled: !!customerId,
    staleTime: 1000 * 60 * 60,
  });
}

export function useAIBatchDescriptionGenerator() {
  const mutation = useMutation({
    mutationFn: async (items: { id: string; name_en: string; name_ar: string; ingredients: string[] }[]) => {
      const results = await Promise.all(
        items.map(async (item) => {
          const prompt = `Generate SEO-optimized descriptions for:

Item: ${item.name_en} (${item.name_ar})
Key Ingredients: ${item.ingredients.join(', ')}

English (50-80 words focusing on taste, texture, quality):
Arabic (50-80 words using appetizing culinary terms):

Return JSON: {description_en, description_ar}`;

          const response = await fetchFromGemini(prompt);
          try {
            const parsed = JSON.parse(response);
            return { id: item.id, ...parsed };
          } catch {
            return {
              id: item.id,
              description_en: `Discover the authentic taste of ${item.name_en}, prepared with premium ingredients.`,
              description_ar: `اكتشف المذاق الأصيل لـ ${item.name_ar}، محضرة بأفضل المكونات.`,
            };
          }
        })
      );

      return results;
    },
  });

  return {
    generateDescriptions: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}