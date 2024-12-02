import { ParentProductType, ChildProductType } from "./types";

export function mapProductType(productType: string): {
  parentProductType: ParentProductType;
  childProductType: ChildProductType;
} {
  const normalizedProductType = productType.trim().toLowerCase();

  console.log("normalised product", normalizedProductType);

  // Clothing
  if (
    /shirt|tee|t-shirt|t shirt|longsleeve|l\/s|polo|singlet|tank|jersey/.test(
      normalizedProductType
    )
  ) {
    if (/women|womens|ladies|female/.test(normalizedProductType)) {
      if (/longsleeve|l\/s/.test(normalizedProductType)) {
        return {
          parentProductType: "Clothing",
          childProductType: "Womens Shirts",
        };
      }
      return {
        parentProductType: "Clothing",
        childProductType: "Womens T-Shirts",
      };
    } else if (/men|mens|male/.test(normalizedProductType)) {
      if (/longsleeve|l\/s/.test(normalizedProductType)) {
        return {
          parentProductType: "Clothing",
          childProductType: "Mens Shirts",
        };
      }
      return {
        parentProductType: "Clothing",
        childProductType: "Mens T-Shirts",
      };
    }
    return {
      parentProductType: "Clothing",
      childProductType: "Mens T-Shirts",
    };
  }

  if (
    /hoodie|jumper|crew|sweatshirt|pullover|fleece|zip hoodie/.test(
      normalizedProductType
    )
  ) {
    if (/women|womens|ladies|female/.test(normalizedProductType)) {
      return {
        parentProductType: "Clothing",
        childProductType: "Womens Jumpers",
      };
    } else if (/men|mens|male/.test(normalizedProductType)) {
      return {
        parentProductType: "Clothing",
        childProductType: "Mens Jumpers",
      };
    }
    return {
      parentProductType: "Clothing",
      childProductType: "Mens Jumpers",
    };
  }

  if (/pant|jean|denim|cord/.test(normalizedProductType)) {
    if (/women|womens|ladies|female/.test(normalizedProductType)) {
      return {
        parentProductType: "Clothing",
        childProductType: "Womens Pants",
      };
    } else if (/men|mens|male/.test(normalizedProductType)) {
      return {
        parentProductType: "Clothing",
        childProductType: "Mens Pants",
      };
    }
    return {
      parentProductType: "Clothing",
      childProductType: "Mens Pants",
    };
  }

  if (/short/.test(normalizedProductType)) {
    if (/women|womens|ladies|female/.test(normalizedProductType)) {
      return {
        parentProductType: "Clothing",
        childProductType: "Womens Shorts",
      };
    } else if (/men|mens|male/.test(normalizedProductType)) {
      return {
        parentProductType: "Clothing",
        childProductType: "Mens Shorts",
      };
    }
    return {
      parentProductType: "Clothing",
      childProductType: "Mens Shorts",
    };
  }

  if (
    /hat|cap|beanie|headwear|bucket hat|boonie|balaclava|ski mask/.test(
      normalizedProductType
    )
  ) {
    if (/beanie/.test(normalizedProductType)) {
      return { parentProductType: "Clothing", childProductType: "Beanies" };
    }
    return { parentProductType: "Clothing", childProductType: "Hats" };
  }

  if (/sock/.test(normalizedProductType)) {
    return { parentProductType: "Clothing", childProductType: "Socks" };
  }

  // Skateboards
  if (/skateboarding/.test(normalizedProductType)) {
    return { parentProductType: "Skateboards", childProductType: "Decks" };
  }

  if (/deck/.test(normalizedProductType)) {
    return { parentProductType: "Skateboards", childProductType: "Decks" };
  }

  if (/complete|longboard|cruiser|surf skate/.test(normalizedProductType)) {
    return { parentProductType: "Skateboards", childProductType: "Completes" };
  }

  if (/truck/.test(normalizedProductType)) {
    return { parentProductType: "Skateboards", childProductType: "Trucks" };
  }

  if (/wheel/.test(normalizedProductType)) {
    return { parentProductType: "Skateboards", childProductType: "Wheels" };
  }

  if (/bearing/.test(normalizedProductType)) {
    return { parentProductType: "Skateboards", childProductType: "Bearings" };
  }

  // Protective Gear
  if (/helmet/.test(normalizedProductType)) {
    return {
      parentProductType: "Protective Gear",
      childProductType: "Helmets",
    };
  }

  if (/pad|guard|protective|safety/.test(normalizedProductType)) {
    return { parentProductType: "Protective Gear", childProductType: "Pads" };
  }

  // Shoes
  if (
    /shoe|footwear|boot|sneaker|trainer|slip on|slides|sandals/.test(
      normalizedProductType
    )
  ) {
    return { parentProductType: "Shoes", childProductType: "Shoes" };
  }

  // Bags
  if (
    /backpack|bag|luggage|duffel|tote|bum bag|hip bag|shoulder bag/.test(
      normalizedProductType
    )
  ) {
    if (/backpack/.test(normalizedProductType)) {
      return { parentProductType: "Bags", childProductType: "Backpacks" };
    } else if (/tote/.test(normalizedProductType)) {
      return { parentProductType: "Bags", childProductType: "Tote Bags" };
    }
    return { parentProductType: "Bags", childProductType: "Backpacks" };
  }

  // Accessories
  if (/belt/.test(normalizedProductType)) {
    return { parentProductType: "Accessories", childProductType: "Belts" };
  }

  if (/watch/.test(normalizedProductType)) {
    return { parentProductType: "Accessories", childProductType: "Watches" };
  }

  if (/sunglass|sunnies/.test(normalizedProductType)) {
    return { parentProductType: "Accessories", childProductType: "Sunglasses" };
  }

  if (
    /book|magazine|publication|literature|poster|dvd|vinyl/.test(
      normalizedProductType
    )
  ) {
    return { parentProductType: "Accessories", childProductType: "Literature" };
  }

  if (/wax/.test(normalizedProductType)) {
    return { parentProductType: "Accessories", childProductType: "Wax" };
  }

  if (/keychain|key chain/.test(normalizedProductType)) {
    return { parentProductType: "Accessories", childProductType: "Keychains" };
  }

  if (
    /jewellery|jewelry|ring|necklace|bracelet|earring|patch|pin/.test(
      normalizedProductType
    )
  ) {
    return { parentProductType: "Accessories", childProductType: "Jewellery" };
  }

  // Default to Accessories -> Other
  return { parentProductType: "Accessories", childProductType: "Other" };
}
