"use server";
import { validateRequest } from "@/lib/cookies";
import { prisma } from "@/lib/prisma";
import { ChildType, ParentType } from "@/lib/types";

export async function setProductTypes(
  productId: string,
  parentType: ParentType, // TODO: Use real types
  childType: ChildType
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