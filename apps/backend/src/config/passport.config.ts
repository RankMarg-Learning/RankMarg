import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ServerConfig } from "./server.config";
import prisma from "@repo/db";
import { Role } from "@repo/db/enums";
import { createTrialSubscription } from "@/utils/subscription.util";
import { generateUniqueUsername } from "@/utils/username.util";

/**
 * Configure Passport JWT Strategy
 */
export const configurePassport = () => {
  // JWT Strategy for token authentication
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: (req) => {
          // First check cookies
          if (req.cookies && req.cookies["x-auth-token"]) {
            return req.cookies["x-auth-token"];
          }
          // Fall back to Authorization header
          return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        },
        secretOrKey: ServerConfig.security.jwtSecret,
      },
      async (jwtPayload, done) => {
        try {
          // Find the user by ID from the JWT payload
          const user = await prisma.user.findUnique({
            where: { id: jwtPayload.id },
            select: {
              id: true,
              email: true,
              username: true,
              role: true,
              subscription: {
                select: {
                  planId: true,
                  status: true,
                  currentPeriodEnd: true,
                },
              },
              examRegistrations: {
                select: {
                  exam: {
                    select: {
                      code: true,
                    },
                  },
                },
                take: 1,
              },
            },
          });

          if (!user) {
            return done(null, false);
          }

          // Return user data to be attached to request
          return done(null, {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            plan: {
              id: user.subscription?.planId ?? null,
              status: user.subscription?.status,
              endAt: user.subscription?.currentPeriodEnd ?? null,
            },
            examCode: user.examRegistrations[0]?.exam.code ?? "",
          });
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Google OAuth Strategy
  if (
    ServerConfig.oauth.google.clientID &&
    ServerConfig.oauth.google.clientSecret
  ) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: ServerConfig.oauth.google.clientID,
          clientSecret: ServerConfig.oauth.google.clientSecret,
          callbackURL: ServerConfig.oauth.google.callbackURL,
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            // Google provides verified emails
            const email = profile.emails?.[0]?.value;

            if (!email) {
              return done(new Error("Google account has no email"), false);
            }

            // Check if user exists
            let user = await prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
                role: true,
                onboardingCompleted: true,
                subscription: {
                  select: {
                    planId: true,
                    status: true,
                    currentPeriodEnd: true,
                  },
                },
                examRegistrations: {
                  select: {
                    exam: {
                      select: {
                        code: true,
                      },
                    },
                  },
                  take: 1,
                },
              },
            });

            // Create new user if not exists
            if (!user) {
              const name = profile.displayName || "";
              const avatar = profile.photos?.[0]?.value || null;
              const emailPrefix = email.split("@")[0];
              const username = await generateUniqueUsername(emailPrefix);

              // Create new user
              user = await prisma.user.create({
                data: {
                  name,
                  email,
                  username,
                  avatar,
                  provider: "google",
                  onboardingCompleted: false,
                  role: Role.USER,
                  subscription: {
                    create: createTrialSubscription(),
                  },
                },
                select: {
                  id: true,
                  email: true,
                  username: true,
                  avatar: true,
                  role: true,
                  onboardingCompleted: true,
                  subscription: {
                    select: {
                      planId: true,
                      status: true,
                      currentPeriodEnd: true,
                    },
                  },
                  examRegistrations: {
                    select: {
                      exam: {
                        select: {
                          code: true,
                        },
                      },
                    },
                    take: 1,
                  },
                },
              });
            }

            // Return user data
            return done(null, {
              id: user.id,
              email: user.email,
              username: user.username,
              image: user.avatar,
              role: user.role,
              isNewUser: !user.onboardingCompleted,
              plan: {
                id: user.subscription?.planId ?? null,
                status: user.subscription?.status,
                endAt: user.subscription?.currentPeriodEnd ?? null,
              },
              examCode: user.examRegistrations[0]?.exam.code ?? "",
            });
          } catch (error) {
            return done(error, false);
          }
        }
      )
    );
  }

  // Session serialization/deserialization
  passport.serializeUser((user: Express.User, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: Express.User, done) => {
    done(null, user);
  });
};

export default configurePassport;
