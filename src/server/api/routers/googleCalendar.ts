import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const googleRouter = createTRPCRouter({
  getGoogleEventsInUserCalendar: protectedProcedure.query(
    async ({ ctx, input }) => {
      const calendarID = env.GOOGLE_CALENDAR_ID;

      const accessToken = ctx.session.accessToken;
      try {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          return {
            error: errorData.error.message,
          };
        }

        const data = await response.json();
        return { data };
      } catch (error) {
        return { error: "Internal Server Error" };
      }
    },
  ),
  createGoogleEventInUserCalendar: protectedProcedure
    .input(
      z.object({
        eventDetails: z.object({
          colorId: z.string(),
          summary: z.string(),
          description: z.string(),
          start: z.object({
            date: z.string().optional(),
            dateTime: z.string().optional(),
          }),
          end: z.object({
            date: z.string().optional(),
            dateTime: z.string().optional(),
          }),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const calendarID = env.GOOGLE_CALENDAR_ID;

      const accessToken = ctx.session.accessToken;

      try {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...input.eventDetails,
              reminders: {
                useDefault: false,
                overrides: [
                  { method: "email", minutes: 24 * 60 },
                  { method: "popup", minutes: 2 * 24 * 60 },
                  { method: "popup", minutes: 60 },
                  { method: "popup", minutes: 10 },
                ],
              },
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          return {
            error: errorData.error.message,
          };
        }

        const data = await response.json();
        return { data };
      } catch (error) {
        return { error: "Internal Server Error" };
      }
    }),
});
