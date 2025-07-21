import { logger } from "@/lib/logger";
import { AgentService } from "@/services/agent.service";

export const agentJob = async () => {
  try {
    logger.info("Agent Job Started......");

    const agent = new AgentService();
    await agent.processAllStudents();

    logger.info("Agent Job completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
