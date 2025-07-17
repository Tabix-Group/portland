-- CreateTable
CREATE TABLE "Minute" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "meetingDate" TEXT NOT NULL,
    "meetingTime" TEXT NOT NULL,
    "nextMeetingDate" TEXT,
    "nextMeetingTime" TEXT,
    "nextMeetingNotes" TEXT,
    "participantIds" TEXT[],
    "participants" JSONB NOT NULL,
    "occasionalParticipants" JSONB NOT NULL,
    "informedPersons" JSONB NOT NULL,
    "topicGroups" JSONB NOT NULL,
    "topicsDiscussed" JSONB NOT NULL,
    "decisions" JSONB NOT NULL,
    "pendingTasks" JSONB NOT NULL,
    "internalNotes" TEXT,
    "tags" JSONB NOT NULL,
    "files" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectIds" TEXT[],

    CONSTRAINT "Minute_pkey" PRIMARY KEY ("id")
);
