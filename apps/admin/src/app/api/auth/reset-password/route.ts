import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { jsonResponse } from "@/utils/api-response";

export async function POST(req:Request){
    try {
        const body = await req.json();
        const { token, password } = body;
        if (!token || !password) {
            return jsonResponse(null,{success:false,message:"Token and password are required.",status:400});
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedToken) {
            return jsonResponse(null,{success:false,message:"Invalid token.",status:401});
        }
        const { email, purpose } = decodedToken as { email: string; purpose: string };

        if (purpose !== "password-reset") {
            return jsonResponse(null,{success:false,message:"Invalid token purpose.",status:401});
          }

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            return jsonResponse(null,{success:false,message:"User not found.",status:404});
          }
          const hashedPassword = await bcrypt.hash(password, 10);

            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword },
            });
            return jsonResponse(null,{success:true,message:"Password reset successfully.",status:200});


    } catch (error) {
        console.error(error);
        if (error.name === "JsonWebTokenError") {
            return jsonResponse(null,{success:false,message:"Invalid Rest Link.",status:401});
          }
        return jsonResponse(null,{success:false,message:"Internal Server Error",status:500});
        
    }



}