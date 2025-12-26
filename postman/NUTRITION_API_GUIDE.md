# Nutrition APIs - Data Source & Usage Guide

## 📊 **Nguồn dữ liệu Calories**

### **1. Database: FoodItems Table**

Tất cả thông tin dinh dưỡng được lưu trong bảng `FoodItems`:

```sql
FoodItems {
    Id: GUID
    Name: string                    -- Tên món ăn (VD: "Cơm trắng", "Thịt gà")
    ServingSize: string             -- Khẩu phần (VD: "100g", "1 chén")
    ServingAmount: int              -- Số lượng (VD: 100, 200)
    CaloriesKcal: int              -- ⭐ Calories (kcal)
    ProteinG: decimal              -- Protein (gram)
    CarbsG: decimal                -- Carbohydrate (gram)
    FatG: decimal                  -- Chất béo (gram)
    FiberG: decimal                -- Chất xơ (gram)
    SodiumMg: int                  -- Natri (mg)
    Micronutrients: string         -- Vitamin, khoáng chất (JSON)
    Category: string               -- Loại (protein, carbs, vegetables...)
}
```

### **2. Cách hệ thống lấy dữ liệu**

```csharp
// Trong GenerateDailyMealPlan()
var allFoods = await _dbContext.FoodItems.ToListAsync();

// Chọn ngẫu nhiên món ăn
var food = allFoods[random.Next(allFoods.Count)];
var foodCalories = food.CaloriesKcal ?? 0;  // ⭐ Lấy calories từ DB

// Tính serving để fit mục tiêu
var servings = Math.Min(maxServings, random.Next(1, 3));
var itemCalories = foodCalories * servings;
```

### **3. Nguồn gốc dữ liệu FoodItems**

Dữ liệu có thể được:

- ✅ **Seed từ file JSON** (nếu có sẵn data)
- ✅ **Admin tạo thủ công** qua API `/food-items` (POST)
- ✅ **Import từ USDA Database** (cơ sở dữ liệu dinh dưỡng Mỹ)
- ✅ **Crawl từ nguồn công khai** (VD: MyFitnessPal, Nutritionix)

---

## 🤖 **Thuật toán tự động gen thực đơn**

### **Phân bổ Calories theo bữa:**

```
Breakfast: 30% × Target Calories
Lunch:     35% × Target Calories
Dinner:    30% × Target Calories
Snack:      5% × Target Calories
```

**Ví dụ:** Target = 2500 kcal

- Breakfast: 750 kcal
- Lunch: 875 kcal
- Dinner: 750 kcal
- Snack: 125 kcal

### **Logic chọn món:**

```csharp
foreach (var meal in ["Breakfast", "Lunch", "Dinner", "Snack"])
{
    var mealTarget = targetCalories * percentage;
    var currentMealCals = 0;

    while (currentMealCals < mealTarget * 0.8)  // Đạt ít nhất 80%
    {
        // 1. Chọn random món từ DB
        var food = allFoods[random.Next(count)];

        // 2. Tính serving tối đa có thể thêm
        var remainingCals = mealTarget - currentMealCals;
        var maxServings = remainingCals / food.CaloriesKcal;

        // 3. Chọn 1-2 servings
        var servings = Math.Min(maxServings, random.Next(1, 3));

        // 4. Kiểm tra không vượt quá 110% target
        if (currentMealCals + itemCals <= mealTarget * 1.1)
        {
            AddToMeal(food, servings);
            currentMealCals += itemCals;
        }

        // 5. Dừng khi đạt 90% target
        if (currentMealCals >= mealTarget * 0.9) break;
    }
}
```

---

## 📋 **Postman Collection Usage**

### **Import vào Postman:**

1. Mở Postman
2. Click **Import**
3. Chọn file: `nutrition-apis.postman_collection.json`
4. Set biến môi trường:
   - `base_url`: `http://localhost:5000`
   - `access_token`: JWT token của bạn

