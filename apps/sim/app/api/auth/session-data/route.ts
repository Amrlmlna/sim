import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createLogger } from "@/lib/logs/console/logger";

const logger = createLogger("SessionDataAPI");

export async function GET() {
  try {
    const cookieStore = await cookies();

    const sessionToken = cookieStore.get(
      "__Secure-better-auth.session_token"
    )?.value;
    const sessionData = cookieStore.get(
      "__Secure-better-auth.session_data"
    )?.value;
    const hasLoggedInBefore = cookieStore.get("has_logged_in_before")?.value;

    logger.info("Reading authentication cookies on the server...");

    if (!sessionToken || !sessionData) {
      logger.error("Authentication cookies not found on the server.");
      return NextResponse.json(
        { error: "Authentication cookies not found" },
        { status: 401 }
      );
    }

    logger.info("Successfully retrieved authentication cookies.");

    return NextResponse.json({
      sessionToken,
      sessionData,
      hasLoggedInBefore: hasLoggedInBefore || null,
    });
  } catch (error) {
    logger.error("Error fetching session data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
