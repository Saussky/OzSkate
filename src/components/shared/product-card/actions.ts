/* eslint-disable @typescript-eslint/no-explicit-any */

import { validateRequest } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";

// TODO: There needs to be a way to make sure the product type doesn't get updated when the application performs product updates
export async function setProductTypes(
  productId: string,
  parentType: string, // TODO: Use real types
  childType: string
) {
  try {
    const { user } = await validateRequest();
    if (!user?.admin) return;

    return await prisma.product.update({
      where: { id: productId },
      data: {
        parentType,
        childType,
      },
    });
  } catch (error) {
    console.error("Error updating product types:", error);
    throw error;
  }
}