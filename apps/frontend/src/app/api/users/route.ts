import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  
  const body = await req.json();
  const {fullname, username, email, password  } = body;
  
  if (!email || !password || !username  || !fullname) {
    return NextResponse.json({ message: "Email, password, and username are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      return NextResponse.json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: fullname,
        username,
        email,
        password: hashedPassword,
        provider: "credentials",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if(!newUser){
      return NextResponse.json({ message: "User not created" });
    }
    

    return NextResponse.json({ message: "User created" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err });
  }
}


export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);

  } catch (error) {
    console.log("[User]:",error);

  }
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { username ,isCheck} = body;
  const session = await getServerSession(authOptions);
  try {
    const userExists = await prisma.user.findUnique({
      where: { username },
  });
  

  if (!userExists ) {

    if(!isCheck){
      
        await prisma.user.update({
          where: { id: session.user.id }, 
          data: { username }, // Update username
      });
      
    }
      return Response.json({
        msg: 'Username updated',
        available:true
      })
  }
  return Response.json({ msg: 'Username is already taken',available:false });
   
  } catch (error) {
    console.log("Dynamic-[User]:",error);

  }

}