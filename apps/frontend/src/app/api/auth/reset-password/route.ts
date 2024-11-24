import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req:Request){
    try {
        const body = await req.json();
        const { token, password } = body;
        if (!token || !password) {
            return Response.json({ msg: 'Token and password are required.' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_RESET);

        if (!decodedToken) {
            return Response.json({ msg: 'Invalid or expired token.' });
        }
        const { email, purpose } = decodedToken as { email: string; purpose: string };

        if (purpose !== "password-reset") {
            return Response.json({ msg: "Invalid token purpose." });
          }
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            return Response.json({ msg: "User not found." });
          }
          const hashedPassword = await bcrypt.hash(password, 10);

            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword },
            });
            return Response.json({ msg: 'Password reset successfully.' });



    } catch (error) {
        console.error(error);
        return Response.json({ msg: 'Internal server error.' });
        
    }



}