import prisma from "@repo/db";

/**
 * Generate a unique username based on an email prefix
 * Appends numbers to make it unique if needed
 */
export const generateUniqueUsername = async (
  prefix: string
): Promise<string> => {
  // Clean prefix - remove special characters and spaces
  let baseUsername = prefix
    .toLowerCase()
    .replace(/[^\w]/g, "")
    .replace(/\s+/g, "_");

  // Ensure username meets minimum length requirement
  if (baseUsername.length < 3) {
    baseUsername = `user_${baseUsername}`;
  }

  let username = baseUsername;
  let counter = 1;
  let isUnique = false;

  // Find a unique username by appending numbers if needed
  while (!isUnique) {
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!existingUser) {
      isUnique = true;
    } else {
      username = `${baseUsername}${counter++}`;
    }
  }

  return username;
};
