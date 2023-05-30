import NextAuth from "next-auth";
import User from "@models/user";
import { connectToDb } from "@utils/database";
import GoogleProvider from "next-auth/providers/google";
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    //*handle sessiom
    async session({ session }) {
      const sessionUser = await User.findOne({
        email: session.user.email,
      });
      session.user.id = sessionUser._id.toString();

      return session;
    },
    //* handle singIn
    async signIn({ profile }) {
      try {
        //* serverless -> lamda function
        await connectToDb();

        //check if user already exist
        const isUserExist = await User.findOne({ email: profile.email });

        //if not crate a user
        if (!isUserExist) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image: profile.picture,
          });
        }

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
