import express, { Express } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
const app: Express = express();

import cookieParser from "cookie-parser";
import errorhandler from "./middlewares/errorHandler";
import swaggerDocument from "./utils/swagger";
import swaggerUi from "swagger-ui-express";
import authRoute from "./Routes/auth.route";
import userRoute from "./Routes/user.route";
import permissionRoute from "./Routes/permission.route";
import memberRoute from "./Routes/member.route";
import albumRoute from "./Routes/album.route";
import financialRoute from "./Routes/financial.route";
import eventRoute from "./Routes/event.route";
import advertisementRoute from "./Routes/advertisement.route";
import notificationRoute from "./Routes/notification.route";

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://elsaqr-family-saas-web-app-56kk.vercel.app",
        "https://*.vercel.app",
        "https://web.postman.co",
        "http://localhost:5173",
      ]
    : [
        "http://localhost:5173",
        "https://www.getpostman.com",
        "http://localhost:3001",
        "http://localhost:8080",
        undefined,
      ];
const vercelOriginRegex = /^https:\/\/.*\.vercel\.app$/;

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV === "production" &&
          vercelOriginRegex.test(origin));

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      " x-vercel-project-id",
    ],
    exposedHeaders: ["set-cookie"],
  })
);

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Logger for development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/permission", permissionRoute);
app.use("/api/v1/member", memberRoute);
app.use("/api/v1/album", albumRoute);
app.use("/api/v1/financial", financialRoute);
app.use("/api/v1/event", eventRoute);
app.use("/api/v1/advertisement", advertisementRoute);
app.use("/api/v1/notification", notificationRoute);

// check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running",
    documentation: "/api-docs",
  });
});

// Error handler
app.use(errorhandler);

export default app;
