#!/bin/bash

# ----------------------------------------------
# 🚀 Add all dummy menu items to Stripe Sandbox
# ----------------------------------------------

# 👇 Your Stripe test secret key (sandbox mode)
API_KEY="<your_test_secret_key_here>"

# 🔧 Requirements:
#   - Stripe CLI installed
#   - jq and bc installed
# ----------------------------------------------

# Menu items (name|description|image|price|category)
MENU_ITEMS=(
  "Classic Cheeseburger|Beef patty, cheese, lettuce, tomato|https://static.vecteezy.com/system/resources/previews/044/844/600/large_2x/homemade-fresh-tasty-burger-with-meat-and-cheese-classic-cheese-burger-and-vegetable-ai-generated-free-png.png|25.99|Burgers"
  "Pepperoni Pizza|Loaded with cheese and pepperoni slices|https://static.vecteezy.com/system/resources/previews/023/742/417/large_2x/pepperoni-pizza-isolated-illustration-ai-generative-free-png.png|30.99|Pizzas"
  "Bean Burrito|Stuffed with beans, rice, salsa|https://static.vecteezy.com/system/resources/previews/055/133/581/large_2x/deliciously-grilled-burritos-filled-with-beans-corn-and-fresh-vegetables-served-with-lime-wedge-and-cilantro-isolated-on-transparent-background-free-png.png|20.99|Burritos"
  "BBQ Bacon Burger|Smoky BBQ sauce, crispy bacon, cheddar|https://static.vecteezy.com/system/resources/previews/060/236/245/large_2x/a-large-hamburger-with-cheese-onions-and-lettuce-free-png.png|27.5|Burgers"
  "Chicken Caesar Wrap|Grilled chicken, lettuce, Caesar dressing|https://static.vecteezy.com/system/resources/previews/048/930/603/large_2x/caesar-wrap-grilled-chicken-isolated-on-transparent-background-free-png.png|21.5|Wraps"
  "Grilled Veggie Sandwich|Roasted veggies, pesto, cheese|https://static.vecteezy.com/system/resources/previews/047/832/012/large_2x/grilled-sesame-seed-bread-veggie-sandwich-with-tomato-and-onion-free-png.png|19.99|Sandwiches"
  "Double Patty Burger|Two juicy beef patties and cheese|https://static.vecteezy.com/system/resources/previews/060/359/627/large_2x/double-cheeseburger-with-lettuce-tomatoes-cheese-and-sesame-bun-free-png.png|32.99|Burgers"
  "Paneer Tikka Wrap|Spicy paneer, mint chutney, veggies|https://static.vecteezy.com/system/resources/previews/057/913/530/large_2x/delicious-wraps-a-tantalizing-array-of-wraps-filled-with-vibrant-vegetables-succulent-fillings-and-fresh-ingredients-artfully-arranged-for-a-mouthwatering-culinary-experience-free-png.png|23.99|Wraps"
  "Mexican Burrito Bowl|Rice, beans, corn, guac, salsa|https://static.vecteezy.com/system/resources/previews/057/466/374/large_2x/healthy-quinoa-bowl-with-avocado-tomato-and-black-beans-ingredients-free-png.png|26.49|Bowls"
  "Spicy Chicken Sandwich|Crispy chicken, spicy sauce, pickles|https://static.vecteezy.com/system/resources/previews/051/814/008/large_2x/a-grilled-chicken-sandwich-with-lettuce-and-tomatoes-free-png.png|24.99|Sandwiches"
  "Classic Margherita Pizza|Tomato, mozzarella, fresh basil|https://static.vecteezy.com/system/resources/previews/058/700/845/large_2x/free-isolated-on-transparent-background-delicious-pizza-topped-with-fresh-tomatoes-basil-and-melted-cheese-perfect-for-food-free-png.png|26.99|Pizzas"
  "Protein Power Bowl|Grilled chicken, quinoa, veggies|https://static.vecteezy.com/system/resources/previews/056/106/379/large_2x/top-view-salad-with-chicken-avocado-tomatoes-and-lettuce-free-png.png|29.99|Bowls"
  "Paneer Burrito|Paneer cubes, spicy masala, rice, beans|https://static.vecteezy.com/system/resources/previews/056/565/254/large_2x/burrito-with-cauliflower-and-vegetables-free-png.png|24.99|Burritos"
  "Chicken Club Sandwich|Grilled chicken, lettuce, cheese, tomato|https://static.vecteezy.com/system/resources/previews/060/364/135/large_2x/a-flavorful-club-sandwich-with-turkey-bacon-and-fresh-vegetables-sliced-and-isolated-on-a-transparent-background-free-png.png|27.49|Sandwiches"
)

