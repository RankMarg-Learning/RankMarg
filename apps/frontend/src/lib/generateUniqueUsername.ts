import prisma from "./prisma";

export async function generateUniqueUsername(emailPrefix:string):Promise<string> {
    let username:string;
    let isUnique = false;
  
    while (!isUnique) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
      username = `rm-${emailPrefix}-${randomSuffix}`;
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (!existingUser) {
        isUnique = true;
      }
    }
    return username;
  }
  