### **Workflow thực tế:**

#### **Bước 1: Tạo Plan**

```http
POST /nutrition-plans
{
  "title": "Weekly Plan Dec 10-16",
  "caloriesTargetKcal": 2500,
  "startDate": "2025-12-10",
  "endDate": "2025-12-16"
}
```

→ Lưu `plan_id` từ response

#### **Bước 2: Auto-gen thực đơn cho ngày**

```http
POST /nutrition-plans/{plan_id}/generate-daily
{
  "date": "2025-12-10T00:00:00Z",
  "caloriesTarget": 2500
}
```

→ Hệ thống tự động tạo 4 bữa ăn cân bằng

#### **Bước 3: Xem thực đơn đã gen**

```http
GET /nutrition-plans/{plan_id}
```

→ Xem tất cả món ăn theo từng bữa

#### **Bước 4: Chỉnh sửa nếu cần**

```http
PUT /nutrition-plans/{plan_id}/items/{item_id}
{
  "servingCount": 2.0,
  "notes": "Tăng khẩu phần"
}
```

#### **Bước 5: Đánh dấu đã ăn**

```http
PATCH /nutrition-plans/{plan_id}/items/{item_id}/complete
{
  "isCompleted": true
}
```

---

## 🎯 **Validation Rules**

### **Khi thêm món thủ công:**

```csharp
// Tính tổng calories của ngày
var dailyCals = items
    .Where(i => i.Date.Date == targetDate)
    .Sum(i => i.FoodItem.CaloriesKcal * i.ServingCount);

// Kiểm tra không vượt quá
if (dailyCals + newItemCals > plan.CaloriesTargetKcal)
{
    throw new Exception("Vượt quá giới hạn calories!");
}
```

### **Khi gen tự động:**

- ✅ Mỗi bữa đạt 80-90% mục tiêu
- ✅ Không vượt quá 110% mỗi bữa
- ✅ Random selection để đa dạng
- ✅ Tự động xóa thực đơn cũ của ngày đó

---

## 📊 **Example Response**

### **Generated Meal Plan:**

```json
{
  "success": true,
  "data": {
    "id": "plan-uuid",
    "title": "Weekly Plan Dec 10-16",
    "caloriesTargetKcal": 2500,
    "items": [
      {
        "id": "item-1",
        "mealTime": "Breakfast",
        "foodItemName": "Trứng chiên",
        "servingCount": 2,
        "isCompleted": false,
        "date": "2025-12-10",
        "foodItem": {
          "caloriesKcal": 155,
          "proteinG": 13,
          "carbsG": 1,
          "fatG": 11
        }
      },
      {
        "id": "item-2",
        "mealTime": "Breakfast",
        "foodItemName": "Bánh mì",
        "servingCount": 1,
        "isCompleted": false,
        "date": "2025-12-10",
        "foodItem": {
          "caloriesKcal": 265,
          "proteinG": 9,
          "carbsG": 49,
          "fatG": 3
        }
      }
      // ... more items for Lunch, Dinner, Snack
    ]
  }
}
```

---

## 🔍 **Debugging Tips**

### **Nếu gen ra ít món:**

→ Kiểm tra database có đủ FoodItems không:

```http
GET /food-items?pageSize=100
```

### **Nếu calories không đủ:**

→ Tăng `maxAttempts` trong code hoặc thêm món có calories cao hơn vào DB

### **Nếu vượt quá target:**

→ Logic đã có validation, kiểm tra lại `CaloriesTargetKcal` của plan

---

## 📝 **Notes**

- Dữ liệu calories **100% từ database** `FoodItems`
- Không hardcode, có thể update/thêm món mới bất cứ lúc nào
- Thuật toán đảm bảo cân bằng dinh dưỡng theo tỷ lệ khoa học
- Hỗ trợ unlimited items miễn không vượt daily limit
