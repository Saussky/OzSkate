/*

For shoes, it will have variants that include the sizes
For one store, the shoe size was in the title with the format of M7 | W9
Same text is in option1 column, for two stores now

Consider adding another column to the variants table of 'size' for those items in the category of shoes
Then make a function which extracts the information from where needed and normalises it

for product_variant in products_in_shoes_category
    var info = extractInfoFrom([product_variant.title, product_variant.option1)
    updateProductVariantWithShoeSize(info)


Jimmy's skate store also has variant colourways and their sizes in it e.g "US 7 / Navy White" & "US 11 / Black/White"
that might be a later problem?
- Most stores don't do this

*/

function extractShoeSize(variantTitle: string, variantOption: string): number | null {
  const combinedString = `${variantTitle} ${variantOption}`.toLowerCase();
  const match = combinedString.match(/(?:us\s*)?(\d+(\.\d+)?)/); // Match sizes with or without 'US'
  return match ? parseFloat(match[1]) : null;
}

export function transformVariants(
  product: any,
  parentProductType: string | null,
  processFeaturedImage: (image: any) => any
) {
  return product.variants
    ? product.variants.map((variant: any) => {
        const baseVariant = {
          id: variant.id.toString(),
          productId: product.id.toString(),
          title: variant.title,
          option1: variant.option1 || null,
          option2: variant.option2 || null,
          option3: variant.option3 || null,
          sku: variant.sku,
          price: parseFloat(variant.price),
          compareAtPrice: variant.compare_at_price
            ? parseFloat(variant.compare_at_price)
            : null,
          position: variant.position,
          taxable: variant.taxable,
          featuredImage: processFeaturedImage(variant.featuredImage),
          available: variant.available,
          createdAt: new Date(variant.created_at),
          updatedAt: new Date(variant.updated_at),
        };
        
        if (parentProductType === 'Shoes') {
            const shoeSize = extractShoeSize(variant.title || '', variant.option1 || '');
            return {
                ...baseVariant,
                shoeSize: shoeSize ?? 0,
            };
        }
        
        return baseVariant;
      })
    : [];
}