CUSTOMIZATIONS=(
  "Extra Cheese|25.0|topping"
  "Jalapeños|20.0|topping"
  "Onions|10.0|topping"
  "Olives|15.0|topping"
  "Mushrooms|18.0|topping"
  "Tomatoes|10.0|topping"
  "Bacon|30.0|topping"
  "Avocado|35.0|topping"
  "Coke|30.0|side"
  "Fries|35.0|side"
  "Garlic Bread|40.0|side"
  "Chicken Nuggets|50.0|side"
  "Iced Tea|28.0|side"
  "Salad|33.0|side"
  "Potato Wedges|38.0|side"
  "Mozzarella Sticks|45.0|side"
  "Sweet Corn|25.0|side"
  "Choco Lava Cake|42.0|side"
)

echo "🚀 Starting to add ${#MENU_ITEMS[@]} items to Stripe..."

for item in "${MENU_ITEMS[@]}"; do
  IFS="|" read -r NAME DESCRIPTION IMAGE_URL PRICE CATEGORY <<< "$item"

  echo "📦 Creating product: $NAME ($CATEGORY)..."

  response=$(stripe products create \
    --api-key "$API_KEY" \
    --name "$NAME" \
    --description "$DESCRIPTION" \
    --url "$IMAGE_URL" \
    --data metadata[category]="$CATEGORY" 2>&1)

  if echo "$response" | grep -q '"id"'; then
    product_id=$(echo "$response" | jq -r '.id')
    echo "✅ Product created: $NAME ($product_id)"
  else
    echo "❌ Error creating $NAME"
    echo "$response"
    continue
  fi

  # Convert price to cents
  amount_cents=$(echo "$PRICE * 100" | bc | awk '{printf "%.0f", $0}')

  stripe prices create \
    --api-key "$API_KEY" \
    --unit-amount "$amount_cents" \
    --currency usd \
    --product "$product_id" >/dev/null

  echo "💵 Price set: $PRICE USD ($amount_cents cents)"
  echo ""
done

echo "🚀 Starting to add ${#CUSTOMIZATIONS[@]} customization options to Stripe..."

for item in "${CUSTOMIZATIONS[@]}"; do
  IFS="|" read -r NAME PRICE TYPE <<< "$item"

  echo "🍴 Creating customization: $NAME ($TYPE)..."

  # 1️⃣ Create product
  response=$(stripe products create \
    --api-key "$API_KEY" \
    --name "$NAME" \
    --description "Customization: $TYPE" \
    --data metadata[type]="$TYPE" 2>&1)

  # Show the raw response if there's a failure
  if ! echo "$response" | grep -q '"id"'; then
    echo "❌ Product creation failed for $NAME"
    echo "$response"
    echo ""
    continue
  fi

  product_id=$(echo "$response" | jq -r '.id')

  # 2️⃣ Convert price to cents
  amount_cents=$(echo "$PRICE * 100" | bc | awk '{printf "%.0f", $0}')

  # 3️⃣ Create price
  price_response=$(stripe prices create \
    --api-key "$API_KEY" \
    --unit-amount "$amount_cents" \
    --currency usd \
    --product "$product_id" 2>&1)

  # Check if the response is valid JSON
  if ! echo "$price_response" | grep -q '"id"'; then
    echo "❌ Price creation failed for $NAME"
    echo "$price_response"
    echo ""
    continue
  fi

  price_id=$(echo "$price_response" | jq -r '.id')

  echo "✅ Created $NAME ($TYPE): $product_id → $price_id"
  echo ""
done



echo "🎉 Done! All products added to Stripe test mode."
